"use client";

import { AlertTriangle, GitBranch, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { severityTone } from "@/lib/workspace/report-formatters";
import type { ParsedRisk } from "@/lib/workspace/report-formatters";

type ReportInsightsGridProps = {
  supportScore?: number;
  oppositionScore?: number;
  affectedGroups?: string[];
  stakeholderSummary: string;
  risks: ParsedRisk[];
  consequenceSteps: string[];
};

function StakeholderBar({ label, value, tone }: { label: string; value: number; tone: "positive" | "negative" | "neutral" }) {
  const colors = {
    positive: "bg-positive",
    negative: "bg-negative",
    neutral: "bg-ink/30",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-display font-semibold tabular-nums text-ink">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-hairline">
        <div className={cn("h-full rounded-full transition-all", colors[tone])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ReportInsightsGrid({
  supportScore,
  oppositionScore,
  affectedGroups,
  stakeholderSummary,
  risks,
  consequenceSteps,
}: ReportInsightsGridProps) {
  const hasStakeholderData = supportScore != null || oppositionScore != null;
  const neutral =
    supportScore != null && oppositionScore != null
      ? Math.max(0, 100 - supportScore - oppositionScore)
      : null;

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <article className="rounded-xl border border-hairline bg-surface p-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-warning" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Stakeholders</h2>
        </div>

        {hasStakeholderData ? (
          <div className="mt-3 space-y-3">
            {supportScore != null && <StakeholderBar label="Support" value={supportScore} tone="positive" />}
            {oppositionScore != null && <StakeholderBar label="Opposition" value={oppositionScore} tone="negative" />}
            {neutral != null && neutral > 0 && <StakeholderBar label="Neutral" value={neutral} tone="neutral" />}
          </div>
        ) : (
          <p className="mt-3 line-clamp-3 text-sm leading-snug text-ink-muted">{stakeholderSummary}</p>
        )}

        {affectedGroups && affectedGroups.length > 0 && (
          <ul className="mt-3 space-y-1">
            {affectedGroups.slice(0, 4).map((g) => (
              <li key={g} className="truncate text-xs text-ink">
                · {g.split("—")[0].split(" - ")[0].trim()}
              </li>
            ))}
            {affectedGroups.length > 4 && (
              <li className="text-[10px] text-ink-muted">+{affectedGroups.length - 4} more groups</li>
            )}
          </ul>
        )}
      </article>

      <article className="rounded-xl border border-hairline bg-surface p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-negative" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Top risks</h2>
        </div>
        <ul className="mt-3 space-y-2">
          {risks.slice(0, 4).map((risk, i) => {
            const tone = severityTone(risk.severity);
            const toneClass =
              tone === "negative"
                ? "border-negative/30 bg-negative/8 text-negative"
                : tone === "warning"
                  ? "border-warning/30 bg-warning/8 text-warning"
                  : "border-signal/30 bg-signal/8 text-signal";
            return (
              <li key={`${risk.category}-${i}`} className="rounded-lg border border-hairline px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", toneClass)}>
                    {risk.severity}
                  </span>
                  <span className="text-xs font-medium text-ink">{risk.category}</span>
                </div>
                <p className="mt-1 line-clamp-3 text-xs leading-snug text-ink-muted">{risk.description}</p>
              </li>
            );
          })}
        </ul>
      </article>

      <article className="rounded-xl border border-hairline bg-surface p-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-signal" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Future chain</h2>
        </div>
        <ol className="mt-3 space-y-0">
          {consequenceSteps.slice(0, 4).map((step, i) => (
            <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
              {i < consequenceSteps.length - 1 && (
                <span className="absolute left-[11px] top-6 h-full w-px bg-hairline" aria-hidden />
              )}
              <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-signal/30 bg-signal/10 text-[10px] font-bold text-signal">
                {i + 1}
              </span>
              <p className="pt-0.5 text-xs leading-snug text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}
