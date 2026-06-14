import type { AgentId, AgentResult, DecisionProject, SimulationInput } from "@/types/simulation";
import type { ScenarioParams, ImpactScores } from "@/types/workspace";

import type { LocationIntelligence } from "@/types/geo";

export type AgentContext = {
  project: DecisionProject;
  params: ScenarioParams;
  priorResults: Partial<Record<AgentId, AgentResult>>;
  enrichment?: LocationIntelligence;
  /** Specialist-derived KPIs passed to CDO — narrative must align with platform index */
  platformImpactScores?: ImpactScores;
  platformViabilityIndex?: number;
};

export type { SimulationInput };
