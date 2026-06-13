"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDecisionVerdict, TONE_STYLES } from "@/lib/workspace/impact-metrics";

type DecisionVerdictBannerProps = {
  score: number;
  title?: string;
  compact?: boolean;
  className?: string;
};

const VERDICT_ICONS = {
  positive: ShieldCheck,
  warning: ShieldQuestion,
  signal: ArrowRight,
  negative: ShieldAlert,
} as const;

export function DecisionVerdictBanner({ score, title, compact, className }: DecisionVerdictBannerProps) {
  const verdict = getDecisionVerdict(score);
  const styles = TONE_STYLES[verdict.tone];
  const Icon = VERDICT_ICONS[verdict.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border",
        styles.bg,
        styles.border,
        compact ? "px-3 py-2.5" : "px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg border font-display font-bold tabular-nums",
            styles.border,
            compact ? "h-12 w-12 text-lg" : "h-14 w-14 text-xl",
            styles.text,
          )}
        >
          {score}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className={cn("h-4 w-4 shrink-0", styles.text)} />
            <span className={cn("font-display text-sm font-semibold", styles.text)}>{verdict.label}</span>
            {title && (
              <span className="truncate text-xs text-ink-muted">· {title}</span>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-xs leading-snug text-ink-muted">{verdict.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function DecisionVerdictBadge({ score }: { score: number }) {
  const verdict = getDecisionVerdict(score);
  const styles = TONE_STYLES[verdict.tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles.bg,
        styles.border,
        styles.text,
      )}
    >
      {verdict.shortLabel}
    </span>
  );
}
