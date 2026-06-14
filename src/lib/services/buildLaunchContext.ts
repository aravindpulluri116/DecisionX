import type { EnrichedProjectContext } from "@/lib/services/enrichProjectContext";
import type { ProjectCategory } from "@/types/simulation";
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";
import type { ScenarioParams } from "@/types/workspace";
import { buildUnavailableLocationIntelligence } from "@/lib/geo/empty-geo";

export type WizardLaunchInput = {
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  category: ProjectCategory;
  stakeholders: string[];
  coords?: GeoCoordinates;
  locationIntelligence?: LocationIntelligence;
};

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

/** Client-safe launch context — no AI or network calls. */
export function buildLaunchContextFromWizard(input: WizardLaunchInput): EnrichedProjectContext {
  const locationIntelligence =
    input.locationIntelligence ??
    buildUnavailableLocationIntelligence(input.location, input.coords);

  const geoPopulation = populationFromGeo(locationIntelligence);
  const populationEstimateM = geoPopulation ?? 1;

  const metadata = {
    category: input.category,
    stakeholders: input.stakeholders.slice(0, 8) as EnrichedProjectContext["metadata"]["stakeholders"],
    projectType: input.category,
    policyType: input.category,
    populationEstimateM,
    populationRationale:
      geoPopulation != null
        ? "Population derived from OpenStreetMap radius data loaded in the wizard."
        : "Conservative default until geo or AI enrichment provides a better estimate.",
  };

  const scenarioParams: ScenarioParams = {
    budget: input.budget,
    population: populationEstimateM,
    location: input.location,
    timeline: timelineYears(input.timeline),
    projectType: metadata.projectType,
    policyType: metadata.policyType,
  };

  return {
    metadata,
    locationIntelligence,
    webContext: null,
    geo: {
      coords: locationIntelligence.coords,
      address: locationIntelligence.address,
    },
    scenarioParams,
  };
}

/** Wizard always has category + stakeholders — skip blocking enrich when geo preview exists. */
export function canSkipLaunchEnrich(input: WizardLaunchInput): boolean {
  return Boolean(input.category && input.stakeholders.length > 0 && input.locationIntelligence);
}
