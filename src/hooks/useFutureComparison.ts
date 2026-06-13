"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchScenarios } from "@/lib/workspace/queries";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { buildTimeMachineBundle } from "@/lib/timemachine/futureProjector";
import { getSnapshotAtMilestone } from "@/lib/timemachine/futureProjector";
import type { TimelineMilestone } from "@/types/timemachine";

export function useFutureComparison(projectId: string, milestone: TimelineMilestone = "y10") {
  const compareScenarioIds = useWorkspaceStore((s) => s.compareScenarioIds);
  const branch = useWorkspaceStore((s) => s.timeMachineBranch);

  const { data: scenarios = [] } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
  });

  return useMemo(() => {
    const a = scenarios.find((s) => s.id === compareScenarioIds?.[0]);
    const b = scenarios.find((s) => s.id === compareScenarioIds?.[1]);
    if (!a || !b) return null;

    const bundleA =
      a.time_machine_snapshot ??
      buildTimeMachineBundle(a.impact_scores, a.params, {}, null);
    const bundleB =
      b.time_machine_snapshot ??
      buildTimeMachineBundle(b.impact_scores, b.params, {}, null);

    const trajA = branch === "bestCase" ? bundleA.best : branch === "worstCase" ? bundleA.worst : bundleA.expected;
    const trajB = branch === "bestCase" ? bundleB.best : branch === "worstCase" ? bundleB.worst : bundleB.expected;

    return {
      scenarioA: a,
      scenarioB: b,
      snapshotA: getSnapshotAtMilestone(trajA, milestone),
      snapshotB: getSnapshotAtMilestone(trajB, milestone),
    };
  }, [scenarios, compareScenarioIds, branch, milestone]);
}
