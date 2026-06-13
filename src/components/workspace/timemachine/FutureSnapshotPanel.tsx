"use client";

import { motion } from "framer-motion";
import type { FutureSnapshot } from "@/types/timemachine";
import { getDecisionVerdict, TONE_STYLES } from "@/lib/workspace/impact-metrics";
import { KpiCard } from "../shared/KpiCard";
import { Building2, Leaf, ThumbsUp, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type FutureSnapshotPanelProps = {
  snapshot: FutureSnapshot | null;
};

export function FutureSnapshotPanel({ snapshot }: FutureSnapshotPanelProps) {
  if (!snapshot) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm font-medium text-ink">No future snapshot</p>
        <p className="text-xs text-ink-muted">Run a simulation to explore projected outcomes.</p>
      </div>
    );
  }

  const verdict = getDecisionVerdict(snapshot.viabilityScore);
  const verdictStyles = TONE_STYLES[verdict.tone];

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Future · {snapshot.calendarYear}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className={cn("font-display text-3xl font-bold tabular-nums", verdictStyles.text)}>
            {snapshot.viabilityScore}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
              verdictStyles.bg,
              verdictStyles.border,
              verdictStyles.text,
            )}
          >
            {verdict.shortLabel}
          </span>
        </div>
        <p className="mt-1 text-xs capitalize text-ink-muted">{snapshot.politicalViability} viability</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <KpiCard label="Infrastructure" value={snapshot.infrastructure} tone="neutral" icon={Building2} compact />
        <KpiCard label="Support" value={snapshot.sentiment.supportPct} tone="positive" icon={ThumbsUp} compact />
        <KpiCard label="Business" value={snapshot.economic.businessActivity} tone="signal" icon={TrendingUp} compact />
        <KpiCard label="Green space" value={snapshot.environmental.greenSpaces} tone="environmental" icon={Leaf} compact />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-hairline bg-background/60 px-3 py-2.5"
      >
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase text-ink-muted">
          <Users className="h-3 w-3" />
          Population
        </div>
        <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink">
          ~{(snapshot.population.totalEstimate / 1_000_000).toFixed(2)}M
        </p>
        <p className="text-[11px] capitalize text-ink-muted">
          Migration {snapshot.population.migrationDirection} · density {snapshot.population.densityIndex}
        </p>
      </motion.div>
    </div>
  );
}
