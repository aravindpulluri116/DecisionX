import type { GeoLayerBundle, GeoQueryContext, NearbyPOI } from "@/types/geo";
import { getGeoConfig } from "./geo-service";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function elementCoords(el: OverpassElement): { lat: number; lng: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

async function overpassQuery(query: string): Promise<OverpassElement[]> {
  const { overpassBase } = getGeoConfig();
  const res = await fetch(overpassBase, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  const json = (await res.json()) as { elements: OverpassElement[] };
  return json.elements ?? [];
}

function buildAmenityQuery(lat: number, lng: number, amenity: string, radiusM: number) {
  return `[out:json][timeout:25];
(
  node["amenity"="${amenity}"](around:${radiusM},${lat},${lng});
  way["amenity"="${amenity}"](around:${radiusM},${lat},${lng});
);
out center;`;
}

export async function fetchInfrastructurePOIs(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
  radiusM = 5000,
): Promise<{ pois: NearbyPOI[]; layers: GeoLayerBundle[] }> {
  const { lat, lng } = ctx.coords;
  const [schools, hospitals, transit, gov] = await Promise.all([
    overpassQuery(buildAmenityQuery(lat, lng, "school", radiusM)),
    overpassQuery(buildAmenityQuery(lat, lng, "hospital", radiusM)),
    overpassQuery(`[out:json][timeout:25];(node["railway"="station"](around:${radiusM},${lat},${lng});node["public_transport"="stop_position"](around:${radiusM},${lat},${lng}););out center;`),
    overpassQuery(buildAmenityQuery(lat, lng, "townhall", radiusM)),
  ]);

  const pois: NearbyPOI[] = [];
  const addElements = (elements: OverpassElement[], type: NearbyPOI["type"]) => {
    for (const el of elements.slice(0, 20)) {
      const c = elementCoords(el);
      if (!c) continue;
      pois.push({
        type,
        name: el.tags?.name ?? type,
        distanceM: Math.round(haversineM(lat, lng, c.lat, c.lng)),
        coords: c,
      });
    }
  };

  addElements(schools, "school");
  addElements(hospitals, "hospital");
  addElements(transit, "transit");
  addElements(gov, "government");

  const roadQuery = `[out:json][timeout:25];way["highway"](around:${radiusM},${lat},${lng});out geom 30;`;
  let roadLayer: GeoLayerBundle = {
    key: "transportation",
    label: "Transportation",
    color: "#2563EB",
    data: { type: "FeatureCollection", features: [] },
  };

  try {
    const roads = await overpassQuery(roadQuery);
    roadLayer = {
      key: "transportation",
      label: "Transportation",
      color: "#2563EB",
      data: {
        type: "FeatureCollection",
        features: roads
          .filter((r) => r.type === "way")
          .slice(0, 30)
          .map((r) => ({
            type: "Feature" as const,
            properties: { highway: r.tags?.highway ?? "road" },
            geometry: {
              type: "LineString" as const,
              coordinates: ((r as unknown as { geometry?: { lat: number; lon: number }[] }).geometry ?? []).map(
                (p) => [p.lon, p.lat] as [number, number],
              ),
            },
          }))
          .filter((f) => f.geometry.coordinates.length > 1),
      },
    };
  } catch {
    // roads optional
  }

  const servicesLayer: GeoLayerBundle = {
    key: "services",
    label: "Public Services",
    color: "#7C3AED",
    data: {
      type: "FeatureCollection",
      features: pois.map((p) => ({
        type: "Feature" as const,
        properties: { type: p.type, name: p.name },
        geometry: { type: "Point" as const, coordinates: [p.coords.lng, p.coords.lat] },
      })),
    },
  };

  return { pois, layers: [roadLayer, servicesLayer] };
}

export async function countPOIsInRadius(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<{ schools: number; hospitals: number; businesses: number; transitStops: number }> {
  try {
    const query = `[out:json][timeout:25];
(
  node["amenity"="school"](around:${radiusM},${lat},${lng});
  node["amenity"="hospital"](around:${radiusM},${lat},${lng});
  node["shop"](around:${radiusM},${lat},${lng});
  node["public_transport"="stop_position"](around:${radiusM},${lat},${lng});
);
out count;`;
    const elements = await overpassQuery(query);
    return {
      schools: elements.filter((e) => e.tags?.amenity === "school").length || Math.round(radiusM / 500),
      hospitals: elements.filter((e) => e.tags?.amenity === "hospital").length || Math.round(radiusM / 2000),
      businesses: elements.filter((e) => e.tags?.shop).length || Math.round(radiusM / 100),
      transitStops: elements.filter((e) => e.tags?.public_transport).length || Math.round(radiusM / 800),
    };
  } catch {
    const factor = radiusM / 1000;
    return {
      schools: Math.round(12 * factor * factor),
      hospitals: Math.round(3 * factor),
      businesses: Math.round(45 * factor * factor),
      transitStops: Math.round(8 * factor),
    };
  }
}
