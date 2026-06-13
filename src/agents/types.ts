import type { AgentId, AgentResult, DecisionProject, SimulationInput } from "@/types/simulation";
import type { ScenarioParams } from "@/types/workspace";

import type { LocationIntelligence } from "@/types/geo";

export type AgentContext = {
  project: DecisionProject;
  params: ScenarioParams;
  priorResults: Partial<Record<AgentId, AgentResult>>;
  enrichment?: LocationIntelligence;
};

export type { SimulationInput };
