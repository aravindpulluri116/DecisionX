import type { CityEvolutionState, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

const MILESTONE_FACTOR: Record<TimelineMilestone, number> = {
  present: 0,
  y1: 0.12,
  y3: 0.35,
  y5: 0.55,
  y10: 0.85,
  y20: 1,
};

export function buildCityEvolution(
  infrastructureScore: number,
  supportPct: number,
  branchMultiplier: number,
): CityEvolutionState[] {
  return TIMELINE_MILESTONES.map((milestone) => {
    const f = MILESTONE_FACTOR[milestone] * branchMultiplier;
    const zones = ["north", "south", "east", "west", "central"].map((zoneId, i) => ({
      zoneId,
      supportWeight: Math.max(0.1, Math.min(1, (supportPct / 100) * (0.7 + f * 0.3) + i * 0.02)),
    }));
    return {
      milestone,
      buildingScale: 0.4 + f * 0.9 * (infrastructureScore / 100),
      transitCoverage: f * 0.95 * (infrastructureScore / 100),
      populationDensity: 0.3 + f * 0.7,
      zoneHeatmap: zones,
    };
  });
}
