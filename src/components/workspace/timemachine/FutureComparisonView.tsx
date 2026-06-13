"use client";

import { motion } from "framer-motion";
import { useFutureComparison } from "@/hooks/useFutureComparison";
import type { TimelineMilestone } from "@/types/timemachine";

type FutureComparisonViewProps = {
  projectId: string;
  milestone?: TimelineMilestone;
};

export function FutureComparisonView({ projectId, milestone = "y10" }: FutureComparisonViewProps) {
  const data = useFutureComparison(projectId, milestone);

  if (!data) {
    return (
      <div className="border-t border-hairline p-4 text-xs text-ink-muted">
        Select two scenarios in Compare mode to view future outcomes side-by-side.
      </div>
    );
  }

  const metrics = [
    ["Support", data.snapshotA.sentiment.supportPct, data.snapshotB.sentiment.supportPct],
    ["Viability", data.snapshotA.viabilityScore, data.snapshotB.viabilityScore],
    ["Infrastructure", data.snapshotA.infrastructure, data.snapshotB.infrastructure],
    ["Employment", data.snapshotA.economic.employment, data.snapshotB.economic.employment],
  ] as const;

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">
        Future comparison · {data.snapshotA.calendarYear}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="font-semibold text-signal">{data.scenarioA.title}</div>
        <div className="font-semibold text-warning">{data.scenarioB.title}</div>
      </div>
      <div className="mt-3 space-y-2">
        {metrics.map(([label, a, b]) => (
          <div key={label}>
            <p className="text-[10px] text-ink-muted">{label}</p>
            <div className="grid grid-cols-2 gap-2 font-mono-data">
              <motion.span key={a} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                {a}
              </motion.span>
              <motion.span key={b} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                {b}
              </motion.span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
