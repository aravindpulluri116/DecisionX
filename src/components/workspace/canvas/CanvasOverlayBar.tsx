"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import { DecisionVerdictBadge } from "../shared/DecisionVerdictBanner";
import { CANVAS_LEGEND } from "./nodes/CanvasNodes";
import { cn } from "@/lib/utils";

const legendChip: Record<string, string> = {
  signal: "bg-signal",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  environmental: "bg-environmental",
};

export function CanvasOverlayBar({ nodeCount, edgeCount }: { nodeCount: number; edgeCount: number }) {
  const scores = useWorkspaceStore((s) => s.selectedScenario?.impact_scores ?? null);
  const viability = scores ? computeViabilityIndex(scores) : null;

  return (
    <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline/80 bg-surface/92 px-3 py-2 shadow-sm backdrop-blur-sm">
        {viability != null && (
          <>
            <span className="font-display text-lg font-bold tabular-nums text-signal">{viability}</span>
            <DecisionVerdictBadge score={viability} />
            <span className="h-3 w-px bg-hairline" />
          </>
        )}
        <span className="text-[11px] text-ink-muted">
          {nodeCount} nodes · {edgeCount} links
        </span>
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-hairline/80 bg-surface/92 px-3 py-2 shadow-sm backdrop-blur-sm sm:flex">
        {CANVAS_LEGEND.map((item) => (
          <span key={item.type} className="flex items-center gap-1 text-[10px] text-ink-muted">
            <span className={cn("h-1.5 w-1.5 rounded-full", legendChip[item.tone])} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
