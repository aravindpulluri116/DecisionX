import type { CanvasNode, ImpactScores, Project, ScenarioParams, WorkspaceGraph } from "./workspace";

export type ProjectCategory =
  | "Transportation"
  | "Urban Development"
  | "Environment"
  | "Education"
  | "Healthcare"
  | "Economic Policy";

export type StakeholderGroup =
  | "Citizens"
  | "Businesses"
  | "Government"
  | "Students"
  | "Environmental Groups";

import type { ProjectGeo, LocationIntelligence } from "./geo";

export type DecisionProject = Project & {
  description: string;
  category: ProjectCategory;
  stakeholders: string[];
  budget: number;
  timeline: string;
  geo?: ProjectGeo;
  locationIntelligence?: LocationIntelligence;
};

export type AgentId =
  | "economic"
  | "social"
  | "environmental"
  | "stakeholder"
  | "risk"
  | "futureShock"
  | "chiefDecisionOfficer";

export type AgentStatus = "queued" | "running" | "completed" | "failed";

export type ConfidenceLevel = "low" | "medium" | "high" | "very_high";

export type StakeholderSentiment =
  | "strong_support"
  | "moderate_support"
  | "mixed_sentiment"
  | "moderate_opposition"
  | "strong_opposition"
  | "concerned";

export type SupportTrend = Exclude<StakeholderSentiment, "concerned">;

export type StakeholderGroupSentiment = {
  group: string;
  sentiment: StakeholderSentiment;
};

export type AgentResult = {
  summary: string;
  impactScore: number;
  risks: string[];
  opportunities: string[];
  /** @deprecated Stored for legacy runs; UI uses deriveConfidence() */
  confidence: number;
  /** @deprecated UI uses deriveConfidence() */
  confidenceLevel: ConfidenceLevel;
  recommendations: string[];
  assumptions: string[];
  evidence: string[];
  uncertainties: string[];
  raw?: Record<string, unknown>;
};

export type AgentRunState = {
  id: AgentId;
  label: string;
  status: AgentStatus;
  findings: string[];
  result?: AgentResult;
  startedAt?: string;
  completedAt?: string;
};

export type SimulationStatus = "pending" | "running" | "completed" | "failed";

export type Simulation = {
  id: string;
  projectId: string;
  scenarioId?: string;
  status: SimulationStatus;
  params: ScenarioParams;
  agentResults: Partial<Record<AgentId, AgentResult>>;
  graph?: WorkspaceGraph;
  impactScores?: ImpactScores;
  reportId?: string;
  startedAt: string;
  completedAt?: string;
};

export type TimelineYear = 1 | 3 | 5 | 10;

export type ConsequenceNode = CanvasNode & {
  evidence?: string[];
  yearVariants?: Partial<Record<TimelineYear, { label: string; weight: number }>>;
};

export type DecisionReportSections = {
  executiveSummary: string;
  impactAnalysis: string;
  stakeholderAnalysis: string;
  riskAnalysis: string;
  futureOutlook: string;
  recommendations: string[];
  viabilityScore?: number;
  alternativeScenarios?: string[];
  assumptions?: string[];
  uncertainties?: string[];
};

export type DecisionReport = {
  id: string;
  simulationId: string;
  projectTitle: string;
  generatedAt: string;
  sections: DecisionReportSections;
};

export type WorkspaceTab = "report" | "compare" | "projects" | "intelligence";

export type SimulationInput = {
  project: DecisionProject;
  params: ScenarioParams;
  scenarioTitle?: string;
};
