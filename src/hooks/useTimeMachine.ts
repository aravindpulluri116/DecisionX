"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { getSnapshotAtMilestone } from "@/lib/timemachine/futureProjector";
import type { FutureBranch, FutureTrajectory } from "@/types/timemachine";

function pickTrajectory(bundle: NonNullable<ReturnType<typeof useWorkspaceStore.getState>["timeMachineBundle"]>, branch: FutureBranch): FutureTrajectory {
  if (branch === "bestCase") return bundle.best;
  if (branch === "worstCase") return bundle.worst;
  return bundle.expected;
}

export function useTimeMachine() {
  const bundle = useWorkspaceStore((s) => s.timeMachineBundle);
  const branch = useWorkspaceStore((s) => s.timeMachineBranch);
  const milestone = useWorkspaceStore((s) => s.timeMachineMilestone);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);

  const effectiveBundle = bundle ?? activeSimulation?.timeMachine ?? null;

  const trajectory = useMemo(
    () => (effectiveBundle ? pickTrajectory(effectiveBundle, branch) : null),
    [effectiveBundle, branch],
  );

  const snapshot = useMemo(
    () => (trajectory ? getSnapshotAtMilestone(trajectory, milestone) : null),
    [trajectory, milestone],
  );

  const cityState = useMemo(
    () => trajectory?.cityStates.find((c) => c.milestone === milestone) ?? null,
    [trajectory, milestone],
  );

  return { bundle: effectiveBundle, trajectory, snapshot, cityState, branch, milestone };
}
