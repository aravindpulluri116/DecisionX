import circle from "@turf/circle";
import type { FeatureCollection, Polygon } from "geojson";
import type { GeoBBox, GeoCoordinates, GeoQueryContext, ProjectGeo } from "@/types/geo";
import { getCityCoords } from "@/lib/geo/mock-geo";

const NOMINATIM_BASE =
  process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";

export function getGeoConfig() {
  return {
    nominatimBase: NOMINATIM_BASE,
    overpassBase: process.env.OVERPASS_BASE_URL ?? "https://overpass-api.de/api/interpreter",
    mapStyle: process.env.OPENFREEMAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/liberty",
  };
}

export async function geocodeAddress(address: string): Promise<ProjectGeo | null> {
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DecisionX/1.0 (decision intelligence platform)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      boundingbox: [string, string, string, string];
    }[];
    if (!data[0]) return null;
    const item = data[0];
    const bbox: GeoBBox = [
      parseFloat(item.boundingbox[2]),
      parseFloat(item.boundingbox[0]),
      parseFloat(item.boundingbox[3]),
      parseFloat(item.boundingbox[1]),
    ];
    return {
      coords: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
      address: item.display_name,
      bbox,
    };
  } catch {
    return null;
  }
}

export async function resolveProjectGeo(ctx: GeoQueryContext): Promise<ProjectGeo> {
  if (ctx.coords) {
    return {
      coords: ctx.coords,
      address: ctx.location,
      projectArea: ctx.projectArea,
    };
  }
  const geocoded = await geocodeAddress(ctx.location);
  if (geocoded) return { ...geocoded, projectArea: ctx.projectArea };
  return {
    coords: getCityCoords(ctx.location),
    address: ctx.location,
    projectArea: ctx.projectArea,
  };
}

export function buildRadiusCircles(
  coords: GeoCoordinates,
  radiiKm: number[] = [1, 5, 10],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: radiiKm.map((km) => {
      const feat = circle([coords.lng, coords.lat], km, { units: "kilometers", steps: 64 });
      return { ...feat, properties: { ...feat.properties, radiusKm: km } };
    }),
  };
}

export function buildRadiusPolygon(coords: GeoCoordinates, radiusKm: number): Polygon {
  const feat = circle([coords.lng, coords.lat], radiusKm, { units: "kilometers", steps: 32 });
  return feat.geometry as Polygon;
}
