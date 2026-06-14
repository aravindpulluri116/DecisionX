import type { GeoQueryContext, LocationIntelligence, LocationScores } from "@/types/geo";
import { buildUnavailableLocationIntelligence } from "@/lib/geo/empty-geo";
import { resolveProjectGeo } from "./geo-service";
import { fetchInfrastructurePOIs } from "./infrastructure-service";
import {
  buildRadiusImpacts,
  computePopulationScores,
  fetchPopulationLayer,
} from "./population-service";
import { fetchEnvironmentLayers, fetchEconomicLayer } from "./environment-service";

function buildSummary(intelligence: Pick<LocationIntelligence, "radiusImpacts" | "scores" | "nearbyPOIs">): string {
  const r5 = intelligence.radiusImpacts.find((r) => r.radiusKm === 5);
  const schools = r5?.schools ?? 0;
  const hospitals = r5?.hospitals ?? 0;
  const density = intelligence.scores.populationDensity;
  const commercial = intelligence.nearbyPOIs.some((p) => p.type === "commercial");
  return `${schools} schools and ${hospitals} hospitals within 5km. Population density score: ${density}/100.${commercial ? " Strong commercial activity nearby." : ""}`;
}

function computeAccessibility(pois: LocationIntelligence["nearbyPOIs"], radiusImpacts: LocationIntelligence["radiusImpacts"]): number {
  const transit = pois.filter((p) => p.type === "transit").length;
  const r1 = radiusImpacts.find((r) => r.radiusKm === 1);
  return Math.min(100, Math.round(transit * 15 + (r1?.transitStops ?? 0) * 3 + 40));
}

function computeInfrastructure(radiusImpacts: LocationIntelligence["radiusImpacts"]): number {
  const r5 = radiusImpacts.find((r) => r.radiusKm === 5);
  if (!r5) return 0;
  return Math.min(100, Math.round((r5.schools + r5.hospitals * 3 + r5.transitStops) / 2));
}

export async function buildLocationIntelligence(ctx: GeoQueryContext): Promise<LocationIntelligence> {
  const now = new Date().toISOString();

  let geo: Awaited<ReturnType<typeof resolveProjectGeo>>;
  try {
    geo = await resolveProjectGeo(ctx);
  } catch {
    return buildUnavailableLocationIntelligence(ctx.location, ctx.coords);
  }

  const fullCtx = { ...ctx, coords: geo.coords };

  try {
    const [infra, radiusImpacts, popLayer, envResult, economicLayer] = await Promise.all([
      fetchInfrastructurePOIs(fullCtx, 5000).catch(() => ({ pois: [], layers: [] })),
      buildRadiusImpacts(fullCtx),
      fetchPopulationLayer(fullCtx),
      fetchEnvironmentLayers(fullCtx),
      fetchEconomicLayer(fullCtx),
    ]);

    const popScores = computePopulationScores(radiusImpacts);
    const scores: LocationScores = {
      ...popScores,
      environmentalSensitivity: envResult.environmentalSensitivity,
      accessibilityScore: computeAccessibility(infra.pois, radiusImpacts),
      infrastructureScore: computeInfrastructure(radiusImpacts),
    };

    const layers = [popLayer, ...infra.layers, ...envResult.layers, economicLayer];

    const intelligence: LocationIntelligence = {
      summary: "",
      coords: geo.coords,
      address: geo.address,
      nearbyPOIs: infra.pois.slice(0, 30),
      radiusImpacts,
      scores,
      layers,
      sources: [
        { id: "nominatim", label: "OpenStreetMap Nominatim", url: "https://nominatim.openstreetmap.org", retrievedAt: now },
        { id: "overpass", label: "Overpass API", url: "https://overpass-api.de", retrievedAt: now },
        { id: "osm", label: "OpenStreetMap Contributors", url: "https://openstreetmap.org", retrievedAt: now },
      ],
      assumptions: [
        "Population estimates use residential landuse density proxies, not census microdata",
        "POI counts from OpenStreetMap may be incomplete in some regions",
      ],
      generatedAt: now,
      fromMock: false,
    };
    intelligence.summary = buildSummary(intelligence);
    return intelligence;
  } catch {
    return {
      ...buildUnavailableLocationIntelligence(ctx.location, geo.coords),
      coords: geo.coords,
      address: geo.address,
    };
  }
}
