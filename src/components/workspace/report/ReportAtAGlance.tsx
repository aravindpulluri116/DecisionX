"use client";

import type { ImpactScores } from "@/types/workspace";
import { IMPACT_METRICS, metricDisplayValue } from "@/lib/workspace/impact-metrics";
import { ImpactKpiGrid } from "../shared/ImpactKpiGrid";
import { cn } from "@/lib/utils";

type ReportAtAGlanceProps = {
  scores: ImpactScores;
  onMetricClick?: (metric: keyof ImpactScores) => void;
};

export function ReportAtAGlance({ scores, onMetricClick }: ReportAtAGlanceProps) {
  const ranked = IMPACT_METRICS.map((m) => ({
    ...m,
    value: metricDisplayValue(scores, m),
  })).sort((a, b) => a.value - b.value);

  const weakest = ranked.slice(0, 2);
  const strongest = ranked.slice(-2).reverse();

  return (
    <section className="rounded-xl border border-hairline bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-ink">At a glance</h2>
        <p className="text-[10px] text-ink-muted">Tap a score for evidence</p>
      </div>

      <div className="mt-4">
        <ImpactKpiGrid scores={scores} onMetricClick={onMetricClick} columns={3} compact />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-negative/5 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-negative">Needs attention</p>
          <ul className="mt-1.5 space-y-1">
            {weakest.map((m) => (
              <li key={m.key} className="flex items-center justify-between gap-2 text-xs text-ink">
                <span>{m.label}</span>
                <span className={cn("font-display font-bold tabular-nums", "text-negative")}>{m.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-positive/5 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-positive">Relative strengths</p>
          <ul className="mt-1.5 space-y-1">
            {strongest.map((m) => (
              <li key={m.key} className="flex items-center justify-between gap-2 text-xs text-ink">
                <span>{m.label}</span>
                <span className={cn("font-display font-bold tabular-nums", "text-positive")}>{m.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
