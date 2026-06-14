import type { AgentId, AgentResult, ConfidenceLevel } from "@/types/simulation";
import type { z } from "zod";
import {
  cdoAgentSchema,
  futureShockAgentSchema,
  riskAgentSchema,
  standardAgentSchema,
  stakeholderAgentSchema,
} from "./schemas";

type StandardAgentInput = z.input<typeof standardAgentSchema>;
type StakeholderAgentInput = z.input<typeof stakeholderAgentSchema>;
type RiskAgentInput = z.input<typeof riskAgentSchema>;
type FutureShockAgentInput = z.input<typeof futureShockAgentSchema>;
type CdoAgentInput = z.input<typeof cdoAgentSchema>;

function baseFields(output: {
  assumptions?: string[];
  evidence?: string[];
  uncertainties?: string[];
  confidenceLevel?: ConfidenceLevel | string;
  confidence?: number;
}) {
  return {
    assumptions: output.assumptions ?? [],
    evidence: output.evidence ?? [],
    uncertainties: output.uncertainties ?? [],
    confidenceLevel: (output.confidenceLevel ?? "medium") as ConfidenceLevel,
    confidence: output.confidence ?? 50,
  };
}

export function normalizeStandard(agentId: AgentId, output: StandardAgentInput): AgentResult {
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: output.risks,
    opportunities: output.opportunities,
    recommendations: (output.recommendations?.length ? output.recommendations : output.opportunities.slice(0, 3)) ?? [],
    ...baseFields(output),
    raw: { agentId, ...output },
  };
}

export function normalizeStakeholder(output: StakeholderAgentInput): AgentResult {
  // The raw StakeholderAgentOutput may carry explicit risks/opportunities arrays
  // (Claude follows the prompt rules). Fall back to group-based labels only if absent.
  const rawAny = output as Record<string, unknown>;
  const claudeRisks: string[] = Array.isArray(rawAny.risks)
    ? (rawAny.risks as string[])
    : output.affectedGroups
        .slice(0, 3)
        .map((g) => `Opposition risk: ${g} community may resist project disruptions`);
  const claudeOpps: string[] = Array.isArray(rawAny.opportunities)
    ? (rawAny.opportunities as string[])
    : output.affectedGroups
        .slice(0, 3)
        .map((g) => `Engagement opportunity with ${g} (support score: ${output.supportScore})`);

  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: claudeRisks,
    opportunities: claudeOpps,
    recommendations: Array.isArray(rawAny.recommendations)
      ? (rawAny.recommendations as string[])
      : [
          `Engage ${output.affectedGroups[0] ?? "key stakeholders"} through structured consultation`,
          `Address opposition concerns — current opposition score: ${output.oppositionScore}/100`,
          `Build support coalition — current support score: ${output.supportScore}/100`,
        ],
    ...baseFields(output),
    raw: { agentId: "stakeholder", ...output },
  };
}

export function normalizeRisk(output: RiskAgentInput): AgentResult {
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: output.riskMatrix.map((r) => `${r.category}: ${r.description}`),
    opportunities: output.mitigations ?? [],
    recommendations: output.mitigations ?? [],
    ...baseFields(output),
    raw: { agentId: "risk", ...output },
  };
}

export function normalizeFutureShock(output: FutureShockAgentInput): AgentResult {
  const chainRisks = output.consequences
    .filter((c) => c.type === "risk")
    .map((c) => `${c.source} → ${c.target}`);
  const chainOpps = output.consequences.filter((c) => c.type === "impact").map((c) => c.target);
  return {
    summary: output.summary,
    impactScore: output.impactScore,
    risks: chainRisks.length ? chainRisks : output.consequences.slice(-2).map((c) => c.target),
    opportunities: chainOpps,
    recommendations: output.risks?.length ? output.risks : chainRisks.slice(0, 3),
    ...baseFields(output),
    raw: { agentId: "futureShock", ...output },
  };
}

export function normalizeCdo(output: CdoAgentInput): AgentResult {
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
): z.infer<typeof futureShockAgentSchema>["consequences"] | null {
  if (!result?.raw?.consequences) return null;
  const consequences = result.raw.consequences;
  return Array.isArray(consequences)
    ? (consequences as z.infer<typeof futureShockAgentSchema>["consequences"])
    : null;
}

export function getCdoRaw(result: AgentResult | undefined): Partial<CdoAgentInput> | null {
  if (!result?.raw) return null;
  return result.raw as Partial<CdoAgentInput>;
}
