import type { ImpactScores } from "@/types/workspace";

export type MetricTone = "signal" | "positive" | "environmental" | "neutral" | "negative" | "warning";

export type ImpactMetricDef = {
  key: keyof ImpactScores;
  label: string;
  shortLabel: string;
  tone: MetricTone;
  /** When true, lower raw score is better (e.g. political risk). */
  invert?: boolean;
};

export const IMPACT_METRICS: ImpactMetricDef[] = [
  { key: "economic", label: "Economic", shortLabel: "Econ", tone: "signal" },
  { key: "social", label: "Social", shortLabel: "Social", tone: "positive" },
  { key: "environmental", label: "Environmental", shortLabel: "Env", tone: "environmental" },
  { key: "infrastructure", label: "Infrastructure", shortLabel: "Infra", tone: "neutral" },
  { key: "politicalRisk", label: "Political risk", shortLabel: "Risk", tone: "negative", invert: true },
  { key: "publicAcceptance", label: "Public acceptance", shortLabel: "Public", tone: "warning" },
];

export function computeViabilityIndex(scores: ImpactScores): number {
  return Math.round(
    (scores.economic +
      scores.social +
      scores.environmental +
      scores.infrastructure +
      scores.publicAcceptance +
      (100 - scores.politicalRisk)) /
      6,
  );
}

export function metricDisplayValue(scores: ImpactScores, metric: ImpactMetricDef): number {
  const raw = scores[metric.key];
  return metric.invert ? 100 - raw : raw;
}

export type DecisionVerdict = {
  label: string;
  shortLabel: string;
  tone: "positive" | "warning" | "signal" | "negative";
  description: string;
};

export function getDecisionVerdict(score: number): DecisionVerdict {
  if (score >= 75) {
    return {
      label: "Proceed",
      shortLabel: "Proceed",
      tone: "positive",
      description: "Strong alignment across economic, social, and risk dimensions.",
    };
  }
  if (score >= 60) {
    return {
      label: "Conditional proceed",
      shortLabel: "Conditional",
      tone: "warning",
      description: "Viable with targeted mitigations on flagged risks.",
    };
  }
  if (score >= 45) {
    return {
      label: "Review required",
      shortLabel: "Review",
      tone: "signal",
      description: "Material gaps remain — resolve before commitment.",
    };
  }
  return {
    label: "Not recommended",
    shortLabel: "Reject",
    tone: "negative",
    description: "Projected impacts do not justify proceeding as modeled.",
  };
}

export const TONE_STYLES: Record<
  MetricTone | DecisionVerdict["tone"],
  { text: string; bg: string; border: string; bar: string }
> = {
  signal: {
    text: "text-signal",
    bg: "bg-signal/8",
    border: "border-signal/25",
    bar: "bg-signal",
  },
  positive: {
    text: "text-positive",
    bg: "bg-positive/8",
    border: "border-positive/25",
    bar: "bg-positive",
  },
  environmental: {
    text: "text-environmental",
    bg: "bg-environmental/8",
    border: "border-environmental/25",
    bar: "bg-environmental",
  },
  neutral: {
    text: "text-ink",
    bg: "bg-ink/5",
    border: "border-ink/15",
    bar: "bg-ink/60",
  },
  negative: {
    text: "text-negative",
    bg: "bg-negative/8",
    border: "border-negative/25",
    bar: "bg-negative",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/8",
    border: "border-warning/25",
    bar: "bg-warning",
  },
};

/** Truncate only when text exceeds max; ellipsis appears only if actually cut. */
export function truncateText(text: string, max = 140): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

/** First complete sentence — no ellipsis, no mid-sentence cut. */
export function excerptText(text: string, max = 140): string {
  return leadSentence(text, max);
}

const SENTENCE_ABBREV = /\b(Mr|Mrs|Ms|Dr|Prof|Cr|vs|etc|approx|No|St)\.$/i;

/** Returns the first full sentence, or full text if shorter than max. Never appends ellipsis. */
export function leadSentence(text: string, max = 400): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (trimmed.length <= max) return trimmed;

  let searchFrom = 0;
  while (searchFrom < trimmed.length) {
    const chunk = trimmed.slice(searchFrom);
    const relEnd = chunk.search(/[.!?](?:\s+|$|\n)/);
    if (relEnd === -1) break;

    const end = searchFrom + relEnd + 1;
    const candidate = trimmed.slice(0, end).trim();
    const wordBefore = trimmed.slice(Math.max(0, end - 5), end - 1);

    if (end > 30 && !SENTENCE_ABBREV.test(`${wordBefore}.`)) {
      return candidate;
    }
    searchFrom = end;
  }

  // One long sentence — return up to max without ellipsis (UI can line-clamp)
  return trimmed.slice(0, max).trim();
}
