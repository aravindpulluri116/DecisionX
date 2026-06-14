import type { GeoLayerBundle, GeoCoordinates, LocationIntelligence, LocationScores } from "@/types/geo";

const EMPTY_SCORES: LocationScores = {
  populationDensity: 0,
  urbanDensity: 0,
  environmentalSensitivity: 0,
  accessibilityScore: 0,
  infrastructureScore: 0,
};

/** Minimal intelligence when OpenStreetMap lookup fails — no fabricated counts. */
export function buildUnavailableLocationIntelligence(
  location: string,
  coords?: GeoCoordinates,
): LocationIntelligence {
  const now = new Date().toISOString();
  return {
    summary: `Location intelligence unavailable for "${location}". Analysis will rely on project description and AI inference.`,
    coords: coords ?? { lat: 0, lng: 0 },
    address: location,
    nearbyPOIs: [],
    radiusImpacts: [],
    scores: EMPTY_SCORES,
    layers: [],
    sources: [],
    assumptions: ["OpenStreetMap data could not be retrieved for this location"],
    generatedAt: now,
    fromMock: false,
    unavailable: true,
  };
}

export function emptyGeoLayer(
  key: GeoLayerBundle["key"],
  label: string,
  color = "#94A3B8",
): GeoLayerBundle {
  return { key, label, color, data: { type: "FeatureCollection", features: [] } };
}
