import type { Simulation } from "@/types/simulation";
import type { ImpactScores } from "@/types/workspace";
import { computeViabilityIndex, getDecisionVerdict } from "@/lib/workspace/impact-metrics";

/** Single source of truth for project viability (0–100). */
export function getProjectViability(scores: ImpactScores | null | undefined): number | null {
  if (!scores) return null;
  return computeViabilityIndex(scores);
}

export function getViabilityFromSimulation(simulation: Simulation | null | undefined): number | null {
  return getProjectViability(simulation?.impactScores);
}

/** Prefer live KPIs; fall back to stored report score for legacy runs. */
export function resolveReportViability(
  scores: ImpactScores | null | undefined,
  storedReportScore?: number | null,
): number | null {
  const fromScores = getProjectViability(scores);
  if (fromScores != null) return fromScores;
  if (storedReportScore != null && !Number.isNaN(storedReportScore)) return storedReportScore;
  return null;
}

export { getDecisionVerdict, computeViabilityIndex };
