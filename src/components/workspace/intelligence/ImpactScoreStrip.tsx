"use client";

import type { ImpactScores } from "@/types/workspace";
import { getProjectViability } from "@/lib/scoring/viability";

/** Single-row summary for HUD / headers */
export function ImpactScoreSummary({ scores }: { scores: ImpactScores | null }) {
  if (!scores) return null;
  const avg = getProjectViability(scores);
  if (avg == null) return null;
  return (
    <div className="flex items-center gap-3 font-mono-data text-[11px] tabular-nums">
      <span className="text-ink-muted">Viability</span>
      <span className="font-display text-lg font-semibold text-signal">{avg}</span>
    </div>
  );
}
