import type { ConfidenceLevel } from "@/types/simulation";

export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const CONFIDENCE_DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  high: "Multiple corroborating signals; suitable for decision support with standard review.",
  medium: "Reasonable inference with gaps — validate key assumptions before committing.",
  low: "Limited evidence or high uncertainty — treat as directional, not definitive.",
};

export const CONFIDENCE_STYLES: Record<
  ConfidenceLevel,
  { badge: string; dot: string; bar: string }
> = {
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

export function predictionReliabilityLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "high":
      return "Strong — evidence-backed projection";
    case "medium":
      return "Moderate — review assumptions";
    case "low":
      return "Preliminary — not a verified fact";
  }
}
