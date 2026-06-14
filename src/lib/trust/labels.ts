import type { ConfidenceLevel, StakeholderSentiment, SupportTrend } from "@/types/simulation";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: "Low Confidence",
  medium: "Medium Confidence",
  high: "High Confidence",
  very_high: "Very High Confidence",
};

export const SENTIMENT_LABELS: Record<StakeholderSentiment, string> = {
  strong_support: "Strong Support",
  moderate_support: "Moderate Support",
  mixed_sentiment: "Mixed Sentiment",
  moderate_opposition: "Moderate Opposition",
  strong_opposition: "Strong Opposition",
  concerned: "Concerned",
};

export const SUPPORT_TREND_LABELS: Record<SupportTrend, string> = {
  strong_support: "Strong Support Trend",
  moderate_support: "Moderate Support Trend",
  mixed_sentiment: "Mixed Sentiment",
  moderate_opposition: "Moderate Opposition Trend",
  strong_opposition: "Strong Opposition Trend",
};

export const DATA_AVAILABILITY_LABELS = {
  limited: "Limited data",
  partial: "Partial data",
  good: "Good data coverage",
} as const;

export const AGENT_AGREEMENT_LABELS = {
  low: "Low agent agreement",
  moderate: "Moderate agent agreement",
  high: "High agent agreement",
} as const;
