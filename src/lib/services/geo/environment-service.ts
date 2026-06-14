import type { GeoLayerBundle, GeoQueryContext } from "@/types/geo";
import { emptyGeoLayer } from "@/lib/geo/empty-geo";
import { getGeoConfig } from "./geo-service";

async function overpassEnvQuery(lat: number, lng: number, radiusM: number): Promise<GeoLayerBundle[]> {
  const { overpassBase } = getGeoConfig();
  const query = `[out:json][timeout:25];
(
  way["leisure"="park"](around:${radiusM},${lat},${lng});
  way["natural"="water"](around:${radiusM},${lat},${lng});
  way["landuse"="forest"](around:${radiusM},${lat},${lng});
);
out geom 15;`;

  const res = await fetch(overpassBase, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("overpass env fail");
  const json = (await res.json()) as { elements: { tags?: Record<string, string>; geometry?: { lat: number; lon: number }[] }[] };

  const envFeatures = (json.elements ?? []).slice(0, 12).map((el, i) => ({
    type: "Feature" as const,
    properties: {
      type: el.tags?.leisure ?? el.tags?.natural ?? el.tags?.landuse ?? "green",
      weight: 0.35 + (i % 4) * 0.1,
    },
    geometry: {
      type: "Polygon" as const,
      coordinates: [(el.geometry ?? []).map((p) => [p.lon, p.lat] as [number, number])],
    },
  })).filter((f) => f.geometry.coordinates[0]?.length > 2);

  return [
    {
      key: "environment",
      label: "Environmental Zones",
      color: "#15803D",
      data: { type: "FeatureCollection", features: envFeatures },
    },
  ];
}

export async function fetchEnvironmentLayers(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
): Promise<{ layers: GeoLayerBundle[]; environmentalSensitivity: number }> {
  try {
    const layers = await overpassEnvQuery(ctx.coords.lat, ctx.coords.lng, 5000);
    const featureCount = layers[0]?.data.features.length ?? 0;
    const sensitivity = Math.min(100, Math.max(20, 100 - featureCount * 8));
    return { layers, environmentalSensitivity: sensitivity };
  } catch {
    return {
      layers: [emptyGeoLayer("environment", "Environmental Zones (unavailable)", "#15803D")],
      environmentalSensitivity: 0,
    };
  }
}

export async function fetchEconomicLayer(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
): Promise<GeoLayerBundle> {
  const { overpassBase } = getGeoConfig();
  const query = `[out:json][timeout:25];way["landuse"~"commercial|retail|industrial"](around:5000,${ctx.coords.lat},${ctx.coords.lng});out geom 12;`;
  try {
    const res = await fetch(overpassBase, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error("fail");
    const json = (await res.json()) as { elements: { geometry?: { lat: number; lon: number }[] }[] };
    return {
      key: "economic",
      label: "Economic Activity",
      color: "#CA8A04",
      data: {
        type: "FeatureCollection",
        features: (json.elements ?? []).slice(0, 10).map((el, i) => ({
          type: "Feature" as const,
          properties: { weight: 0.4 + (i % 3) * 0.15 },
          geometry: {
            type: "Polygon" as const,
            coordinates: [(el.geometry ?? []).map((p) => [p.lon, p.lat] as [number, number])],
          },
        })).filter((f) => f.geometry.coordinates[0]?.length > 2),
      },
    };
  } catch {
    return emptyGeoLayer("economic", "Economic Activity (unavailable)", "#CA8A04");
  }
}
