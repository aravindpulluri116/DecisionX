import type { AgentId } from "@/types/simulation";

export const AGENT_ORDER: AgentId[] = [
  "economic",
  "social",
  "environmental",
  "stakeholder",
  "risk",
  "futureShock",
  "chiefDecisionOfficer",
];

export const AGENT_LABELS: Record<AgentId, string> = {
  economic: "Economic Agent",
  social: "Social Agent",
  environmental: "Environmental Agent",
  stakeholder: "Stakeholder Agent",
  risk: "Risk Agent",
  futureShock: "Future Shock Agent",
  chiefDecisionOfficer: "Chief Decision Officer",
};

export function getAgentDefinitions() {
  return AGENT_ORDER.map((id) => ({ id, label: AGENT_LABELS[id] }));
}

export function getAgentLabel(id: AgentId): string {
  return AGENT_LABELS[id];
}
