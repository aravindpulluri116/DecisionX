"use client";

import { motion } from "framer-motion";
import type { TimelineMilestone } from "@/types/timemachine";
import { milestoneLabel } from "@/lib/timemachine/calendarMapper";
import { cn } from "@/lib/utils";

type CinematicTimelineRailProps = {
  milestones: TimelineMilestone[];
  calendarYears: Record<TimelineMilestone, number>;
  active: TimelineMilestone;
  onSelect: (m: TimelineMilestone) => void;
};

export function CinematicTimelineRail({
  milestones,
  calendarYears,
  active,
  onSelect,
}: CinematicTimelineRailProps) {
  return (
    <div className="relative border-b border-hairline bg-surface px-6 py-5">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        ◢ decision time machine
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto">
        {milestones.map((m, i) => (
          <div key={m} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => onSelect(m)}
              className="group flex flex-col items-center"
            >
              <motion.div
                layout
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-colors",
                  active === m ? "border-signal bg-signal" : "border-hairline bg-background group-hover:border-signal/50",
                )}
              />
              <span
                className={cn(
                  "mt-2 font-mono-data text-[10px] uppercase whitespace-nowrap",
                  active === m ? "text-signal" : "text-ink-muted",
                )}
              >
                {milestoneLabel(m, calendarYears)}
              </span>
            </button>
            {i < milestones.length - 1 && (
              <div className="mx-2 h-px flex-1 min-w-[24px] bg-hairline" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
