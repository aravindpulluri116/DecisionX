import type { AgentId, ConfidenceLevel } from "./simulation";
import type { ImpactScores } from "./workspace";
import type { ConfidenceBasis } from "@/lib/trust/deriveConfidence";

export interface Evidence {
  title: string;
  description: string;
  source: string;
  confidenceLevel: ConfidenceLevel;
}

export type ImpactExplanation = {
  metric: keyof ImpactScores;
  label: string;
  score: number;
  reasoning: string;
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
  confidenceLevel: ConfidenceLevel;
  confidenceBasis: ConfidenceBasis;
  contributingAgents: AgentId[];
};

export type ConsequenceExplanation = {
  nodeId: string;
  label: string;
  reason: string;
  causedBy: string | null;
  linkStrength?: "direct" | "indirect" | "speculative";
  confidenceLevel: ConfidenceLevel;
  confidenceBasis: ConfidenceBasis;
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
};

export type ReasoningStep = {
  id: string;
  order: number;
  agentId?: AgentId;
  title: string;
  summary: string;
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
  confidenceLevel: ConfidenceLevel;
  confidenceBasis: ConfidenceBasis;
};

export type AgentTransparency = {
  agentId: AgentId;
  label: string;
  findings: string[];
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
  confidenceLevel: ConfidenceLevel;
  confidenceBasis: ConfidenceBasis;
  impactScore: number;
};

export type TrustSummary = {
  overallConfidenceLevel: ConfidenceLevel;
  confidenceBasis: ConfidenceBasis;
  predictionReliability: string;
  evidenceSources: string[];
  assumptions: string[];
  uncertainties: string[];
  agentCount: number;
  disclaimer: string;
};

export type EvidencePack = {
  impactExplanations: ImpactExplanation[];
  consequenceExplanations: ConsequenceExplanation[];
  reasoningChain: ReasoningStep[];
  agentTransparency: AgentTransparency[];
  trustSummary: TrustSummary;
};

export type ExplanationTarget =
  | { type: "impact"; metric: keyof ImpactScores }
  | { type: "consequence"; nodeId: string }
  | { type: "agent"; agentId: AgentId }
  | { type: "reasoning"; stepId: string };
