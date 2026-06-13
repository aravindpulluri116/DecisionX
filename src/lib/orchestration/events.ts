import type { LocationIntelligence } from "@/types/geo";
import type { TimeMachineBundle } from "@/types/timemachine";
import type {
  AgentId,
  AgentResult,
  AgentRunState,
  AgentStatus,
  DecisionReport,
  Simulation,
} from "@/types/simulation";
import type { ImpactScores, WorkspaceGraph } from "@/types/workspace";

export type OrchestratorEvent =
  | { type: "agent:status"; agentId: AgentId; status: AgentStatus }
  | { type: "agent:finding"; agentId: AgentId; finding: string }
  | { type: "agent:complete"; agentId: AgentId; result: AgentResult }
  | { type: "graph:ready"; graph: WorkspaceGraph }
  | { type: "scores:ready"; scores: ImpactScores }
  | { type: "report:ready"; report: DecisionReport }
  | { type: "simulation:complete"; simulation: Simulation }
  | { type: "enrichment:ready"; intelligence: LocationIntelligence }
  | { type: "timemachine:ready"; timeMachine: TimeMachineBundle }
  | { type: "log"; message: string };

export type OrchestratorOptions = {
  reducedMotion?: boolean;
  simulationId?: string;
  onAgentComplete?: (simulationId: string, agentResults: Partial<Record<AgentId, AgentResult>>) => void;
};

export type EventHandler = (event: OrchestratorEvent) => void | Promise<void>;
