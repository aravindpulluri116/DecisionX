"use client";

import { useState } from "react";
import { ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedAction } from "@/lib/workspace/report-formatters";
import { ReportPanel } from "./ReportPanel";

type ReportActionsProps = {
  actions: ParsedAction[];
};

export function ReportActions({ actions }: ReportActionsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? actions : actions.slice(0, 3);

  return (
    <ReportPanel label="Priority actions" hint={`${actions.length} recommendations`}>
      <div className="grid gap-2 sm:grid-cols-3">
        {visible.map((action) => {
          const isOpen = expanded === action.index;
          return (
            <button
              key={action.index}
              type="button"
              onClick={() => setExpanded(isOpen ? null : action.index)}
              className={cn(
                "group flex flex-col rounded-xl border border-hairline bg-background/60 p-4 text-left transition-all hover:border-signal/30 hover:shadow-[0_4px_20px_oklch(0.52_0.22_262/0.08)]",
                isOpen && "border-signal/35 bg-signal/5 ring-1 ring-signal/15",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-2xl font-bold tabular-nums text-signal/80">
                  {String(action.index + 1).padStart(2, "0")}
                </span>
                <Target className="h-4 w-4 shrink-0 text-ink-muted/50 group-hover:text-signal" />
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-ink">{action.title}</p>
              {isOpen ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{action.full}</p>
              ) : (
                <p className="mt-2 line-clamp-2 text-xs leading-snug text-ink-muted">{action.full}</p>
              )}
              <span className="mt-3 flex items-center gap-1 font-mono-data text-[9px] uppercase tracking-wider text-signal">
                {isOpen ? "Collapse" : "Details"}
                <ChevronRight className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} />
              </span>
            </button>
          );
        })}
      </div>
      {actions.length > 3 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-hairline py-2 text-center font-mono-data text-[10px] uppercase tracking-wider text-ink-muted hover:border-signal/30 hover:text-signal"
        >
          + {actions.length - 3} more actions
        </button>
      )}
    </ReportPanel>
  );
}
