"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, GitCompare, Layers, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useScenarioReport } from "@/hooks/useSimulationQueries";
import { useAlternativeProjection } from "@/hooks/useAlternativeProjection";
import { fetchScenarios } from "@/lib/workspace/queries";
import { createScenarioFromAlternative, duplicateScenario } from "@/lib/services/simulationService";
import {
  IMPACT_METRICS,
  metricDisplayValue,
} from "@/lib/workspace/impact-metrics";
import { getProjectViability } from "@/lib/scoring/viability";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { formatBudgetCrore } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import type { ImpactScores, Scenario } from "@/types/workspace";
import { ComparePlanB } from "./ComparePlanB";
import { ReportPanel } from "../report/ReportPanel";

type CompareViewProps = {
  projectId: string;
};

type CompareMode = "plan-b" | "scenarios";

function hasImpactScores(scenario: Scenario | undefined): scenario is Scenario & { impact_scores: ImpactScores } {
  if (!scenario?.impact_scores || typeof scenario.impact_scores !== "object") return false;
  const scores = scenario.impact_scores as ImpactScores;
  return (
    typeof scores.economic === "number" &&
    typeof scores.social === "number" &&
    typeof scores.environmental === "number" &&
    typeof scores.infrastructure === "number" &&
    typeof scores.politicalRisk === "number" &&
    typeof scores.publicAcceptance === "number"
  );
}

function pickDefaultCompareIds(scenarios: Scenario[], preferredId?: string): [string, string] | null {
  if (scenarios.length === 0) return null;
  if (scenarios.length === 1) return [scenarios[0].id, ""];

  const sorted = [...scenarios].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const first =
    (preferredId ? sorted.find((s) => s.id === preferredId) : undefined) ??
    sorted.find((s) => s.is_active) ??
    sorted[0];
  const second = sorted.find((s) => s.id !== first.id);
  if (!first || !second) return [first?.id ?? "", ""];
  return [first.id, second.id];
}

export function CompareView({ projectId }: CompareViewProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<CompareMode>("plan-b");

  const compareScenarioIds = useWorkspaceStore((s) => s.compareScenarioIds);
  const setCompareScenarioIds = useWorkspaceStore((s) => s.setCompareScenarioIds);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const setSelectedScenario = useWorkspaceStore((s) => s.setSelectedScenario);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const activeReport = useWorkspaceStore((s) => s.activeReport);

  const baselineId = selectedScenario?.id ?? compareScenarioIds?.[0];

  const { data: scenarios = [], isPending } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
  });

  const { data: fetchedReport } = useScenarioReport(projectId, baselineId);

  useEffect(() => {
    if (scenarios.length === 0) return;

    const current = compareScenarioIds;
    const needsInit =
      !current ||
      !current[0] ||
      (scenarios.length > 1 && (!current[1] || current[0] === current[1]));

    if (!needsInit) return;

    const defaults = pickDefaultCompareIds(scenarios, selectedScenario?.id ?? current?.[0]);
    if (defaults) setCompareScenarioIds(defaults);
  }, [scenarios, compareScenarioIds, selectedScenario?.id, setCompareScenarioIds]);

  const baselineScenario = scenarios.find((s) => s.id === baselineId) ?? selectedScenario ?? scenarios[0];
  const scenarioA = scenarios.find((s) => s.id === compareScenarioIds?.[0]);
  const scenarioB = scenarios.find((s) => s.id === compareScenarioIds?.[1]);

  const report = fetchedReport ?? activeReport;
  const alternativeRaw = report?.sections.alternativeScenarios?.[0];

  const {
    alternative: projectedAlternative,
    source: projectionSource,
    isRefining,
    isLoading: projectionLoading,
  } = useAlternativeProjection({
    projectTitle: report?.projectTitle ?? baselineScenario?.title ?? "Project",
    projectId,
    scenarioId: baselineScenario?.id,
    baselineScores: hasImpactScores(baselineScenario) ? baselineScenario.impact_scores : null,
    baselineParams: baselineScenario?.params ?? null,
    alternativeRaw,
    executiveSummary: report?.sections.executiveSummary,
    enabled: mode === "plan-b" && Boolean(alternativeRaw) && hasImpactScores(baselineScenario),
  });

  const viabilityA = hasImpactScores(scenarioA) ? getProjectViability(scenarioA.impact_scores) : null;
  const viabilityB = hasImpactScores(scenarioB) ? getProjectViability(scenarioB.impact_scores) : null;

  const readyToCompare =
    scenarioA &&
    scenarioB &&
    scenarioA.id !== scenarioB.id &&
    viabilityA != null &&
    viabilityB != null;

  const scenarioWinner =
    readyToCompare && viabilityA != null && viabilityB != null
      ? viabilityA === viabilityB
        ? null
        : viabilityA > viabilityB
          ? "A"
          : "B"
      : null;

  const handleDuplicate = async (sourceId: string) => {
    const copy = await duplicateScenario(projectId, sourceId);
    if (!copy) {
      toast.error("Could not duplicate scenario", {
        description: "Ensure the scenario has completed a simulation, then try again.",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
    setCompareScenarioIds([sourceId, copy.id]);
    toast.success("Scenario duplicated", { description: "Adjust params and re-run to compare variants." });
  };

  const handleSimulatePlanB = async () => {
    if (!baselineScenario || !projectedAlternative) return;
    const copy = await createScenarioFromAlternative(projectId, baselineScenario.id, {
      name: projectedAlternative.name,
      budget: projectedAlternative.budgetCrore,
      timeline: projectedAlternative.timeline,
    });
    if (!copy) {
      toast.error("Could not create Plan B scenario");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
    setSelectedScenario(copy);
    setCompareScenarioIds([baselineScenario.id, copy.id]);
    setMode("scenarios");
    setBuilderOpen(true);
    toast.success("Plan B scenario created", {
      description: "Review budget & timeline, then run simulation to validate projections.",
    });
  };

  const updateSlot = (idx: 0 | 1, value: string) => {
    const next: [string, string] = [...(compareScenarioIds ?? ["", ""])] as [string, string];
    next[idx] = value;
    if (idx === 0 && value && value === next[1]) next[1] = "";
    setCompareScenarioIds(next);
  };

  return (
    <div className="relative h-full overflow-y-auto bg-background">
      <div className="mesh-bg pointer-events-none fixed inset-0 opacity-25" />
      <div className="relative mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6 md:py-8">
        <header>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">Decision compare</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">Current plan vs best alternative</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            See how the CDO-recommended Plan B stacks up against your simulated baseline — or compare any two runs.
          </p>
        </header>

        <div className="flex gap-1 rounded-full border border-hairline bg-surface/80 p-1 w-fit">
          <ModeTab active={mode === "plan-b"} onClick={() => setMode("plan-b")} icon={Sparkles}>
            Plan B vs Current
          </ModeTab>
          <ModeTab active={mode === "scenarios"} onClick={() => setMode("scenarios")} icon={Layers}>
            Scenario lab
          </ModeTab>
        </div>

        {isPending ? (
          <CompareEmptyState icon={GitCompare} title="Loading scenarios…" description="" />
        ) : scenarios.length === 0 ? (
          <CompareEmptyState
            icon={GitCompare}
            title="No scenarios yet"
            description="Run your first simulation to unlock comparison."
            action={
              <button
                type="button"
                onClick={() => setBuilderOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
              >
                <Play className="h-4 w-4" />
                Create scenario
              </button>
            }
          />
        ) : mode === "plan-b" ? (
          <>
            {baselineScenario && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">Baseline</span>
                <select
                  className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink"
                  value={baselineScenario.id}
                  onChange={(e) => {
                    const s = scenarios.find((sc) => sc.id === e.target.value);
                    if (s) setSelectedScenario(s);
                  }}
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                      {!hasImpactScores(s) ? " (needs simulation)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!hasImpactScores(baselineScenario) ? (
              <CompareEmptyState
                icon={Play}
                title="Simulation required"
                description="Run a simulation on this scenario before comparing alternatives."
                action={
                  <button
                    type="button"
                    onClick={() => setBuilderOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
                  >
                    <Play className="h-4 w-4" />
                    Run simulation
                  </button>
                }
              />
            ) : !projectedAlternative ? (
              <CompareEmptyState
                icon={Sparkles}
                title="No Plan B in report yet"
                description="The Chief Decision Officer generates a recommended alternative when you run a full analysis. Run simulation on this scenario first."
                action={
                  <button
                    type="button"
                    onClick={() => setBuilderOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
                  >
                    <Play className="h-4 w-4" />
                    Run analysis
                  </button>
                }
              />
            ) : projectionLoading && !projectedAlternative ? (
              <CompareEmptyState
                icon={Sparkles}
                title="Claude is projecting Plan B…"
                description="Analyzing the CDO alternative against your simulated baseline."
              />
            ) : (
              <ComparePlanB
                scenario={baselineScenario}
                alternative={projectedAlternative}
                projectionSource={projectionSource}
                isRefining={isRefining}
                onSimulateAlternative={handleSimulatePlanB}
              />
            )}
          </>
        ) : (
          <ScenarioLab
            scenarios={scenarios}
            compareScenarioIds={compareScenarioIds}
            updateSlot={updateSlot}
            scenarioA={scenarioA}
            scenarioB={scenarioB}
            viabilityA={viabilityA}
            viabilityB={viabilityB}
            readyToCompare={Boolean(readyToCompare)}
            scenarioWinner={scenarioWinner}
            onDuplicate={handleDuplicate}
            setBuilderOpen={setBuilderOpen}
          />
        )}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sparkles;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all",
        active ? "bg-ink font-medium text-surface shadow-sm" : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function ScenarioLab({
  scenarios,
  compareScenarioIds,
  updateSlot,
  scenarioA,
  scenarioB,
  viabilityA,
  viabilityB,
  readyToCompare,
  scenarioWinner,
  onDuplicate,
  setBuilderOpen,
}: {
  scenarios: Scenario[];
  compareScenarioIds: [string, string] | null;
  updateSlot: (idx: 0 | 1, value: string) => void;
  scenarioA?: Scenario;
  scenarioB?: Scenario;
  viabilityA: number | null;
  viabilityB: number | null;
  readyToCompare: boolean;
  scenarioWinner: "A" | "B" | null;
  onDuplicate: (id: string) => void;
  setBuilderOpen: (open: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(["A", "B"] as const).map((slot, idx) => (
          <div key={slot}>
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
              Scenario {slot}
            </span>
            <select
              className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink"
              value={compareScenarioIds?.[idx] ?? ""}
              onChange={(e) => updateSlot(idx as 0 | 1, e.target.value)}
            >
              <option value="">Select scenario {slot}</option>
              {scenarios.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  disabled={idx === 1 && s.id === compareScenarioIds?.[0]}
                >
                  {s.title}
                  {!hasImpactScores(s) ? " (no scores)" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {scenarios.length === 1 && (
        <CompareEmptyState
          icon={Copy}
          title="Need a second scenario"
          description="Duplicate your current scenario or create a variant with different parameters."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => onDuplicate(scenarios[0].id)}
                className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-signal/30"
              >
                <Copy className="h-4 w-4" />
                Duplicate scenario
              </button>
              <button
                type="button"
                onClick={() => setBuilderOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
              >
                <Play className="h-4 w-4" />
                New scenario
              </button>
            </div>
          }
        />
      )}

      {scenarioA && scenarioB && scenarioA.id === scenarioB.id && (
        <CompareEmptyState
          icon={GitCompare}
          title="Select two different scenarios"
          description="Choose a different scenario in slot B."
        />
      )}

      {scenarioA && scenarioB && scenarioA.id !== scenarioB.id && (viabilityA == null || viabilityB == null) && (
        <CompareEmptyState
          icon={Play}
          title="Simulation required"
          description={`${viabilityA == null ? scenarioA.title : scenarioB.title} needs a completed simulation.`}
          action={
            <button
              type="button"
              onClick={() => setBuilderOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
            >
              <Play className="h-4 w-4" />
              Run simulation
            </button>
          }
        />
      )}

      {readyToCompare && scenarioA && scenarioB && viabilityA != null && viabilityB != null && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {scenarioWinner && (
            <div className="rounded-xl border border-positive/30 bg-positive/8 px-4 py-2.5 text-center text-sm text-positive">
              Scenario {scenarioWinner} wins on viability ({scenarioWinner === "A" ? viabilityA : viabilityB} vs{" "}
              {scenarioWinner === "A" ? viabilityB : viabilityA})
            </div>
          )}

          <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-2">
            <ScenarioCard slot="A" title={scenarioA.title} budget={scenarioA.params.budget} viability={viabilityA} highlighted={scenarioWinner === "A"} />
            <ScenarioCard slot="B" title={scenarioB.title} budget={scenarioB.params.budget} viability={viabilityB} highlighted={scenarioWinner === "B"} />
          </div>

          <ReportPanel label="Metric delta" hint="A vs B">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {IMPACT_METRICS.map((metric) => {
                const a = metricDisplayValue(scenarioA.impact_scores, metric);
                const b = metricDisplayValue(scenarioB.impact_scores, metric);
                const delta = a - b;
                return (
                  <div key={metric.key} className="rounded-lg border border-hairline bg-background/50 p-3">
                    <p className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">{metric.label}</p>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <span className="text-[9px] text-signal">A</span>
                        <p className="font-display text-xl font-bold tabular-nums">{a}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-environmental">B</span>
                        <p className="font-display text-xl font-bold tabular-nums">{b}</p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "mt-1 font-mono-data text-[10px] font-medium tabular-nums",
                        delta > 0 ? "text-signal" : delta < 0 ? "text-environmental" : "text-ink-muted",
                      )}
                    >
                      {delta > 0 ? `A +${delta}` : delta < 0 ? `B +${Math.abs(delta)}` : "Tied"}
                    </p>
                  </div>
                );
              })}
            </div>
          </ReportPanel>
        </motion.div>
      )}
    </div>
  );
}

function ScenarioCard({
  slot,
  title,
  budget,
  viability,
  highlighted,
}: {
  slot: "A" | "B";
  title: string;
  budget: number;
  viability: number;
  highlighted?: boolean;
}) {
  return (
    <div className={cn("bg-surface p-5", highlighted && "ring-1 ring-inset ring-positive/25")}>
      <p className={cn("font-mono-data text-[10px] uppercase tracking-wider", slot === "A" ? "text-signal" : "text-environmental")}>
        Scenario {slot}
      </p>
      <p className="mt-2 font-display font-semibold text-ink">{title}</p>
      <p className="mt-1 font-mono-data text-sm text-ink-muted">{formatBudgetCrore(budget)}</p>
      <div className="mt-3">
        <DecisionVerdictBanner score={viability} compact />
      </div>
    </div>
  );
}

function CompareEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: typeof GitCompare;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-hairline bg-surface/60 px-6 py-10 text-center",
        className,
      )}
    >
      <Icon className="mx-auto h-8 w-8 text-ink-muted/50" />
      <p className="mt-3 font-display text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
