import type { CohortSentiment } from "./types";
import type { ImpactScores } from "@/types/workspace";

const COHORT_PROFILES = [
  "Students",
  "Commuters",
  "Business Owners",
  "Families",
  "Retirees",
  "Government Employees",
  "Low Income Households",
  "High Income Households",
  "Environmental Advocates",
];

const COHORT_BIAS: Record<string, number> = {
  Students: 12,
  Commuters: 15,
  "Business Owners": 10,
  Families: 0,
  Retirees: -5,
  "Government Employees": 5,
  "Low Income Households": -8,
  "High Income Households": 8,
  "Environmental Advocates": -12,
};

export function buildDefaultCohortSentiment(scores: ImpactScores): CohortSentiment[] {
  const base = scores.publicAcceptance;
  return COHORT_PROFILES.map((profile) => {
    const supportPct = Math.max(5, Math.min(95, Math.round(base + (COHORT_BIAS[profile] ?? 0))));
    const opposePct = Math.max(0, Math.min(60, Math.round(100 - supportPct - 15)));
    const neutralPct = Math.max(0, 100 - supportPct - opposePct);
    return { profile, supportPct, opposePct, neutralPct };
  });
}
