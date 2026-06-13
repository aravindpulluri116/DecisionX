"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_STYLES, type MetricTone } from "@/lib/workspace/impact-metrics";

type KpiCardProps = {
  label: string;
  value: number;
  tone?: MetricTone;
  icon?: LucideIcon;
  suffix?: string;
  compact?: boolean;
  showBar?: boolean;
  className?: string;
  delay?: number;
};

export function KpiCard({
  label,
  value,
  tone = "signal",
  icon: Icon,
  suffix,
  compact,
  showBar = true,
  className,
  delay = 0,
}: KpiCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "rounded-xl border px-3 py-2.5",
        styles.bg,
        styles.border,
        compact ? "py-2" : "py-2.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {label}
          </p>
          <p className={cn("mt-0.5 font-display tabular-nums font-bold", compact ? "text-xl" : "text-2xl", styles.text)}>
            {value}
            {suffix && <span className="ml-0.5 text-sm font-medium text-ink-muted">{suffix}</span>}
          </p>
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-1.5", styles.bg, styles.border, "border")}>
            <Icon className={cn("h-3.5 w-3.5", styles.text)} />
          </div>
        )}
      </div>
      {showBar && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
          <motion.div
            className={cn("h-full rounded-full", styles.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            transition={{ duration: 0.55, delay: delay + 0.08, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </motion.div>
  );
}
