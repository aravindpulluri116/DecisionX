"use client";

import {
  AlertTriangle,
  Building2,
  Leaf,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ImpactScores } from "@/types/workspace";
import {
  IMPACT_METRICS,
  metricDisplayValue,
  type ImpactMetricDef,
} from "@/lib/workspace/impact-metrics";
import { KpiCard } from "./KpiCard";
import { cn } from "@/lib/utils";

const METRIC_ICONS: Record<ImpactMetricDef["key"], LucideIcon> = {
  economic: TrendingUp,
  social: Users,
  environmental: Leaf,
  infrastructure: Building2,
  politicalRisk: AlertTriangle,
  publicAcceptance: ThumbsUp,
};

type ImpactKpiGridProps = {
  scores: ImpactScores | null;
  compact?: boolean;
  columns?: 2 | 3;
  className?: string;
};

export function ImpactKpiGrid({ scores, compact, columns = 2, className }: ImpactKpiGridProps) {
  if (!scores) {
    return (
      <div className="rounded-xl border border-dashed border-hairline bg-background/60 px-4 py-8 text-center">
        <p className="text-sm font-medium text-ink">No impact data yet</p>
        <p className="mt-1 text-xs text-ink-muted">Run a simulation to populate KPIs.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {IMPACT_METRICS.map((metric, i) => (
        <KpiCard
          key={metric.key}
          label={compact ? metric.shortLabel : metric.label}
          value={metricDisplayValue(scores, metric)}
          tone={metric.tone}
          icon={METRIC_ICONS[metric.key]}
          compact={compact}
          delay={i * 0.04}
        />
      ))}
    </div>
  );
}
