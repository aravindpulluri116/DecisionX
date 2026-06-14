"use client";

import type { ImpactScores } from "@/types/workspace";
import { IMPACT_METRICS, metricDisplayValue, TONE_STYLES } from "@/lib/workspace/impact-metrics";
import { ReportPanel } from "./ReportPanel";
import { ReportImpactRadar } from "./ReportImpactRadar";
import { cn } from "@/lib/utils";

type ReportAtAGlanceProps = {
  scores: ImpactScores;
  onMetricClick?: (metric: keyof ImpactScores) => void;
};

export function ReportAtAGlance({ scores, onMetricClick }: ReportAtAGlanceProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-hairline shadow-sm">
      <div className="grid gap-px bg-hairline lg:grid-cols-[1fr_minmax(0,280px)]">
        <ReportPanel label="Impact profile" hint="Tap metrics for evidence">
          <ReportImpactRadar scores={scores} onMetricClick={onMetricClick} />
        </ReportPanel>

        <ReportPanel label="All dimensions" hint="0–100 scale">
          <ul className="space-y-2">
            {IMPACT_METRICS.map((m) => {
              const value = metricDisplayValue(scores, m);
              const tone = TONE_STYLES[m.tone];
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => onMetricClick?.(m.key)}
                    className="group flex w-full items-center gap-3 text-left"
                  >
                    <span className="w-16 shrink-0 font-mono-data text-[10px] uppercase tracking-wide text-ink-muted">
                      {m.shortLabel}
                    </span>
                    <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-hairline">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all group-hover:brightness-110",
                          tone.bar,
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className={cn("w-8 shrink-0 text-right font-display text-sm font-bold tabular-nums", tone.text)}>
                      {value}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ReportPanel>
      </div>
    </div>
  );
}
