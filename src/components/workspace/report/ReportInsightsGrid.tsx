"use client";

import { AlertTriangle, GitBranch, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { severityTone } from "@/lib/workspace/report-formatters";
import type { ParsedRisk } from "@/lib/workspace/report-formatters";
import type { StakeholderTrustView } from "@/lib/trust/stakeholderSentiment";
import { sentimentLabel } from "@/lib/trust/stakeholderSentiment";

type ReportInsightsGridProps = {
  stakeholderView: StakeholderTrustView | null;
  stakeholderSummary: string;
  risks: ParsedRisk[];
  consequenceSteps: string[];
};

const SENTIMENT_STYLE: Record<string, string> = {
  strong_support: "text-positive bg-positive/10 border-positive/25",
  moderate_support: "text-positive/90 bg-positive/5 border-positive/20",
  mixed_sentiment: "text-warning bg-warning/10 border-warning/25",
  moderate_opposition: "text-negative/90 bg-negative/5 border-negative/20",
  strong_opposition: "text-negative bg-negative/10 border-negative/25",
  concerned: "text-warning bg-warning/8 border-warning/20",
};

export function ReportInsightsGrid({
  stakeholderView,
  stakeholderSummary,
  risks,
  consequenceSteps,
}: ReportInsightsGridProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <article className="rounded-xl border border-hairline bg-surface p-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-warning" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Stakeholders</h2>
        </div>

        {stakeholderView ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-signal/20 bg-signal/5 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Support trend</p>
              <p className="mt-1 text-sm font-medium text-ink">{stakeholderView.supportTrendLabel}</p>
              <p className="mt-1 text-[10px] text-ink-muted">Qualitative estimate — not measured public opinion</p>
            </div>
            <ul className="space-y-2">
              {stakeholderView.groups.slice(0, 6).map((entry) => (
                <li
                  key={entry.group}
                  className="flex items-center justify-between gap-2 rounded-lg border border-hairline px-3 py-2"
                >
                  <span className="min-w-0 truncate text-xs text-ink">{entry.group}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      SENTIMENT_STYLE[entry.sentiment] ?? SENTIMENT_STYLE.mixed_sentiment,
                    )}
                  >
                    {sentimentLabel(entry.sentiment)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 line-clamp-3 text-sm leading-snug text-ink-muted">{stakeholderSummary}</p>
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
