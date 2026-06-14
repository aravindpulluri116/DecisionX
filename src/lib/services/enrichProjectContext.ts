import type { GeoCoordinates } from "@/types/geo";
import { buildLocationIntelligence } from "@/lib/services/geo/context-service";
import { inferProjectMetadata } from "@/lib/services/projectMetadataAgent";
import { fetchWebLocationContext } from "@/lib/services/webLocationContext";
import type { DecisionProject, ProjectCategory } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
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
  /** Reuse geo from wizard — skips a second OpenStreetMap round-trip at launch. */
  geo?: { coords: GeoCoordinates; address: string };
  locationIntelligence?: LocationIntelligence;
};

export type EnrichedProjectContext = {
  metadata: ProjectMetadata;
  locationIntelligence: LocationIntelligence;
  webContext: string | null;
  geo: DecisionProject["geo"];
  scenarioParams: ScenarioParams;
};

function timelineYears(timeline: string): string {
  const match = timeline.match(/\d+/);
  return match ? `${match[0]} years` : timeline;
}

export async function enrichProjectContext(input: EnrichProjectInput): Promise<EnrichedProjectContext> {
  const hasCachedIntel =
    input.locationIntelligence &&
    !input.locationIntelligence.unavailable &&
    input.locationIntelligence.coords;

  const [locationIntelligence, webContext] = await Promise.all([
    hasCachedIntel
      ? Promise.resolve(input.locationIntelligence!)
      : buildLocationIntelligence({
          location: input.location,
          coords: input.geo?.coords,
        }),
    fetchWebLocationContext(input.location),
  ]);

  const metadata = await inferProjectMetadata({
    title: input.title,
    description: input.description,
    location: input.location,
    budgetCr: input.budget,
    timeline: input.timeline,
    locationIntelligence,
    webContext,
    category: input.category,
    stakeholders: input.stakeholders,
  });

  const r5 = locationIntelligence.radiusImpacts.find((r) => r.radiusKm === 5);
  const geoPopulationM =
    r5?.populationEstimate && r5.populationEstimate > 0 && !locationIntelligence.unavailable
      ? Math.max(0.05, parseFloat((r5.populationEstimate / 1_000_000).toFixed(2)))
      : metadata.populationEstimateM;

  const scenarioParams: ScenarioParams = {
    budget: input.budget,
    population: geoPopulationM,
    location: input.location,
    timeline: timelineYears(input.timeline),
    projectType: metadata.projectType,
    policyType: metadata.policyType,
  };

  return {
    metadata,
    locationIntelligence,
    webContext,
    geo: {
      coords: locationIntelligence.coords,
      address: locationIntelligence.address,
    },
    scenarioParams,
  };
}
