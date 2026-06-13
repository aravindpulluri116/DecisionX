"use client";

import { motion } from "framer-motion";
import type { ImpactScores } from "@/types/workspace";
import {
  IMPACT_METRICS,
  computeViabilityIndex,
  metricDisplayValue,
} from "@/lib/workspace/impact-metrics";
import { TONE_STYLES } from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";

type ImpactScoreStripProps = {
  scores: ImpactScores | null;
  compact?: boolean;
};

/** Horizontal strip — used in HUD / narrow slots */
export function ImpactScoreStrip({ scores, compact }: ImpactScoreStripProps) {
  if (!scores) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-background/60 px-4 py-4 text-center text-xs text-ink-muted">
        Run a simulation to generate impact scores.
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
      {IMPACT_METRICS.map((m, i) => {
        const display = metricDisplayValue(scores, m);
        const styles = TONE_STYLES[m.tone];
        return (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-ink-muted">{compact ? m.shortLabel : m.label}</span>
              <span className={cn("font-mono-data text-xs tabular-nums", styles.text)}>{display}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-hairline">
              <motion.div
                className={cn("h-full rounded-full", styles.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${display}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

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
