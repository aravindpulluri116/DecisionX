import type { AgentResult, Simulation } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import type {
  FutureBranch,
  FutureSnapshot,
  FutureTrajectory,
  PoliticalViabilityLevel,
  TimelineMilestone,
} from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";
import type { ImpactScores, ScenarioParams } from "@/types/workspace";
import { buildCalendarYears } from "./calendarMapper";
import { buildConsequenceTimeline } from "./consequenceTimeline";
import { buildCityEvolution } from "./cityEvolutionModel";
import { buildEconomicCurve } from "./economicEvolution";
import { buildEnvironmentalCurve } from "./environmentalEvolution";
import { buildSentimentCurve } from "./socialEvolution";
import { generateFutureHeadlines } from "./futureNewsGenerator";
import { buildCitizenStoryEvolution } from "./citizenStoryEvolution";
import { buildDefaultCohortSentiment } from "./societyBaseline";

const BRANCH_MULT: Record<FutureBranch, number> = {
  expectedCase: 1,
  bestCase: 1.15,
  worstCase: 0.75,
};

function viabilityLevel(score: number): PoliticalViabilityLevel {
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
  return "low";
}

const POP_FACTOR: Record<TimelineMilestone, number> = {
  present: 1,
  y1: 1.02,
  y3: 1.06,
  y5: 1.1,
  y10: 1.18,
  y20: 1.28,
};

export function buildFutureTrajectory(
  branch: FutureBranch,
  scores: ImpactScores,
  params: ScenarioParams,
  agentResults: Partial<Record<string, AgentResult>>,
  geo?: LocationIntelligence | null,
): FutureTrajectory {
  const mult = BRANCH_MULT[branch];
  const calendarYears = buildCalendarYears();
  const baseCohorts = buildDefaultCohortSentiment(scores);
  const economic = buildEconomicCurve(scores.economic, mult);
  const environmental = buildEnvironmentalCurve(
    scores.environmental,
    params.projectType?.toLowerCase().includes("transit") ?? params.policyType?.toLowerCase().includes("transit") ?? true,
    mult,
  );
  const sentiment = buildSentimentCurve(baseCohorts, mult);
  const consequences = buildConsequenceTimeline(agentResults.futureShock, calendarYears);

  const basePop = (params.population ?? 2.4) * 1_000_000;
  const geoDensity = geo?.scores?.populationDensity ?? 60;

  const snapshots = {} as Record<TimelineMilestone, FutureSnapshot>;
  for (const m of TIMELINE_MILESTONES) {
    const sent = sentiment[m];
    const viabilityScore = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          sent.supportPct * 0.5 +
            scores.infrastructure * 0.2 +
            scores.economic * 0.15 -
            scores.politicalRisk * 0.15 * (branch === "worstCase" ? 1.3 : 1),
        ),
      ) * (branch === "bestCase" ? 1.08 : branch === "worstCase" ? 0.85 : 1),
    );
    snapshots[m] = {
      milestone: m,
      calendarYear: calendarYears[m],
      population: {
        totalEstimate: Math.round(basePop * POP_FACTOR[m] * mult),
        densityIndex: Math.round(Math.min(100, geoDensity * POP_FACTOR[m] * 0.9)),
        migrationDirection:
          m === "y20" && sent.supportPct > 70 ? "inward" : m === "y1" ? "stable" : "inward",
      },
      economic: economic[m],
      infrastructure: Math.round(Math.min(100, scores.infrastructure * (0.5 + POP_FACTOR[m] * 0.4) * mult)),
      environmental: environmental[m],
      sentiment: sent,
      politicalViability: viabilityLevel(viabilityScore),
      viabilityScore,
    };
  }

  const presentSent = snapshots.present.sentiment;
  const cityStates = buildCityEvolution(scores.infrastructure, presentSent.supportPct, mult);
  const headlines = generateFutureHeadlines(snapshots, consequences);
  const citizenStories = buildCitizenStoryEvolution(baseCohorts, calendarYears);

  return {
    branch,
    milestones: [...TIMELINE_MILESTONES],
    calendarYears,
    snapshots,
    consequences,
    headlines,
    citizenStories,
    cityStates,
    generatedAt: new Date().toISOString(),
  };
}

export function buildTimeMachineBundle(
  scores: ImpactScores,
  params: ScenarioParams,
  agentResults: Simulation["agentResults"],
  geo?: LocationIntelligence | null,
) {
  return {
    expected: buildFutureTrajectory("expectedCase", scores, params, agentResults, geo),
    best: buildFutureTrajectory("bestCase", scores, params, agentResults, geo),
    worst: buildFutureTrajectory("worstCase", scores, params, agentResults, geo),
  };
}

export function getSnapshotAtMilestone(
  trajectory: FutureTrajectory,
  milestone: TimelineMilestone,
): FutureSnapshot {
  return trajectory.snapshots[milestone];
}
