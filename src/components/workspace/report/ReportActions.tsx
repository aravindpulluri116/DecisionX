"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedAction } from "@/lib/workspace/report-formatters";

type ReportActionsProps = {
  actions: ParsedAction[];
};

export function ReportActions({ actions }: ReportActionsProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section>
      <h2 className="font-display text-sm font-semibold text-ink">Priority actions</h2>
      <p className="mt-1 text-xs text-ink-muted">What to do next, in order</p>
      <ol className="mt-4 space-y-2">
        {actions.map((action) => {
          const isOpen = expanded === action.index;
          return (
            <li key={action.index}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : action.index)}
                className={cn(
                  "w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-left transition-colors",
                  isOpen && "border-signal/30 ring-1 ring-signal/15",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-lg font-bold tabular-nums text-signal">
                    {String(action.index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-ink">{action.title}</p>
                    {!isOpen && (
                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-ink-muted">{action.full}</p>
                    )}
                    {isOpen && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{action.full}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
