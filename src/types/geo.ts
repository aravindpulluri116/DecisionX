import type { FeatureCollection, Polygon } from "geojson";

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export type GeoBBox = [west: number, south: number, east: number, north: number];

export type ProjectGeo = {
  coords: GeoCoordinates;
  address: string;
  bbox?: GeoBBox;
  projectArea?: Polygon;
};

export type POIType =
  | "school"
  | "hospital"
  | "transit"
  | "road"
  | "commercial"
  | "residential"
  | "park"
  | "government"
  | "business";

export type NearbyPOI = {
  type: POIType;
  name: string;
  distanceM: number;
  coords: GeoCoordinates;
};

export type RadiusKm = 1 | 5 | 10;

export type RadiusImpact = {
  radiusKm: RadiusKm;
  populationEstimate: number;
  schools: number;
  hospitals: number;
  businesses: number;
  transitStops: number;
};

export type LocationScores = {
  populationDensity: number;
  urbanDensity: number;
  environmentalSensitivity: number;
  accessibilityScore: number;
  infrastructureScore: number;
};

export type DataSourceAttribution = {
  id: string;
  label: string;
  url?: string;
  retrievedAt: string;
};

export type GeoLayerKey =
  | "population"
  | "transportation"
  | "economic"
  | "environment"
  | "services"
  | "risk"
  | "impact";

export type GeoLayerBundle = {
  key: GeoLayerKey;
  label: string;
  color: string;
  data: FeatureCollection;
};

export type LocationIntelligence = {
  summary: string;
  coords: GeoCoordinates;
  address: string;
  nearbyPOIs: NearbyPOI[];
  radiusImpacts: RadiusImpact[];
  scores: LocationScores;
  layers: GeoLayerBundle[];
  sources: DataSourceAttribution[];
  assumptions: string[];
  generatedAt: string;
  fromMock?: boolean;
  /** True when OpenStreetMap lookup failed — no fabricated fallback data. */
  unavailable?: boolean;
};

export type GeoQueryContext = {
  location: string;
  coords?: GeoCoordinates;
  projectArea?: Polygon;
};

export type GeoProviderResult = {
  pois?: NearbyPOI[];
  layers?: GeoLayerBundle[];
  metadata?: Record<string, unknown>;
};

export type GeoProvider = {
  id: string;
  label: string;
  fetch: (ctx: GeoQueryContext & { coords: GeoCoordinates }) => Promise<GeoProviderResult>;
};
