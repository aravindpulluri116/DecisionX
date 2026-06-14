import type { GeoLayerBundle, GeoQueryContext, RadiusImpact } from "@/types/geo";
import { emptyGeoLayer } from "@/lib/geo/empty-geo";
import { countPOIsInRadius } from "./infrastructure-service";
import { getGeoConfig } from "./geo-service";

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
    return emptyGeoLayer("population", "Population (unavailable)", "#0F172A");
  }
}

/** Estimate population from residential polygon area in OSM (no city presets). */
function estimatePopulationFromResidential(
  residentialFeatureCount: number,
  radiusKm: number,
): number {
  if (residentialFeatureCount === 0) return 0;
  const areaKm2 = Math.PI * radiusKm * radiusKm;
  const avgDensityPerKm2 = Math.min(15000, residentialFeatureCount * 800);
  return Math.round(areaKm2 * avgDensityPerKm2 * 0.5);
}

export async function buildRadiusImpacts(
  ctx: GeoQueryContext & { coords: { lat: number; lng: number } },
): Promise<RadiusImpact[]> {
  const { lat, lng } = ctx.coords;
  const radii = [1, 5, 10] as const;

  const popLayer = await fetchResidentialZones(lat, lng, 5000);
  const residentialCount = popLayer.data.features.length;

  const impacts: RadiusImpact[] = [];
  for (const km of radii) {
    const radiusM = km * 1000;
    const counts = await countPOIsInRadius(lat, lng, radiusM);
    impacts.push({
      radiusKm: km,
      populationEstimate: estimatePopulationFromResidential(residentialCount, km),
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
  radiusImpacts: RadiusImpact[],
): { populationDensity: number; urbanDensity: number } {
  const r5 = radiusImpacts.find((r) => r.radiusKm === 5);
  const r1 = radiusImpacts.find((r) => r.radiusKm === 1);
  const pop5 = r5?.populationEstimate ?? 0;
  const densityScore = pop5 > 0 ? Math.min(100, Math.round(Math.log10(pop5 + 1) * 18)) : 0;
  const urbanScore = Math.min(100, Math.round(((r5?.businesses ?? 0) / 500) * 100));
  const infraBoost = Math.min(20, (r1?.transitStops ?? 0) * 2);
  return { populationDensity: densityScore, urbanDensity: Math.min(100, urbanScore + infraBoost) };
}
