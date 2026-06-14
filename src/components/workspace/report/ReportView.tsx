"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useScenarioReport, useScenarioSimulation } from "@/hooks/useSimulationQueries";
import { useEvidencePack } from "@/hooks/useEvidencePack";
import { buildStakeholderTrustView } from "@/lib/trust/stakeholderSentiment";
import { resolveReportViability } from "@/lib/scoring/viability";
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
import { ReportConsequences } from "./ReportConsequences";
import { cn } from "@/lib/utils";
import type { DecisionReport } from "@/types/simulation";

export function ReportView({ projectId }: { projectId: string }) {
  const activeReport = useWorkspaceStore((s) => s.activeReport);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const setActiveReport = useWorkspaceStore((s) => s.setActiveReport);
  const openExplanation = useWorkspaceStore((s) => s.openExplanation);
  const scenarioId = selectedScenario?.id;

  const { data: fetchedReport, isLoading, isFetched, isError } = useScenarioReport(projectId, scenarioId);
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

    const riskRaw = simulation?.agentResults?.risk?.raw as
      | { riskMatrix?: { category: string; severity: string; description: string }[] }
      | undefined;
    const futureRaw = simulation?.agentResults?.futureShock?.raw as
      | { consequences?: { source: string; target: string }[] }
      | undefined;

    return {
      actions: report.sections.recommendations.map((r, i) => parseRecommendation(r, i)),
      alternative: report.sections.alternativeScenarios?.[0]
        ? parseAlternative(report.sections.alternativeScenarios[0])
        : null,
      risks: parseRiskMatrix(riskRaw?.riskMatrix, report.sections.riskAnalysis),
      consequenceSteps: parseConsequenceChain(
        futureRaw?.consequences,
        report.sections.futureOutlook,
      ),
      stakeholderView: buildStakeholderTrustView(simulation?.agentResults?.stakeholder),
    };
  }, [report, simulation]);

  if (!scenarioId && !report) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <FileText className="h-10 w-10 text-ink-muted/40" />
        <p className="font-display text-lg font-semibold text-ink">Preparing brief…</p>
        <p className="max-w-xs text-xs text-ink-muted">
          Loading the active scenario for this project.
        </p>
      </div>
    );
  }

  if (isLoading && !report) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background p-8">
        <div className="relative h-10 w-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-signal/20 border-t-signal" />
        </div>
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Loading brief…
        </p>
      </div>
    );
  }

  if (!report && (isFetched || isError)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <FileText className="h-10 w-10 text-ink-muted/40" />
        <p className="font-display text-lg font-semibold text-ink">No report yet</p>
        <p className="max-w-xs text-xs text-ink-muted">
          {isError
            ? "Could not load the report — run a new simulation or try again."
            : "Run a simulation to generate your executive decision brief."}
        </p>
      </div>
    );
  }

  if (!report || !structured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-signal/20 border-t-signal" />
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Assembling brief…
        </p>
      </div>
    );
  }

  const viability = resolveReportViability(scores, report.sections.viabilityScore);

  return (
    <div className="report-view h-full overflow-y-auto bg-background">
      <div className="mesh-bg pointer-events-none fixed inset-0 opacity-30" />
      <div className="relative mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6 md:py-8 print:space-y-4 print:py-6">
        <ReportHero
          title={report.projectTitle}
          generatedAt={report.generatedAt}
          viability={viability}
          executiveSummary={report.sections.executiveSummary}
          trustSummary={evidencePack?.trustSummary ?? null}
        />

        {scores && (
          <ReportAtAGlance
            scores={scores}
            onMetricClick={(metric) => openExplanation({ type: "impact", metric })}
          />
        )}

        <ReportInsightsGrid
          stakeholderView={structured.stakeholderView}
          stakeholderSummary={report.sections.stakeholderAnalysis}
          risks={structured.risks}
          consequenceSteps={structured.consequenceSteps}
        />

        {evidencePack && evidencePack.consequenceExplanations.length > 0 && (
          <ReportConsequences
            items={evidencePack.consequenceExplanations}
            onSelect={(nodeId) => openExplanation({ type: "consequence", nodeId })}
          />
        )}

        <ReportActions actions={structured.actions} />

        {structured.alternative && <ReportAlternative alternative={structured.alternative} />}

        <ReportOpenQuestions
          assumptions={report.sections.assumptions ?? []}
          uncertainties={report.sections.uncertainties ?? []}
        />

        <ReportDeepDive report={report} />
      </div>
    </div>
  );
}

function ReportDeepDive({ report }: { report: DecisionReport }) {
  const [open, setOpen] = useState(false);

  const sections = [
    { title: "Impact", body: report.sections.impactAnalysis },
    { title: "Stakeholders", body: report.sections.stakeholderAnalysis },
    { title: "Risks", body: report.sections.riskAnalysis },
    { title: "Future outlook", body: report.sections.futureOutlook },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface print:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-background/50"
      >
        <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Full agent narratives
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2">
          {sections.map((s) => (
            <div key={s.title} className="bg-surface p-4">
              <h3 className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/80">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
