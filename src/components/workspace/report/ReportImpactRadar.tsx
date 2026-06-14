"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import type { ImpactScores } from "@/types/workspace";
import {
  IMPACT_METRICS,
  metricDisplayValue,
  TONE_STYLES,
} from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";

type ReportImpactRadarProps = {
  scores: ImpactScores;
  onMetricClick?: (metric: keyof ImpactScores) => void;
  className?: string;
};

export function ReportImpactRadar({ scores, onMetricClick, className }: ReportImpactRadarProps) {
  const data = IMPACT_METRICS.map((m) => ({
    key: m.key,
    metric: m.shortLabel,
    value: metricDisplayValue(scores, m),
    fullMark: 100,
  }));

  const ranked = [...data].sort((a, b) => a.value - b.value);
  const weakest = ranked.slice(0, 2);
  const strongest = ranked.slice(-2).reverse();

  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center", className)}>
      <div className="h-52 w-full shrink-0 lg:h-56 lg:w-[55%]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="78%">
            <PolarGrid stroke="var(--hairline)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fill: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
            />
            <Radar
              name="Impact"
              dataKey="value"
              stroke="var(--signal)"
              fill="var(--signal)"
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid flex-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-negative/20 bg-negative/5 p-3">
          <p className="font-mono-data text-[9px] uppercase tracking-wider text-negative">Watch</p>
          <ul className="mt-2 space-y-1.5">
            {weakest.map((m) => {
              const def = IMPACT_METRICS.find((d) => d.key === m.key)!;
              const tone = TONE_STYLES[def.tone];
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => onMetricClick?.(m.key)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="text-xs text-ink">{def.label}</span>
                    <span className={cn("font-display text-sm font-bold tabular-nums", tone.text)}>
                      {m.value}
                    </span>
                  </button>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-hairline">
                    <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${m.value}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-lg border border-positive/20 bg-positive/5 p-3">
          <p className="font-mono-data text-[9px] uppercase tracking-wider text-positive">Strength</p>
          <ul className="mt-2 space-y-1.5">
            {strongest.map((m) => {
              const def = IMPACT_METRICS.find((d) => d.key === m.key)!;
              const tone = TONE_STYLES[def.tone];
              return (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => onMetricClick?.(m.key)}
                    className="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <span className="text-xs text-ink">{def.label}</span>
                    <span className={cn("font-display text-sm font-bold tabular-nums", tone.text)}>
                      {m.value}
                    </span>
                  </button>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-hairline">
                    <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${m.value}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
