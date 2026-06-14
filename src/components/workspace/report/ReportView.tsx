"use client";

import { useEffect, useMemo } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useScenarioReport, useScenarioSimulation } from "@/hooks/useSimulationQueries";
import { useEvidencePack } from "@/hooks/useEvidencePack";
import { ConfidenceBadge } from "../evidence/ConfidenceBadge";
import {
  parseAlternative,
  parseConsequenceChain,
  parseRecommendation,
  parseRiskMatrix,
} from "@/lib/workspace/report-formatters";
import { ReportHero } from "./ReportHero";
import { ReportAtAGlance } from "./ReportAtAGlance";
import { ReportInsightsGrid } from "./ReportInsightsGrid";
import { ReportActions } from "./ReportActions";
import { ReportAlternative } from "./ReportAlternative";
import { ReportOpenQuestions } from "./ReportOpenQuestions";

export function ReportView({ projectId }: { projectId: string }) {
  const activeReport = useWorkspaceStore((s) => s.activeReport);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const setActiveReport = useWorkspaceStore((s) => s.setActiveReport);
  const openExplanation = useWorkspaceStore((s) => s.openExplanation);
  const scenarioId = selectedScenario?.id;

  const { data: fetchedReport, isLoading, isFetched } = useScenarioReport(projectId, scenarioId);
  const { data: fetchedSimulation } = useScenarioSimulation(projectId, scenarioId);
  const evidencePack = useEvidencePack();

  const report = fetchedReport ?? activeReport ?? null;
  const simulation = fetchedSimulation ?? activeSimulation ?? null;

  useEffect(() => {
    if (fetchedReport) setActiveReport(fetchedReport);
  }, [fetchedReport, setActiveReport]);

  const scores = selectedScenario?.impact_scores ?? simulation?.impactScores ?? null;

  const structured = useMemo(() => {
    if (!report) return null;

    const stakeholderRaw = simulation?.agentResults?.stakeholder?.raw as
      | { affectedGroups?: string[]; supportScore?: number; oppositionScore?: number }
      | undefined;
    const riskRaw = simulation?.agentResults?.risk?.raw as
      | { riskMatrix?: { category: string; severity: string; description: string }[] }
      | undefined;
    const futureRaw = simulation?.agentResults?.futureShock?.raw as
      | { consequences?: { source: string; target: string }[] }
      | undefined;

    const actions = report.sections.recommendations.map((r, i) => parseRecommendation(r, i));
    const alternative = report.sections.alternativeScenarios?.[0]
      ? parseAlternative(report.sections.alternativeScenarios[0])
      : null;
    const risks = parseRiskMatrix(riskRaw?.riskMatrix, report.sections.riskAnalysis);
    const consequenceSteps = parseConsequenceChain(
      futureRaw?.consequences,
      report.sections.futureOutlook,
    );

    return {
      actions,
      alternative,
      risks,
      consequenceSteps,
      supportScore: stakeholderRaw?.supportScore,
      oppositionScore: stakeholderRaw?.oppositionScore,
      affectedGroups: stakeholderRaw?.affectedGroups,
    };
  }, [report, simulation]);

  if (isLoading && !report) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-signal border-t-transparent" />
        <p className="text-xs text-ink-muted">Loading report…</p>
      </div>
    );
  }

  if (!report && isFetched) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <FileText className="h-8 w-8 text-ink-muted/50" />
        <p className="text-sm font-medium text-ink">No report yet</p>
        <p className="text-xs text-ink-muted">Run an analysis to generate an executive decision brief.</p>
      </div>
    );
  }

  if (!report || !structured) return null;

  const viability = report.sections.viabilityScore ?? null;

  return (
    <div className="report-view h-full overflow-y-auto bg-[oklch(0.985_0.004_240)] print:bg-white">
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-8 md:px-8 md:py-10 print:space-y-6 print:py-8">
        <ReportHero
          title={report.projectTitle}
          generatedAt={report.generatedAt}
          viability={viability}
          executiveSummary={report.sections.executiveSummary}
        />

        {scores && (
          <ReportAtAGlance
            scores={scores}
            onMetricClick={(metric) => openExplanation({ type: "impact", metric })}
          />
        )}

        {evidencePack && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-signal/20 bg-surface px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-signal" />
            <p className="min-w-0 flex-1 text-xs text-ink-muted">
              {evidencePack.trustSummary.predictionReliability}
            </p>
            <ConfidenceBadge
              level={evidencePack.trustSummary.overallConfidenceLevel}
              score={evidencePack.trustSummary.overallConfidence}
              compact
            />
          </div>
        )}

        <ReportInsightsGrid
          supportScore={structured.supportScore}
          oppositionScore={structured.oppositionScore}
          affectedGroups={structured.affectedGroups}
          stakeholderSummary={report.sections.stakeholderAnalysis}
          risks={structured.risks}
          consequenceSteps={structured.consequenceSteps}
        />

        {evidencePack && evidencePack.consequenceExplanations.length > 0 && (
          <section>
            <h2 className="font-display text-sm font-semibold text-ink">Projected consequences</h2>
            <p className="mt-1 text-xs text-ink-muted">Tap to inspect reasoning</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {evidencePack.consequenceExplanations.slice(0, 4).map((c) => (
                <button
                  key={c.nodeId}
                  type="button"
                  onClick={() => openExplanation({ type: "consequence", nodeId: c.nodeId })}
                  className="rounded-xl border border-hairline bg-surface p-3 text-left transition-colors hover:border-signal/30 hover:bg-signal/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-ink">{c.label}</h3>
                    <ConfidenceBadge
                      level={c.confidence >= 70 ? "high" : c.confidence >= 45 ? "medium" : "low"}
                      score={c.confidence}
                      compact
                    />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink-muted">{c.reason}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <ReportActions actions={structured.actions} />

        {structured.alternative && <ReportAlternative alternative={structured.alternative} />}

        <ReportOpenQuestions
          assumptions={report.sections.assumptions ?? []}
          uncertainties={report.sections.uncertainties ?? []}
        />

        <details className="rounded-xl border border-hairline bg-surface print:hidden">
          <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-ink-muted">
            Full agent narratives
          </summary>
          <div className="space-y-5 border-t border-hairline px-4 py-4">
            {[
              { title: "Impact", body: report.sections.impactAnalysis },
              { title: "Stakeholders", body: report.sections.stakeholderAnalysis },
              { title: "Risks", body: report.sections.riskAnalysis },
              { title: "Future outlook", body: report.sections.futureOutlook },
            ].map((s) => (
              <div key={s.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">{s.body}</p>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
