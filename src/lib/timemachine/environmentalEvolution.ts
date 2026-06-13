import type { EnvironmentalSnapshot, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

const MILESTONE_FACTOR: Record<TimelineMilestone, number> = {
  present: 0,
  y1: 0.1,
  y3: 0.3,
  y5: 0.5,
  y10: 0.8,
  y20: 1,
};

export function buildEnvironmentalCurve(
  baseEnvironmental: number,
  isTransit: boolean,
  branchMultiplier: number,
): Record<TimelineMilestone, EnvironmentalSnapshot> {
  const result = {} as Record<TimelineMilestone, EnvironmentalSnapshot>;
  for (const m of TIMELINE_MILESTONES) {
    const f = MILESTONE_FACTOR[m] * branchMultiplier;
    const improvement = isTransit ? f * 25 : -f * 15;
    result[m] = {
      carbonImpact: Math.round(Math.max(10, Math.min(100, baseEnvironmental - improvement))),
      landUsage: Math.round(Math.min(100, 40 + f * 35)),
      greenSpaces: Math.round(Math.min(100, baseEnvironmental * 0.6 + f * 20)),
      pollution: Math.round(Math.max(5, Math.min(100, 70 - baseEnvironmental * 0.3 - improvement * 0.5))),
    };
  }
  return result;
}
