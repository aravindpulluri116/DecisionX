"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ReasoningStep } from "@/types/evidence";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { cn } from "@/lib/utils";

type ReasoningTimelineProps = {
  steps: ReasoningStep[];
  activeStepId?: string | null;
  onSelectStep?: (stepId: string) => void;
  compact?: boolean;
};

export function ReasoningTimeline({
  steps,
  activeStepId,
  onSelectStep,
  compact,
}: ReasoningTimelineProps) {
  if (steps.length === 0) {
    return (
      <p className="text-xs text-ink-muted">Run a simulation to see the reasoning chain.</p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-hairline" aria-hidden />
      {steps.map((step, i) => {
        const active = activeStepId === step.id;
        return (
          <motion.button
            key={step.id}
            type="button"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelectStep?.(step.id)}
            className={cn(
              "relative flex w-full gap-3 pb-4 text-left last:pb-0",
              onSelectStep && "cursor-pointer",
            )}
          >
            <span
              className={cn(
                "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-surface",
                active ? "border-signal bg-signal/20" : "border-hairline",
              )}
            />
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-3 py-2 transition-colors",
                active ? "border-signal/30 bg-signal/5" : "border-hairline bg-background/50",
                onSelectStep && "hover:border-signal/20",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn("font-medium text-ink", compact ? "text-[11px]" : "text-xs")}>
                  {step.title}
                </p>
                <ConfidenceBadge level={step.confidenceLevel} score={step.confidence} compact />
              </div>
              {!compact && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-muted">
                  {step.summary}
                </p>
              )}
              {onSelectStep && (
                <p className="mt-1 flex items-center gap-0.5 text-[10px] text-signal">
                  What led here?
                  <ChevronRight className="h-3 w-3" />
                </p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
