import type { EconomicSnapshot, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

const MILESTONE_FACTOR: Record<TimelineMilestone, number> = {
  present: 0,
  y1: 0.15,
  y3: 0.35,
  y5: 0.55,
  y10: 0.85,
  y20: 1,
};

function sCurve(f: number): number {
  return 1 / (1 + Math.exp(-8 * (f - 0.5)));
}

export function buildEconomicCurve(
  baseEconomic: number,
  branchMultiplier: number,
): Record<TimelineMilestone, EconomicSnapshot> {
  const result = {} as Record<TimelineMilestone, EconomicSnapshot>;
  for (const m of TIMELINE_MILESTONES) {
    const f = sCurve(MILESTONE_FACTOR[m]) * branchMultiplier;
    const scale = baseEconomic / 100;
    result[m] = {
      businessActivity: Math.round(Math.min(100, 30 + f * 55 * scale)),
      employment: Math.round(Math.min(100, 25 + f * 50 * scale)),
      investment: Math.round(Math.min(100, 20 + f * 60 * scale)),
      taxRevenue: Math.round(Math.min(100, 15 + f * 45 * scale)),
    };
  }
  return result;
}
