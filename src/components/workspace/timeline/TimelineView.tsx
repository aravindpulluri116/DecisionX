"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { fetchWorkspaceGraph } from "@/lib/workspace/queries";
import { morphGraphForYear, morphScoresForYear, TIMELINE_YEARS } from "@/lib/simulation/timelineEngine";
import { ImpactScoreRadials } from "../intelligence/ImpactScoreRadials";
import { DecisionCanvas } from "../canvas/DecisionCanvas";
import { cn } from "@/lib/utils";
import type { TimelineYear } from "@/types/simulation";

type TimelineViewProps = {
  scenarioId: string | null;
  projectTitle: string;
};

export function TimelineView({ scenarioId, projectTitle }: TimelineViewProps) {
  const timelineYear = useWorkspaceStore((s) => s.timelineYear);
  const setTimelineYear = useWorkspaceStore((s) => s.setTimelineYear);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);

  const { data: graph } = useQuery({
    queryKey: ["workspace-graph", scenarioId],
    queryFn: () => (scenarioId ? fetchWorkspaceGraph(scenarioId) : null),
    enabled: Boolean(scenarioId),
  });

  const morphedScores = selectedScenario?.impact_scores
    ? morphScoresForYear(selectedScenario.impact_scores, timelineYear)
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-6 py-4">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          ◢ timeline simulation
        </p>
        <div className="mt-4 flex gap-2">
          {TIMELINE_YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setTimelineYear(y as TimelineYear)}
              className={cn(
                "border px-4 py-2 font-mono-data text-[11px] uppercase transition-colors",
                timelineYear === y ? "border-signal bg-signal text-white" : "border-hairline hover:bg-background",
              )}
            >
              Year {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_280px]">
        <motion.div
          key={timelineYear}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative min-h-[300px]"
        >
          <DecisionCanvas scenarioId={scenarioId} projectTitle={projectTitle} />
          {graph && (
            <div className="pointer-events-none absolute bottom-4 left-4 font-mono-data text-[10px] uppercase text-ink-muted">
              {morphGraphForYear(graph, timelineYear).nodes.length} nodes at Y{timelineYear}
            </div>
          )}
        </motion.div>
        <div className="border-l border-hairline p-4">
          <p className="mb-3 font-mono-data text-[10px] uppercase text-ink-muted">Projected impacts</p>
          <ImpactScoreRadials scores={morphedScores} />
        </div>
      </div>
    </div>
  );
}
