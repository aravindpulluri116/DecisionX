"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, GitCompare, Play } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { fetchScenarios } from "@/lib/workspace/queries";
import { duplicateScenario } from "@/lib/services/simulationService";
import {
  computeViabilityIndex,
  IMPACT_METRICS,
  metricDisplayValue,
} from "@/lib/workspace/impact-metrics";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { formatBudgetCrore } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import type { ImpactScores, Scenario } from "@/types/workspace";

type CompareViewProps = {
  projectId: string;
};

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
  const compareScenarioIds = useWorkspaceStore((s) => s.compareScenarioIds);
  const setCompareScenarioIds = useWorkspaceStore((s) => s.setCompareScenarioIds);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);

  const { data: scenarios = [], isPending } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
  });

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

  const scenarioA = scenarios.find((s) => s.id === compareScenarioIds?.[0]);
  const scenarioB = scenarios.find((s) => s.id === compareScenarioIds?.[1]);

  const viabilityA = hasImpactScores(scenarioA) ? computeViabilityIndex(scenarioA.impact_scores) : null;
  const viabilityB = hasImpactScores(scenarioB) ? computeViabilityIndex(scenarioB.impact_scores) : null;

  const readyToCompare =
    scenarioA &&
    scenarioB &&
    scenarioA.id !== scenarioB.id &&
    viabilityA != null &&
    viabilityB != null;

  const winner =
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

  const updateSlot = (idx: 0 | 1, value: string) => {
    const next: [string, string] = [...(compareScenarioIds ?? ["", ""])] as [string, string];
    next[idx] = value;
    if (idx === 0 && value && value === next[1]) next[1] = "";
    setCompareScenarioIds(next);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">Scenario comparison</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-ink">Side-by-side decision</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-muted">
        Pick two simulated scenarios to compare viability, impact metrics, and budget assumptions.
      </p>

      {isPending ? (
        <div className="mt-8 rounded-xl border border-dashed border-hairline px-4 py-10 text-center text-sm text-ink-muted">
          Loading scenarios…
        </div>
      ) : scenarios.length === 0 ? (
        <CompareEmptyState
          icon={GitCompare}
          title="No scenarios yet"
          description="Run your first simulation to create a scenario you can compare later."
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
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(["A", "B"] as const).map((slot, idx) => (
              <div key={slot}>
                <Label slot={slot} />
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
              className="mt-6"
              icon={Copy}
              title="Need a second scenario"
              description="Duplicate your current scenario or create a new one with different budget, timeline, or policy settings."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(scenarios[0].id)}
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
              className="mt-6"
              icon={GitCompare}
              title="Select two different scenarios"
              description="Choose a different scenario in slot B to see a side-by-side comparison."
            />
          )}

          {scenarioA && scenarioB && scenarioA.id !== scenarioB.id && (viabilityA == null || viabilityB == null) && (
            <CompareEmptyState
              className="mt-6"
              icon={Play}
              title="Simulation required"
              description={`${!viabilityA ? scenarioA.title : scenarioB.title} needs a completed simulation before it can be compared.`}
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

          {readyToCompare && viabilityA != null && viabilityB != null && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
              {winner && (
                <div className="rounded-xl border border-positive/30 bg-positive/8 px-4 py-2 text-center text-sm text-positive">
                  Scenario {winner} leads on viability ({winner === "A" ? viabilityA : viabilityB} vs{" "}
                  {winner === "A" ? viabilityB : viabilityA})
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <ScenarioVerdictCard
                  slot="A"
                  title={scenarioA.title}
                  budget={scenarioA.params?.budget ?? 0}
                  viability={viabilityA}
                  highlighted={winner === "A"}
                />
                <ScenarioVerdictCard
                  slot="B"
                  title={scenarioB.title}
                  budget={scenarioB.params?.budget ?? 0}
                  viability={viabilityB}
                  highlighted={winner === "B"}
                />
              </div>

              <section>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                  Metric comparison
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {IMPACT_METRICS.map((metric) => {
                    const a = metricDisplayValue(scenarioA.impact_scores, metric);
                    const b = metricDisplayValue(scenarioB.impact_scores, metric);
                    const delta = a - b;
                    return (
                      <div key={metric.key} className="rounded-xl border border-hairline bg-surface p-3">
                        <p className="text-[10px] font-medium uppercase text-ink-muted">{metric.label}</p>
                        <div className="mt-2 flex items-end justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-signal">A</span>
                            <p className="font-display text-xl font-bold tabular-nums text-ink">{a}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-warning">B</span>
                            <p className="font-display text-xl font-bold tabular-nums text-ink">{b}</p>
                          </div>
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-[10px] font-medium tabular-nums",
                            delta > 0 ? "text-positive" : delta < 0 ? "text-negative" : "text-ink-muted",
                          )}
                        >
                          {delta > 0 ? `A +${delta}` : delta < 0 ? `B +${Math.abs(delta)}` : "Tied"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          )}
        </>
      )}
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
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ScenarioVerdictCard({
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
    <div
      className={cn(
        "space-y-3 rounded-xl border p-4",
        highlighted ? "border-positive/35 bg-positive/6" : "border-hairline bg-surface",
      )}
    >
      <p className={cn("text-[10px] font-semibold uppercase", slot === "A" ? "text-signal" : "text-warning")}>
        Scenario {slot}
      </p>
      <p className="font-display font-semibold text-ink">{title}</p>
      <p className="font-mono-data text-sm text-ink-muted">{formatBudgetCrore(budget)}</p>
      <DecisionVerdictBanner score={viability} compact />
    </div>
  );
}

function Label({ slot }: { slot: string }) {
  return <span className="text-[10px] font-medium uppercase text-ink-muted">Scenario {slot}</span>;
}
