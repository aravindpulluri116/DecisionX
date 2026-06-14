import type { AgentContext } from "@/agents/types";
import type { AgentId, AgentResult } from "@/types/simulation";
import { runEconomicAgent } from "./economic-agent";
import { runSocialAgent } from "./social-agent";
import { runEnvironmentalAgent } from "./environmental-agent";
import { runStakeholderAgent } from "./stakeholder-agent";
import { runRiskAgent } from "./risk-agent";
import { runFutureShockAgent } from "./future-shock-agent";
import { runChiefDecisionOfficer } from "./chief-decision-officer";

export const SPECIALIST_AGENT_IDS: AgentId[] = [
  "economic",
  "social",
  "environmental",
  "stakeholder",
  "risk",
  "futureShock",
];

export type AgentLlmRunResult = {
  result: AgentResult;
  findings: string[];
};

type AgentRunner = (ctx: AgentContext) => Promise<AgentLlmRunResult>;

export const agentRunners: Record<AgentId, AgentRunner> = {
  economic: runEconomicAgent,
  social: runSocialAgent,
  environmental: runEnvironmentalAgent,
  stakeholder: runStakeholderAgent,
  risk: runRiskAgent,
  futureShock: runFutureShockAgent,
  chiefDecisionOfficer: runChiefDecisionOfficer,
};

export function getAgentRunner(agentId: AgentId): AgentRunner {
  return agentRunners[agentId];
}
