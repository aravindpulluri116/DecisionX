import type { GeoLayerBundle, GeoQueryContext, RadiusImpact } from "@/types/geo";
import { getMockLocationIntelligence } from "@/lib/geo/mock-geo";
import { countPOIsInRadius } from "./infrastructure-service";
import { getGeoConfig } from "./geo-service";

const DENSITY_PRESETS: Record<string, number> = {
  hyderabad: 4200,
  mumbai: 21000,
  bangalore: 5800,
  telangana: 3100,
};

function densityForLocation(location: string): number {
  const key = location.toLowerCase();
  if (key.includes("mumbai")) return DENSITY_PRESETS.mumbai;
  if (key.includes("bangalore") || key.includes("bengaluru")) return DENSITY_PRESETS.bangalore;
  if (key.includes("telangana")) return DENSITY_PRESETS.telangana;
  return DENSITY_PRESETS.hyderabad;
}

async function fetchResidentialZones(lat: number, lng: number, radiusM: number): Promise<GeoLayerBundle> {
  const { overpassBase } = getGeoConfig();
  const query = `[out:json][timeout:25];way["landuse"="residential"](around:${radiusM},${lat},${lng});out geom 20;`;
  try {
    const res = await fetch(overpassBase, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error("overpass fail");
    const json = (await res.json()) as {
      elements: { geometry?: { lat: number; lon: number }[] }[];
    };
    return {
      key: "population",
      label: "Population",
      color: "#0F172A",
      data: {
        type: "FeatureCollection",
        features: (json.elements ?? []).slice(0, 15).map((el, i) => ({
          type: "Feature" as const,
          properties: { weight: 0.3 + (i % 5) * 0.12 },
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              (el.geometry ?? []).map((p) => [p.lon, p.lat] as [number, number]),
            ],
          },
        })).filter((f) => f.geometry.coordinates[0]?.length > 2),
      },
    };
  } catch {
    return getMockLocationIntelligence("", { lat, lng }).layers.find((l) => l.key === "population")!;
  }
}

export async function buildRadiusImpacts(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
): Promise<RadiusImpact[]> {
  const { lat, lng } = ctx.coords;
  const density = densityForLocation(ctx.location);
  const radii = [1, 5, 10] as const;

  const impacts: RadiusImpact[] = [];
  for (const km of radii) {
    const radiusM = km * 1000;
    const areaKm2 = Math.PI * km * km;
    const counts = await countPOIsInRadius(lat, lng, radiusM);
    impacts.push({
      radiusKm: km,
      populationEstimate: Math.round(density * areaKm2 * 0.6),
      schools: counts.schools,
      hospitals: counts.hospitals,
      businesses: counts.businesses,
      transitStops: counts.transitStops,
    });
  }
  return impacts;
}

export async function fetchPopulationLayer(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
): Promise<GeoLayerBundle> {
  return fetchResidentialZones(ctx.coords.lat, ctx.coords.lng, 5000);
}

export function computePopulationScores(
  location: string,
  radiusImpacts: RadiusImpact[],
): { populationDensity: number; urbanDensity: number } {
  const base = densityForLocation(location);
  const r5 = radiusImpacts.find((r) => r.radiusKm === 5);
  const densityScore = Math.min(100, Math.round((base / 250) * 10));
  const urbanScore = Math.min(100, Math.round(((r5?.businesses ?? 100) / 500) * 100));
  return { populationDensity: densityScore, urbanDensity: urbanScore };
}
