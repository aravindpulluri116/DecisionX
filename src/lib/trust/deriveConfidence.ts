import type { AgentId, AgentResult, ConfidenceLevel } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import { AGENT_ORDER } from "@/agents";
import {
  AGENT_AGREEMENT_LABELS,
  CONFIDENCE_LABELS,
  DATA_AVAILABILITY_LABELS,
} from "./labels";

export type ConfidenceBasis = {
  dataAvailability: keyof typeof DATA_AVAILABILITY_LABELS;
  agentAgreement: keyof typeof AGENT_AGREEMENT_LABELS;
  evidenceCount: number;
  unknownCount: number;
};

export type DerivedConfidence = {
  level: ConfidenceLevel;
  label: string;
  basis: ConfidenceBasis;
  summary: string;
};

const SPECIALIST_IDS = AGENT_ORDER.filter((id) => id !== "chiefDecisionOfficer");

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function assessDataAvailability(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
  evidenceCount: number,
): ConfidenceBasis["dataAvailability"] {
  const completed = SPECIALIST_IDS.filter((id) => agentResults[id]).length;
  const geoOk = Boolean(locationIntelligence && !locationIntelligence.unavailable);

  if (completed >= 5 && geoOk && evidenceCount >= 6) return "good";
  if (completed >= 3 && evidenceCount >= 2) return "partial";
  return "limited";
}

function assessAgentAgreement(agentResults: Partial<Record<AgentId, AgentResult>>): ConfidenceBasis["agentAgreement"] {
  const scores = SPECIALIST_IDS.map((id) => agentResults[id]?.impactScore).filter(
    (s): s is number => typeof s === "number",
  );
  if (scores.length < 2) return "low";
  const spread = stdDev(scores);
  if (spread <= 12) return "high";
  if (spread <= 28) return "moderate";
  return "low";
}

function countEvidence(agentResults: Partial<Record<AgentId, AgentResult>>): number {
  return Object.values(agentResults).reduce((sum, r) => sum + (r?.evidence.length ?? 0), 0);
}

function countUnknowns(agentResults: Partial<Record<AgentId, AgentResult>>): number {
  return Object.values(agentResults).reduce((sum, r) => sum + (r?.uncertainties.length ?? 0), 0);
}

function levelFromBasis(basis: ConfidenceBasis): ConfidenceLevel {
  let points = 0;

  if (basis.dataAvailability === "good") points += 2;
  else if (basis.dataAvailability === "partial") points += 1;

  if (basis.agentAgreement === "high") points += 2;
  else if (basis.agentAgreement === "moderate") points += 1;

  if (basis.evidenceCount >= 10) points += 2;
  else if (basis.evidenceCount >= 4) points += 1;

  if (basis.unknownCount <= 3) points += 1;
  else if (basis.unknownCount >= 10) points -= 1;

  if (points <= 1) return "low";
  if (points <= 3) return "medium";
  if (points <= 5) return "high";
  return "very_high";
}

function buildSummary(basis: ConfidenceBasis, level: ConfidenceLevel): string {
  return `${CONFIDENCE_LABELS[level]} — ${DATA_AVAILABILITY_LABELS[basis.dataAvailability]}, ${AGENT_AGREEMENT_LABELS[basis.agentAgreement]}, ${basis.evidenceCount} evidence signals, ${basis.unknownCount} known unknowns.`;
}

export function deriveConfidence(opts: {
  agentResults: Partial<Record<AgentId, AgentResult>>;
  locationIntelligence?: LocationIntelligence | null;
  contributingAgentIds?: AgentId[];
  extraEvidenceCount?: number;
  extraUncertainties?: string[];
}): DerivedConfidence {
  const { agentResults, locationIntelligence, contributingAgentIds, extraEvidenceCount = 0, extraUncertainties = [] } =
    opts;

  const relevantAgents = contributingAgentIds?.length
    ? contributingAgentIds
    : (Object.keys(agentResults) as AgentId[]);

  const scopedResults: Partial<Record<AgentId, AgentResult>> = {};
  for (const id of relevantAgents) {
    if (agentResults[id]) scopedResults[id] = agentResults[id];
  }

  const evidenceCount = countEvidence(scopedResults) + extraEvidenceCount;
  const unknownCount = countUnknowns(scopedResults) + extraUncertainties.length;

  const basis: ConfidenceBasis = {
    dataAvailability: assessDataAvailability(agentResults, locationIntelligence, evidenceCount),
    agentAgreement: assessAgentAgreement(agentResults),
    evidenceCount,
    unknownCount,
  };

  const level = levelFromBasis(basis);

  return {
    level,
    label: CONFIDENCE_LABELS[level],
    basis,
    summary: buildSummary(basis, level),
  };
}

export function predictionReliabilityFromLevel(level: ConfidenceLevel): string {
  switch (level) {
    case "very_high":
      return "Strong synthesis — multiple agents, evidence, and geo context align";
    case "high":
      return "Solid synthesis — review assumptions before acting";
    case "medium":
      return "Directional — gaps in data or agent agreement";
    case "low":
      return "Preliminary — limited data; treat as hypothesis only";
  }
}
