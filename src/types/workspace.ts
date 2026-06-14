import type { ProjectGeo, LocationIntelligence } from "./geo";

export type NodeType = "decision" | "impact" | "risk" | "stakeholder" | "environmental";

export type ProjectStatus = "active" | "review" | "draft" | "archived";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Project = {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus;
  impact_score: number;
  risk_level: RiskLevel;
  project_type: string;
  location: string;
  lat?: number;
  lng?: number;
  address?: string;
  bbox?: [number, number, number, number];
  project_area?: unknown;
  location_intelligence?: LocationIntelligence;
  created_at: string;
  // Fields stored by insertProject — optional so legacy mock rows still typecheck
  description?: string;
  category?: string;
  stakeholders?: string[];
  budget?: number;
  timeline?: string;
};

export type ScenarioParams = {
  budget: number;
  population: number;
  location: string;
  timeline: string;
  projectType: string;
  policyType: string;
};

export type ImpactScores = {
  economic: number;
  social: number;
  environmental: number;
  infrastructure: number;
  politicalRisk: number;
  publicAcceptance: number;
};

export type Scenario = {
  id: string;
  project_id: string;
  title: string;
  is_active: boolean;
  params: ScenarioParams;
  impact_scores: ImpactScores;
  created_at: string;
};

export type CanvasNode = {
  id: string;
  scenario_id: string;
  type: NodeType;
  label: string;
  description: string | null;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  parent_id: string | null;
  collapsed?: boolean;
};

export type CanvasEdge = {
  id: string;
  scenario_id: string;
  source: string;
  target: string;
  data: Record<string, unknown>;
};

import type { DataSourceAttribution } from "./geo";

export type NodeIntelligence = {
  node_id: string;
  impact_strength: number;
  confidence: number;
  stakeholders: string[];
  timeline: { year: string; event: string }[];
  mitigation: string[];
  evidence: string[];
  assumptions?: string[];
  uncertainties?: string[];
  geoEvidence?: string[];
  sources?: DataSourceAttribution[];
  /** Why this consequence exists */
  reason?: string;
  /** Upstream cause label */
  causedBy?: string;
};

export type WorkspaceGraph = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  intelligence: Record<string, NodeIntelligence>;
};
