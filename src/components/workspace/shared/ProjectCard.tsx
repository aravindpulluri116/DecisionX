"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatBudgetCrore } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import type { Project, RiskLevel } from "@/types/workspace";

const riskStyles: Record<RiskLevel, { dot: string; label: string; bg: string }> = {
  low: { dot: "bg-positive", label: "Low risk", bg: "bg-positive/10 text-positive" },
  medium: { dot: "bg-warning", label: "Medium risk", bg: "bg-warning/10 text-warning" },
  high: { dot: "bg-negative", label: "High risk", bg: "bg-negative/10 text-negative" },
  critical: { dot: "bg-negative", label: "Critical", bg: "bg-negative/15 text-negative" },
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

type ProjectCardProps = {
  project: Project;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const risk = riskStyles[project.risk_level];
  const category = project.category ?? project.project_type ?? "Decision";
  const impact = Math.min(100, Math.max(0, project.impact_score ?? 0));

  return (
    <Link
      href={`/workspace/${project.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border border-hairline bg-surface p-5 transition-all",
        "hover:border-signal/30 hover:shadow-[0_8px_32px_oklch(0.52_0.22_262/0.1)] hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink transition-colors group-hover:text-signal">
            {project.title}
          </p>
          <p className="mt-1 truncate text-sm text-ink-muted">
            {project.location || "No location"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide",
            risk.bg,
          )}
        >
          {risk.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
          {category}
        </span>
        {project.budget != null && project.budget > 0 && (
          <span className="font-mono-data text-[10px] text-ink-muted">
            {formatBudgetCrore(project.budget, { compact: true })}
          </span>
        )}
        {project.timeline && (
          <span className="font-mono-data text-[10px] text-ink-muted">{project.timeline}</span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
            Impact score
          </span>
          <span className="font-display text-sm font-semibold tabular-nums text-ink">{impact}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-gradient-to-r from-signal to-environmental transition-all"
            style={{ width: `${impact}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
        <span className="font-mono-data text-[10px] text-ink-muted">
          {formatRelativeDate(project.created_at)}
        </span>
        <span className="flex items-center gap-1 font-mono-data text-[10px] uppercase text-signal opacity-0 transition-opacity group-hover:opacity-100">
          Open
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
