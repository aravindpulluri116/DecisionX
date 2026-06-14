"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEvidencePack } from "@/hooks/useEvidencePack";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { ImpactKpiGrid } from "../shared/ImpactKpiGrid";
import { KpiCard } from "../shared/KpiCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrustPanel } from "../evidence/TrustPanel";
import { ReasoningTimeline } from "../evidence/ReasoningTimeline";
import { cn } from "@/lib/utils";
import type { ImpactScores } from "@/types/workspace";

type IntelTab = "overview" | "trust";

type IntelligencePanelProps = {
  variant?: "sidebar" | "page";
};

export function IntelligencePanel({ variant = "sidebar" }: IntelligencePanelProps) {
  const [tab, setTab] = useState<IntelTab>("overview");
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const locationIntelligence = useWorkspaceStore((s) => s.locationIntelligence);
  const openExplanation = useWorkspaceStore((s) => s.openExplanation);
  const evidencePack = useEvidencePack();

  const scores = selectedScenario?.impact_scores ?? null;
  const viability = scores != null ? computeViabilityIndex(scores) : null;

  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col bg-surface/95 backdrop-blur-sm",
        variant === "sidebar" && "border-l border-hairline",
      )}
    >
      <div className="border-b border-hairline bg-signal/[0.02] px-4 py-4">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-signal">
          Decision intelligence
        </p>
        <h2 className="mt-1 line-clamp-2 font-display text-base font-semibold tracking-tight text-ink">
          {selectedScenario?.title ?? "Scenario overview"}
        </h2>
        <div className="mt-3 flex gap-1 rounded-lg border border-hairline bg-background/80 p-0.5">
          {(["overview", "trust"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide transition-all",
                tab === t
                  ? "bg-surface text-ink shadow-sm ring-1 ring-signal/15"
                  : "text-ink-muted hover:text-signal",
              )}
            >
              {t === "overview" ? "Overview" : "Trust & evidence"}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {tab === "overview" ? (
            <>
              {viability != null ? (
                <DecisionVerdictBanner score={viability} compact />
              ) : (
                <div className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-xs text-ink-muted">
                  Run simulation for a decision verdict
                </div>
              )}

              <section>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                  Impact KPIs
                </p>
                <p className="mb-2 text-[10px] text-ink-muted/80">Tap any score to see why</p>
                <ImpactKpiGrid
                  scores={scores}
                  compact
                  onMetricClick={(metric) => openExplanation({ type: "impact", metric })}
                />
              </section>

              {evidencePack && evidencePack.reasoningChain.length > 0 && (
                <section>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                    AI reasoning chain
                  </p>
                  <ReasoningTimeline
                    steps={evidencePack.reasoningChain}
                    onSelectStep={(stepId) => openExplanation({ type: "reasoning", stepId })}
                    compact
                  />
                </section>
              )}

              {locationIntelligence && !locationIntelligence.unavailable && (
                <section className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                    Location
                  </p>
                  <KpiCard
                    label="Population density"
                    value={locationIntelligence.scores.populationDensity}
                    tone="signal"
                    icon={MapPin}
                    suffix="/100"
                  />
                </section>
              )}
            </>
          ) : evidencePack ? (
            <TrustPanel
              pack={evidencePack}
              onSelectImpact={(metric) => openExplanation({ type: "impact", metric })}
              onSelectAgent={(agentId) => openExplanation({ type: "agent", agentId })}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-xs text-ink-muted"
            >
              Run a simulation to unlock evidence, assumptions, and confidence breakdowns.
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
