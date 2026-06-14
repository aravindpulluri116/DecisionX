import type { ImpactScores } from "@/types/workspace";
import {
  IMPACT_METRICS,
  computeViabilityIndex,
  metricDisplayValue,
  type ImpactMetricDef,
} from "@/lib/workspace/impact-metrics";
import type { ParsedAlternative } from "@/lib/workspace/report-formatters";

export type ProjectedAlternative = {
  name: string;
  budgetLabel?: string;
  timeline?: string;
  bullets: string[];
  scores: ImpactScores;
  viability: number;
  viabilityDelta: number | null;
  /** Parsed budget in ₹ crore when available */
  budgetCrore: number | null;
  isProjected: true;
  source?: "ai" | "heuristic";
  tradeoffSummary?: string;
  recommendedOverCurrent?: boolean;
};

export type MetricComparison = {
  key: ImpactMetricDef["key"];
  label: string;
  current: number;
  alternative: number;
  delta: number;
  winner: "current" | "alternative" | "tie";
};

export function parseViabilityDelta(deltaStr?: string): number | null {
  if (!deltaStr) return null;
  const match = deltaStr.match(/([+-]?\d+)/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export function parseBudgetCroreFromText(text?: string): number | null {
  if (!text) return null;
  const normalized = text.replace(/,/g, "");
  const match = normalized.match(/([\d.]+)\s*(?:cr|crore|₹)?/i) ?? normalized.match(/₹?\s*([\d.]+)/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/** Keyword-driven nudges from CDO alternative bullets (directional, not simulated). */
function inferBulletAdjustments(bullets: string[]): Partial<Record<keyof ImpactScores, number>> {
  const text = bullets.join(" ").toLowerCase();
  const adj: Partial<Record<keyof ImpactScores, number>> = {};

  const bump = (key: keyof ImpactScores, amount: number) => {
    adj[key] = (adj[key] ?? 0) + amount;
  };

  if (/public acceptance|community|stakeholder|resident|local support/.test(text)) {
    bump("publicAcceptance", 10);
    bump("social", 6);
  }
  if (/environment|green|emission|ecolog|sustain|pollution/.test(text)) {
    bump("environmental", 12);
  }
  if (/phased|incremental|staged|modular/.test(text)) {
    bump("infrastructure", 5);
    bump("politicalRisk", -8);
  }
  if (/lower cost|reduce budget|cost.?eff|affordable|cheaper/.test(text)) {
    bump("economic", 8);
    bump("politicalRisk", -5);
  }
  if (/job|employment|economic growth|gdp|investment/.test(text)) {
    bump("economic", 10);
  }
  if (/risk|political|opposition|protest|land acquisition/.test(text)) {
    bump("politicalRisk", 6);
  }
  if (/transit|connectivity|infra|road|rail|metro|highway/.test(text)) {
    bump("infrastructure", 8);
  }

  return adj;
}

function applyAdjustments(baseline: ImpactScores, adjustments: Partial<Record<keyof ImpactScores, number>>): ImpactScores {
  const next = { ...baseline };
  for (const metric of IMPACT_METRICS) {
    const adj = adjustments[metric.key];
    if (adj == null) continue;
    if (metric.invert) {
      next[metric.key] = clamp(next[metric.key] - adj);
    } else {
      next[metric.key] = clamp(next[metric.key] + adj);
    }
  }
  return next;
}

function nudgeToTargetViability(baseline: ImpactScores, targetViability: number): ImpactScores {
  const current = computeViabilityIndex(baseline);
  const gap = targetViability - current;
  if (Math.abs(gap) < 0.5) return baseline;

  const next = { ...baseline };
  const perMetric = gap / IMPACT_METRICS.length;

  for (const metric of IMPACT_METRICS) {
    if (metric.invert) {
      next[metric.key] = clamp(next[metric.key] - perMetric);
    } else {
      next[metric.key] = clamp(next[metric.key] + perMetric);
    }
  }
  return next;
}

export function projectAlternativeFromReport(
  baseline: ImpactScores,
  parsed: ParsedAlternative,
): ProjectedAlternative {
  const viabilityDelta = parseViabilityDelta(parsed.viabilityDelta);
  const bulletAdj = inferBulletAdjustments(parsed.bullets);
  let scores = applyAdjustments(baseline, bulletAdj);

  const baselineViability = computeViabilityIndex(baseline);
  let viability = computeViabilityIndex(scores);

  if (viabilityDelta != null) {
    const target = clamp(baselineViability + viabilityDelta);
    scores = nudgeToTargetViability(scores, target);
    viability = computeViabilityIndex(scores);
  }

  return {
    name: parsed.name,
    budgetLabel: parsed.budget,
    timeline: parsed.timeline,
    bullets: parsed.bullets,
    scores,
    viability,
    viabilityDelta,
    budgetCrore: parseBudgetCroreFromText(parsed.budget),
    isProjected: true,
    source: "heuristic",
  };
}

export function buildMetricComparisons(
  current: ImpactScores,
  alternative: ImpactScores,
): MetricComparison[] {
  return IMPACT_METRICS.map((metric) => {
    const a = metricDisplayValue(current, metric);
    const b = metricDisplayValue(alternative, metric);
    const delta = b - a;
    return {
      key: metric.key,
      label: metric.label,
      current: a,
      alternative: b,
      delta,
      winner: delta > 0 ? "alternative" : delta < 0 ? "current" : "tie",
    };
  });
}

export function summarizeTradeoffs(comparisons: MetricComparison[]): {
  alternativeWins: MetricComparison[];
  currentWins: MetricComparison[];
} {
  const alternativeWins = comparisons
    .filter((c) => c.winner === "alternative" && Math.abs(c.delta) >= 2)
    .sort((a, b) => b.delta - a.delta);
  const currentWins = comparisons
    .filter((c) => c.winner === "current" && Math.abs(c.delta) >= 2)
    .sort((a, b) => a.delta - b.delta);
  return { alternativeWins, currentWins };
}
