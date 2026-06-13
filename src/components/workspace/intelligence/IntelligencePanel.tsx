"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { buildScoreEvidence, formatSourceLine } from "@/lib/geo/scoreEvidence";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { ImpactKpiGrid } from "../shared/ImpactKpiGrid";
import { KpiCard } from "../shared/KpiCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export function IntelligencePanel() {
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const locationIntelligence = useWorkspaceStore((s) => s.locationIntelligence);
  const scores = selectedScenario?.impact_scores ?? null;
  const geoEvidence = buildScoreEvidence(locationIntelligence, scores ?? undefined);

  const viability = scores != null ? computeViabilityIndex(scores) : null;
  const topSignal = geoEvidence.economic?.[0] ?? geoEvidence.social?.[0];

  return (
    <div className="flex h-full flex-col border-l border-hairline bg-surface">
      <div className="border-b border-hairline px-4 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Decision intelligence
        </p>
        <h2 className="mt-1 line-clamp-2 font-display text-base font-semibold tracking-tight text-ink">
          {selectedScenario?.title ?? "Scenario overview"}
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {viability != null ? (
            <DecisionVerdictBanner score={viability} compact />
          ) : (
            <div className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-xs text-ink-muted">
              Run simulation for a decision verdict
            </div>
          )}

          <section>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              Impact KPIs
            </p>
            <ImpactKpiGrid scores={scores} compact />
          </section>

          {locationIntelligence && (
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
              <p className="rounded-lg border border-hairline bg-background/80 px-3 py-2 text-[11px] leading-snug text-ink-muted">
                {formatSourceLine(locationIntelligence)}
              </p>
              {topSignal && (
                <p className="text-[11px] leading-snug text-ink-muted">{topSignal}</p>
              )}
            </section>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-hairline bg-background/50 px-3 py-3 text-center"
          >
            <p className="text-xs font-medium text-ink">Run simulation</p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Generate KPIs, report, and future projections
            </p>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
