"use client";

import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/simulation";
import { CONFIDENCE_LABELS, CONFIDENCE_STYLES } from "@/lib/evidence/confidence";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
  score?: number;
  compact?: boolean;
  className?: string;
};

export function ConfidenceBadge({ level, score, compact, className }: ConfidenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono-data uppercase tracking-wide",
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]",
        CONFIDENCE_STYLES[level].badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", CONFIDENCE_STYLES[level].dot)} />
      {CONFIDENCE_LABELS[level]}
      {score != null && <span className="tabular-nums opacity-80">{score}%</span>}
    </span>
  );
}

type ConfidenceMeterProps = {
  score: number;
  level: ConfidenceLevel;
  label?: string;
};

export function ConfidenceMeter({ score, level, label = "Confidence" }: ConfidenceMeterProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
        <ConfidenceBadge level={level} score={score} compact />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-hairline">
        <div
          className={cn("h-full rounded-full transition-all", CONFIDENCE_STYLES[level].bar)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
