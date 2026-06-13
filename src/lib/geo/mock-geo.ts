import type { FeatureCollection } from "geojson";
import type {
  GeoCoordinates,
  GeoLayerBundle,
  LocationIntelligence,
  LocationScores,
  NearbyPOI,
  RadiusImpact,
  DataSourceAttribution,
} from "@/types/geo";

type CityPreset = {
  coords: GeoCoordinates;
  address: string;
  populationPerKm2: number;
  nearbyPOIs: NearbyPOI[];
  radiusImpacts: RadiusImpact[];
  scores: LocationScores;
};

const CITY_PRESETS: Record<string, CityPreset> = {
  hyderabad: {
    coords: { lat: 17.385, lng: 78.4867 },
    address: "Hyderabad, Telangana, India",
    populationPerKm2: 4200,
    nearbyPOIs: [
      { type: "school", name: "Govt High School", distanceM: 420, coords: { lat: 17.388, lng: 78.49 } },
      { type: "hospital", name: "City General Hospital", distanceM: 890, coords: { lat: 17.382, lng: 78.48 } },
      { type: "transit", name: "Metro Station", distanceM: 650, coords: { lat: 17.387, lng: 78.485 } },
      { type: "commercial", name: "Commercial Corridor", distanceM: 300, coords: { lat: 17.386, lng: 78.488 } },
    ],
    radiusImpacts: [
      { radiusKm: 1, populationEstimate: 13200, schools: 12, hospitals: 3, businesses: 45, transitStops: 8 },
      { radiusKm: 5, populationEstimate: 330000, schools: 89, hospitals: 18, businesses: 420, transitStops: 34 },
      { radiusKm: 10, populationEstimate: 1320000, schools: 312, hospitals: 52, businesses: 1680, transitStops: 98 },
    ],
    scores: {
      populationDensity: 78,
      urbanDensity: 82,
      environmentalSensitivity: 45,
      accessibilityScore: 74,
      infrastructureScore: 71,
    },
  },
  mumbai: {
    coords: { lat: 19.076, lng: 72.8777 },
    address: "Mumbai, Maharashtra, India",
    populationPerKm2: 21000,
    nearbyPOIs: [
      { type: "school", name: "Municipal School", distanceM: 380, coords: { lat: 19.078, lng: 72.88 } },
      { type: "hospital", name: "District Hospital", distanceM: 720, coords: { lat: 19.074, lng: 72.875 } },
      { type: "transit", name: "Railway Station", distanceM: 520, coords: { lat: 19.077, lng: 72.879 } },
    ],
    radiusImpacts: [
      { radiusKm: 1, populationEstimate: 66000, schools: 18, hospitals: 5, businesses: 120, transitStops: 15 },
      { radiusKm: 5, populationEstimate: 1650000, schools: 210, hospitals: 42, businesses: 2800, transitStops: 85 },
      { radiusKm: 10, populationEstimate: 6600000, schools: 780, hospitals: 145, businesses: 11200, transitStops: 320 },
    ],
    scores: {
      populationDensity: 92,
      urbanDensity: 95,
      environmentalSensitivity: 38,
      accessibilityScore: 81,
      infrastructureScore: 68,
    },
  },
  bangalore: {
    coords: { lat: 12.9716, lng: 77.5946 },
    address: "Bangalore, Karnataka, India",
    populationPerKm2: 5800,
    nearbyPOIs: [
      { type: "school", name: "Public School", distanceM: 510, coords: { lat: 12.973, lng: 77.596 } },
      { type: "hospital", name: "City Hospital", distanceM: 950, coords: { lat: 12.97, lng: 77.592 } },
      { type: "transit", name: "Bus Terminal", distanceM: 680, coords: { lat: 12.972, lng: 77.595 } },
    ],
    radiusImpacts: [
      { radiusKm: 1, populationEstimate: 18200, schools: 15, hospitals: 4, businesses: 68, transitStops: 10 },
      { radiusKm: 5, populationEstimate: 455000, schools: 95, hospitals: 22, businesses: 890, transitStops: 45 },
      { radiusKm: 10, populationEstimate: 1820000, schools: 340, hospitals: 68, businesses: 3560, transitStops: 120 },
    ],
    scores: {
      populationDensity: 72,
      urbanDensity: 76,
      environmentalSensitivity: 52,
      accessibilityScore: 69,
      infrastructureScore: 74,
    },
  },
  telangana: {
    coords: { lat: 18.1124, lng: 79.0193 },
    address: "Telangana, India",
    populationPerKm2: 3100,
    nearbyPOIs: [
      { type: "school", name: "Regional School", distanceM: 1200, coords: { lat: 18.115, lng: 79.02 } },
      { type: "hospital", name: "Regional Hospital", distanceM: 2100, coords: { lat: 18.11, lng: 79.018 } },
    ],
    radiusImpacts: [
      { radiusKm: 1, populationEstimate: 9700, schools: 4, hospitals: 1, businesses: 18, transitStops: 3 },
      { radiusKm: 5, populationEstimate: 243000, schools: 42, hospitals: 8, businesses: 210, transitStops: 15 },
      { radiusKm: 10, populationEstimate: 972000, schools: 156, hospitals: 28, businesses: 840, transitStops: 52 },
    ],
    scores: {
      populationDensity: 48,
      urbanDensity: 42,
      environmentalSensitivity: 58,
      accessibilityScore: 52,
      infrastructureScore: 55,
    },
  },
};

function matchPreset(location: string): CityPreset {
  const key = location.toLowerCase();
  if (key.includes("mumbai")) return CITY_PRESETS.mumbai;
  if (key.includes("bangalore") || key.includes("bengaluru")) return CITY_PRESETS.bangalore;
  if (key.includes("telangana")) return CITY_PRESETS.telangana;
  return CITY_PRESETS.hyderabad;
}

function mockLayers(coords: GeoCoordinates): GeoLayerBundle[] {
  const mkCircle = (offset: number, color: string, key: GeoLayerBundle["key"], label: string): GeoLayerBundle => {
    const r = 0.008 + offset * 0.004;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push([coords.lng + Math.cos(a) * r, coords.lat + Math.sin(a) * r * 0.7]);
    }
    return {
      key,
      label,
      color,
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { weight: 0.4 + offset * 0.15 },
            geometry: { type: "Polygon", coordinates: [pts] },
          },
        ],
      },
    };
  };

  return [
    mkCircle(0, "#0F172A", "population", "Population"),
    mkCircle(1, "#2563EB", "transportation", "Transportation"),
    mkCircle(2, "#15803D", "environment", "Environment"),
    mkCircle(3, "#CA8A04", "economic", "Economic Activity"),
    mkCircle(4, "#7C3AED", "services", "Public Services"),
    mkCircle(5, "#DC2626", "risk", "Risk Zones"),
  ];
}

export function getMockLocationIntelligence(
  location: string,
  coords?: GeoCoordinates,
): LocationIntelligence {
  const preset = matchPreset(location);
  const finalCoords = coords ?? preset.coords;
  const now = new Date().toISOString();

  const sources: DataSourceAttribution[] = [
    { id: "mock", label: "DecisionX Mock Geo Dataset", retrievedAt: now },
    { id: "osm", label: "OpenStreetMap (simulated)", url: "https://openstreetmap.org", retrievedAt: now },
  ];

  const schoolCount = preset.radiusImpacts.find((r) => r.radiusKm === 5)?.schools ?? 89;
  const hospitalCount = preset.radiusImpacts.find((r) => r.radiusKm === 5)?.hospitals ?? 18;

  return {
    summary: `${schoolCount} schools and ${hospitalCount} hospitals within 5km. High population density (${preset.populationPerKm2.toLocaleString()}/km² est.). Strong commercial activity near project corridor.`,
    coords: finalCoords,
    address: preset.address,
    nearbyPOIs: preset.nearbyPOIs,
    radiusImpacts: preset.radiusImpacts,
    scores: preset.scores,
    layers: mockLayers(finalCoords),
    sources,
    assumptions: [
      "Population estimates derived from OSM residential landuse density proxies",
      "POI counts based on regional preset when live Overpass unavailable",
    ],
    generatedAt: now,
    fromMock: true,
  };
}

export function getCityCoords(location: string): GeoCoordinates {
  return matchPreset(location).coords;
}

export { CITY_PRESETS };
