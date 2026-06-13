import type { AgentId } from "@/types/simulation";
import type { FutureHeadline, TimeMachineBundle } from "@/types/timemachine";
import type { ImpactScores } from "@/types/workspace";
import type { CohortSentiment } from "@/types/timemachine";

export type DemoStep =
  | "overview"
  | "agents"
  | "impact"
  | "society"
  | "timemachine"
  | "headlines"
  | "recommendation";

export const DEMO_STEPS: DemoStep[] = [
  "overview",
  "agents",
  "impact",
  "society",
  "timemachine",
  "headlines",
  "recommendation",
];

export type AgentDemoBeat = {
  agentId: AgentId;
  label: string;
  findings: string[];
  status: "completed";
};

export type JudgeSocietySnapshot = {
  citizenCount: number;
  supportPct: number;
  opposePct: number;
  neutralPct: number;
  cohorts: CohortSentiment[];
};

export type JudgeRecommendation = {
  viabilityScore: number;
  keyRisks: string[];
  keyOpportunities: string[];
  mitigations: string[];
  alternativeScenario: string;
  executiveSummary: string;
};

export type JudgeInsightScores = {
  innovationScore: number;
  technicalComplexity: string;
  stakeholderCoverage: string;
  futurePredictionDepth: string;
};

export type JudgeDemoPack = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  overview: {
    budget: number;
    timeline: string;
    location: string;
    stakeholders: string[];
    description: string;
  };
  agentSequence: AgentDemoBeat[];
  impactScores: ImpactScores;
  society: JudgeSocietySnapshot;
  timeMachine: TimeMachineBundle;
  headlines: FutureHeadline[];
  recommendation: JudgeRecommendation;
  judgeInsights: JudgeInsightScores;
  stepTimings: Record<DemoStep, number>;
};

export const DEFAULT_STEP_TIMINGS: Record<DemoStep, number> = {
  overview: 18000,
  agents: 45000,
  impact: 22000,
  society: 28000,
  timemachine: 35000,
  headlines: 15000,
  recommendation: 17000,
};
