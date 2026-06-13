"use client";

import { FileText, Lightbulb, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useReport } from "@/hooks/useSimulationQueries";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { excerptText } from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";

export function ReportView() {
  const activeReport = useWorkspaceStore((s) => s.activeReport);
  const activeSimulationId = useWorkspaceStore((s) => s.activeSimulationId);
  const { data: fetchedReport } = useReport(activeSimulationId ? activeReport?.id ?? null : null);

  const report = activeReport ?? fetchedReport;

  if (!report) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <FileText className="h-8 w-8 text-ink-muted/50" />
        <p className="text-sm font-medium text-ink">No report yet</p>
        <p className="text-xs text-ink-muted">Run an analysis to generate an executive decision brief.</p>
      </div>
    );
  }

  const viability = report.sections.viabilityScore ?? null;

  const insightCards = [
    {
      title: "Executive summary",
      body: excerptText(report.sections.executiveSummary, 180),
      icon: TrendingUp,
      tone: "signal" as const,
    },
    {
      title: "Stakeholders",
      body: excerptText(report.sections.stakeholderAnalysis, 160),
      icon: Users,
      tone: "warning" as const,
    },
    {
      title: "Risk outlook",
      body: excerptText(report.sections.riskAnalysis, 160),
      icon: ShieldAlert,
      tone: "negative" as const,
    },
    {
      title: "Future trajectory",
      body: excerptText(report.sections.futureOutlook, 160),
      icon: Lightbulb,
      tone: "positive" as const,
    },
  ];

  const toneCard = {
    signal: "border-signal/25 bg-signal/6",
    warning: "border-warning/25 bg-warning/6",
    negative: "border-negative/25 bg-negative/6",
    positive: "border-positive/25 bg-positive/6",
  };

  const toneIcon = {
    signal: "text-signal",
    warning: "text-warning",
    negative: "text-negative",
    positive: "text-positive",
  };

  return (
    <div className="report-view h-full overflow-y-auto bg-background print:bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10 print:py-8 md:px-10">
        <header className="space-y-4">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            DecisionX · Executive brief
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {report.projectTitle}
          </h1>
          <p className="font-mono-data text-[11px] text-ink-muted">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
          {viability != null && <DecisionVerdictBanner score={viability} />}
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {insightCards.map((card) => (
            <article
              key={card.title}
              className={cn("rounded-xl border p-4 print:break-inside-avoid", toneCard[card.tone])}
            >
              <div className="flex items-center gap-2">
                <card.icon className={cn("h-4 w-4", toneIcon[card.tone])} />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{card.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/90">{card.body}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 print:break-inside-avoid">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Recommended actions</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {report.sections.recommendations.map((r, i) => (
              <div
                key={r}
                className="flex gap-3 rounded-xl border border-hairline bg-surface px-4 py-3"
              >
                <span className="font-display text-lg font-bold tabular-nums text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-snug text-ink">{r}</p>
              </div>
            ))}
          </div>
        </section>

        {(report.sections.alternativeScenarios?.length ?? 0) > 0 && (
          <section className="mt-8 print:break-inside-avoid">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Alternatives</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.sections.alternativeScenarios!.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-signal/25 bg-signal/8 px-3 py-1 text-xs text-ink"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {((report.sections.assumptions?.length ?? 0) > 0 ||
          (report.sections.uncertainties?.length ?? 0) > 0) && (
          <section className="mt-8 grid gap-3 sm:grid-cols-2 print:break-inside-avoid">
            {report.sections.assumptions?.length ? (
              <div className="rounded-xl border border-hairline bg-surface p-4">
                <h3 className="text-[10px] font-semibold uppercase text-ink-muted">Assumptions</h3>
                <ul className="mt-2 space-y-1.5">
                  {report.sections.assumptions.slice(0, 4).map((a) => (
                    <li key={a} className="text-xs leading-snug text-ink-muted">
                      · {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {report.sections.uncertainties?.length ? (
              <div className="rounded-xl border border-warning/25 bg-warning/6 p-4">
                <h3 className="text-[10px] font-semibold uppercase text-warning">Uncertainties</h3>
                <ul className="mt-2 space-y-1.5">
                  {report.sections.uncertainties.slice(0, 4).map((u) => (
                    <li key={u} className="text-xs leading-snug text-ink-muted">
                      · {u}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        )}

        <details className="mt-8 rounded-xl border border-hairline bg-surface print:hidden">
          <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-ink-muted">
            Full narrative sections
          </summary>
          <div className="space-y-6 border-t border-hairline px-4 py-4">
            {[
              { title: "Impact analysis", body: report.sections.impactAnalysis },
              { title: "Stakeholder analysis", body: report.sections.stakeholderAnalysis },
              { title: "Risk analysis", body: report.sections.riskAnalysis },
              { title: "Future outlook", body: report.sections.futureOutlook },
            ].map((s) => (
              <div key={s.title}>
                <h3 className="font-display text-sm font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">{s.body}</p>
              </div>
            ))}
          </div>
        </details>

        <footer className="mt-12 border-t border-hairline pt-4 font-mono-data text-[10px] uppercase text-ink-muted print:mt-8">
          DecisionX · Measure impact before you decide
        </footer>
      </div>
    </div>
  );
}
