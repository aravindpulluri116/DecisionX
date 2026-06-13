import type { CohortSentiment, SentimentSnapshot, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";
import { morphCohortSentiment } from "./societyBaseline";

const MILESTONE_FACTOR: Record<TimelineMilestone, number> = {
  present: 0.5,
  y1: 0.35,
  y3: 0.55,
  y5: 0.7,
  y10: 0.9,
  y20: 1,
};

function aggregateSentiment(cohorts: CohortSentiment[]): Omit<SentimentSnapshot, "cohorts"> {
  const n = cohorts.length || 1;
  const supportPct = Math.round(cohorts.reduce((s, c) => s + c.supportPct, 0) / n);
  const opposePct = Math.round(cohorts.reduce((s, c) => s + c.opposePct, 0) / n);
  const neutralPct = Math.max(0, 100 - supportPct - opposePct);
  return { supportPct, opposePct, neutralPct };
}

export function buildSentimentCurve(
  baseCohorts: CohortSentiment[],
  branchMultiplier: number,
): Record<TimelineMilestone, SentimentSnapshot> {
  const result = {} as Record<TimelineMilestone, SentimentSnapshot>;
  for (const m of TIMELINE_MILESTONES) {
    const cohorts = morphCohortSentiment(baseCohorts, MILESTONE_FACTOR[m], branchMultiplier);
    result[m] = { ...aggregateSentiment(cohorts), cohorts };
  }
  return result;
}
