import type { ConfidenceLevel } from "@/types/simulation";
import type { ConfidenceBasis } from "@/lib/trust/deriveConfidence";

export { CONFIDENCE_LABELS } from "@/lib/trust/labels";

export const CONFIDENCE_DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  very_high: "Multiple agents, geo context, and evidence align — still a projection, not a measurement.",
  high: "Reasonable synthesis with corroborating signals — validate assumptions before committing.",
  medium: "Directional inference with identifiable gaps — not suitable as a sole decision basis.",
  low: "Limited data or agent disagreement — treat as exploratory hypothesis only.",
};

export const CONFIDENCE_STYLES: Record<
  ConfidenceLevel,
  { badge: string; dot: string; bar: string }
> = {
  very_high: {
    badge: "bg-positive/20 text-positive border-positive/40",
    dot: "bg-positive",
    bar: "bg-positive",
  },
  high: {
    badge: "bg-positive/15 text-positive border-positive/30",
    dot: "bg-positive",
    bar: "bg-positive",
  },
  medium: {
    badge: "bg-warning/15 text-warning border-warning/30",
    dot: "bg-warning",
    bar: "bg-warning",
  },
  low: {
    badge: "bg-negative/15 text-negative border-negative/30",
    dot: "bg-negative",
    bar: "bg-negative",
  },
};

/** @deprecated Use deriveConfidence() */
export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function predictionReliabilityLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "very_high":
      return "Strong synthesis — multiple agents and evidence align";
    case "high":
      return "Solid synthesis — review assumptions before acting";
    case "medium":
      return "Directional — gaps in data or agent agreement";
    case "low":
      return "Preliminary — limited data; treat as hypothesis only";
  }
}

export type { ConfidenceBasis };
