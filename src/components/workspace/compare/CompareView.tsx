"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { fetchScenarios } from "@/lib/workspace/queries";
import { computeViabilityIndex, IMPACT_METRICS, metricDisplayValue } from "@/lib/workspace/impact-metrics";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { formatBudgetCrore } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

type CompareViewProps = {
  projectId: string;
};

export function CompareView({ projectId }: CompareViewProps) {
  const compareScenarioIds = useWorkspaceStore((s) => s.compareScenarioIds);
  const setCompareScenarioIds = useWorkspaceStore((s) => s.setCompareScenarioIds);

  const { data: scenarios = [] } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
  });

  const scenarioA = scenarios.find((s) => s.id === compareScenarioIds?.[0]);
  const scenarioB = scenarios.find((s) => s.id === compareScenarioIds?.[1]);

  const viabilityA = scenarioA ? computeViabilityIndex(scenarioA.impact_scores) : null;
  const viabilityB = scenarioB ? computeViabilityIndex(scenarioB.impact_scores) : null;
  const winner =
    viabilityA != null && viabilityB != null
      ? viabilityA === viabilityB
        ? null
        : viabilityA > viabilityB
          ? "A"
          : "B"
      : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">Scenario comparison</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-ink">Side-by-side decision</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(["A", "B"] as const).map((slot, idx) => (
          <div key={slot}>
            <Label slot={slot} />
            <select
              className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
              value={compareScenarioIds?.[idx] ?? ""}
              onChange={(e) => {
                const next: [string, string] = [...(compareScenarioIds ?? ["", ""])] as [string, string];
                next[idx] = e.target.value;
                setCompareScenarioIds(next);
              }}
            >
              <option value="">Select scenario {slot}</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {scenarioA && scenarioB && viabilityA != null && viabilityB != null && (
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
              budget={scenarioA.params.budget}
              viability={viabilityA}
              highlighted={winner === "A"}
            />
            <ScenarioVerdictCard
              slot="B"
              title={scenarioB.title}
              budget={scenarioB.params.budget}
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
                  <div
                    key={metric.key}
                    className="rounded-xl border border-hairline bg-surface p-3"
                  >
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
