import type { AgentId, AgentResult, ConfidenceLevel } from "@/types/simulation";
import type {
  CdoAgentOutput,
  FutureShockAgentOutput,
  RiskAgentOutput,
  StandardAgentOutput,
  StakeholderAgentOutput,
} from "./schemas";

function baseFields(output: {
  assumptions: string[];
  evidence: string[];
  uncertainties: string[];
  confidenceLevel: ConfidenceLevel;
  confidence: number;
}) {
  return {
    assumptions: output.assumptions,
    evidence: output.evidence,
    uncertainties: output.uncertainties,
    confidenceLevel: output.confidenceLevel,
    confidence: output.confidence,
  };
}

export function normalizeStandard(agentId: AgentId, output: StandardAgentOutput): AgentResult {
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: output.risks,
    opportunities: output.opportunities,
    recommendations: output.opportunities.slice(0, 3),
    ...baseFields(output),
    raw: { agentId, ...output },
  };
}

export function normalizeStakeholder(output: StakeholderAgentOutput): AgentResult {
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: output.affectedGroups.map((g) => `Opposition risk from ${g}`).slice(0, 3),
    opportunities: output.affectedGroups.map((g) => `Support opportunity among ${g}`).slice(0, 3),
    recommendations: [
      `Engage ${output.affectedGroups[0] ?? "stakeholders"} early`,
      `Monitor support (${output.supportScore}) vs opposition (${output.oppositionScore})`,
    ],
    ...baseFields(output),
    raw: { agentId: "stakeholder", ...output },
  };
}

export function normalizeRisk(output: RiskAgentOutput): AgentResult {
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: output.riskMatrix.map((r) => `${r.category}: ${r.description}`),
    opportunities: output.mitigations,
    recommendations: output.mitigations,
    ...baseFields(output),
    raw: { agentId: "risk", ...output },
  };
}

export function normalizeFutureShock(output: FutureShockAgentOutput): AgentResult {
  const chainRisks = output.consequences
    .filter((c) => c.type === "risk")
    .map((c) => `${c.source} → ${c.target}`);
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: chainRisks.length ? chainRisks : output.consequences.slice(-2).map((c) => c.target),
    opportunities: output.consequences.filter((c) => c.type === "impact").map((c) => c.target),
    recommendations: ["Monitor second-order effects", "Establish early warning indicators"],
    ...baseFields(output),
    raw: { agentId: "futureShock", ...output },
  };
}

export function normalizeCdo(output: CdoAgentOutput): AgentResult {
  return {
    summary: output.executiveSummary,
    impactScore: output.viabilityScore,
    risks: output.keyRisks,
    opportunities: output.keyOpportunities,
    recommendations: output.recommendedActions,
    ...baseFields(output),
    raw: {
      ...output,
      agentId: "chiefDecisionOfficer",
    },
  };
}

export function getFutureShockConsequences(
  result: AgentResult | undefined,
): FutureShockAgentOutput["consequences"] | null {
  if (!result?.raw?.consequences) return null;
  const consequences = result.raw.consequences;
  return Array.isArray(consequences) ? (consequences as FutureShockAgentOutput["consequences"]) : null;
}

export function getCdoRaw(result: AgentResult | undefined): Partial<CdoAgentOutput> | null {
  if (!result?.raw) return null;
  return result.raw as Partial<CdoAgentOutput>;
}
