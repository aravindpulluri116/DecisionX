import { buildLocationIntelligence } from "@/lib/services/geo/context-service";
import { inferProjectMetadata } from "@/lib/services/projectMetadataAgent";
import { normalizeStakeholderSelection } from "@/lib/services/suggestStakeholders";
import { fetchWebLocationContext } from "@/lib/services/webLocationContext";
import type { DecisionProject, ProjectCategory } from "@/types/simulation";
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";
import type { ScenarioParams } from "@/types/workspace";
import type { ProjectMetadata } from "./projectMetadataAgent";

export type EnrichProjectInput = {
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  category?: ProjectCategory;
  stakeholders?: string[];
  /** Reuse wizard geo preview — skips a second geocode/enrich pass. */
  coords?: GeoCoordinates;
  locationIntelligence?: LocationIntelligence;
};

function withDeadline<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function timelineYears(timeline: string): string {
  const match = timeline.match(/\d+/);
  return match ? `${match[0]} years` : timeline;
}

function populationFromGeo(intel: LocationIntelligence): number | null {
  const r5 = intel.radiusImpacts.find((r) => r.radiusKm === 5);
  if (
    r5?.populationEstimate &&
    r5.populationEstimate > 0 &&
    !intel.unavailable
  ) {
    return Math.max(0.05, parseFloat((r5.populationEstimate / 1_000_000).toFixed(2)));
  }
  return null;
}

function buildResult(
  input: EnrichProjectInput,
  metadata: ProjectMetadata,
  locationIntelligence: LocationIntelligence,
  webContext: string | null,
): EnrichedProjectContext {
  const geoPopulationM = populationFromGeo(locationIntelligence) ?? metadata.populationEstimateM;

  return {
    metadata,
    locationIntelligence,
    webContext,
    geo: {
      coords: locationIntelligence.coords,
      address: locationIntelligence.address,
    },
    scenarioParams: {
      budget: input.budget,
      population: geoPopulationM,
      location: input.location,
      timeline: timelineYears(input.timeline),
      projectType: metadata.projectType,
      policyType: metadata.policyType,
    },
  };
}

export async function enrichProjectContext(input: EnrichProjectInput): Promise<EnrichedProjectContext> {
  const locationIntelligence =
    input.locationIntelligence ??
    (await withDeadline(
      buildLocationIntelligence({ location: input.location, coords: input.coords }),
      45_000,
      {
        coords: input.coords ?? { lat: 0, lng: 0 },
        address: input.location,
        summary: "Location data unavailable — using project context only.",
        unavailable: true,
        radiusImpacts: [],
        nearbyPOIs: [],
        scores: {
          populationDensity: 0,
          urbanDensity: 0,
          environmentalSensitivity: 0,
          accessibilityScore: 0,
          infrastructureScore: 0,
        },
        layers: [],
        sources: [],
        assumptions: ["Geo enrichment timed out"],
        generatedAt: new Date().toISOString(),
      } satisfies LocationIntelligence,
    ));

  const geoPop = populationFromGeo(locationIntelligence);
  if (input.category && input.stakeholders?.length && geoPop != null) {
    const metadata: ProjectMetadata = {
      category: input.category,
      stakeholders: normalizeStakeholderSelection(input.stakeholders) as ProjectMetadata["stakeholders"],
      projectType: input.category,
      policyType: input.category,
      populationEstimateM: geoPop,
      populationRationale: "Population derived from OpenStreetMap radius data.",
    };
    return buildResult(input, metadata, locationIntelligence, null);
  }

  const webContext = await withDeadline(fetchWebLocationContext(input.location), 8_000, null);

  const metadata = await withDeadline(
    inferProjectMetadata({
      title: input.title,
      description: input.description,
      location: input.location,
      budgetCr: input.budget,
      timeline: input.timeline,
      locationIntelligence,
      webContext,
      category: input.category,
      stakeholders: input.stakeholders,
    }),
    45_000,
    fallbackMetadata(input),
  );

  return buildResult(input, metadata, locationIntelligence, webContext);
}

function fallbackMetadata(input: EnrichProjectInput): ProjectMetadata {
  const category = input.category ?? "Transportation";
  const stakeholders = (input.stakeholders?.length ? input.stakeholders : ["Citizens", "Government"]).slice(
    0,
    8,
  ) as ProjectMetadata["stakeholders"];
  return {
    category,
    stakeholders,
    projectType: category,
    policyType: category,
    populationEstimateM: 1,
    populationRationale: "Estimated from project scope after AI metadata timed out.",
  };
}

export type EnrichedProjectContext = {
  metadata: ProjectMetadata;
  locationIntelligence: LocationIntelligence;
  webContext: string | null;
  geo: DecisionProject["geo"];
  scenarioParams: ScenarioParams;
};
