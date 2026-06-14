"use client";

import type { ImpactScores } from "@/types/workspace";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";

/** Single-row summary for HUD / headers */
export function ImpactScoreSummary({ scores }: { scores: ImpactScores | null }) {
  if (!scores) return null;
  const avg = computeViabilityIndex(scores);
  return (
    <div className="flex items-center gap-3 font-mono-data text-[11px] tabular-nums">
      <span className="text-ink-muted">Viability</span>
      <span className="font-display text-lg font-semibold text-signal">{avg}</span>
    </div>
  );
}
