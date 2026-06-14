import type { ImpactScores } from "@/types/workspace";
import type { AgentId, AgentResult } from "@/types/simulation";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const IMPACT_AGENT_WEIGHTS: Record<keyof ImpactScores, AgentId[]> = {
  economic: ["economic", "chiefDecisionOfficer"],
  social: ["social", "stakeholder"],
  environmental: ["environmental", "futureShock"],
  infrastructure: ["economic", "risk"],
  politicalRisk: ["risk", "stakeholder"],
  publicAcceptance: ["social", "stakeholder", "chiefDecisionOfficer"],
};

const AGENT_WEIGHTS = IMPACT_AGENT_WEIGHTS;

function weightedAgentScore(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  agentIds: AgentId[],
): number | null {
  const scores: number[] = [];
  for (const agentId of agentIds) {
    const r = agentResults[agentId];
    if (r) scores.push(r.impactScore * (r.confidence / 100));
  }
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/** Derive impact KPIs entirely from agent outputs — 0 when agents did not run. */
export function computeImpactFromAgents(
  agentResults: Partial<Record<AgentId, AgentResult>>,
): ImpactScores {
  const result = {} as ImpactScores;

  for (const key of Object.keys(AGENT_WEIGHTS) as (keyof ImpactScores)[]) {
    const avg = weightedAgentScore(agentResults, AGENT_WEIGHTS[key]);
    if (key === "politicalRisk" && avg != null) {
      result[key] = clamp(100 - avg);
    } else {
      result[key] = clamp(avg ?? 0);
    }
  }

  return result;
}
