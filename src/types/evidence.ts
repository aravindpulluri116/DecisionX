import type { AgentId, ConfidenceLevel } from "./simulation";
import type { ImpactScores } from "./workspace";

export interface Evidence {
  title: string;
  description: string;
  source: string;
  confidence: number;
}

export type ImpactExplanation = {
  metric: keyof ImpactScores;
  label: string;
  score: number;
  reasoning: string;
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  contributingAgents: AgentId[];
};

export type ConsequenceExplanation = {
  nodeId: string;
  label: string;
  reason: string;
  causedBy: string | null;
  confidence: number;
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
  confidence: number;
  confidenceLevel: ConfidenceLevel;
};

export type AgentTransparency = {
  agentId: AgentId;
  label: string;
  findings: string[];
  evidence: Evidence[];
  assumptions: string[];
  uncertainties: string[];
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  impactScore: number;
};

export type TrustSummary = {
  overallConfidence: number;
  overallConfidenceLevel: ConfidenceLevel;
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
