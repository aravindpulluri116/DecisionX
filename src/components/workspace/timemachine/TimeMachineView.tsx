"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTimeMachine } from "@/hooks/useTimeMachine";
import { fetchTimeMachineSnapshot } from "@/lib/workspace/queries";
import { buildTimeMachineBundle } from "@/lib/timemachine/futureProjector";
import { CinematicTimelineRail } from "./CinematicTimelineRail";
import { AlternativeFuturesSwitcher } from "./AlternativeFuturesSwitcher";
import { CityEvolutionView } from "./CityEvolutionView";
import { ConsequenceEvolutionView } from "./ConsequenceEvolutionView";
import { FutureSnapshotPanel } from "./FutureSnapshotPanel";
import {
  EconomicEvolutionPanel,
  EnvironmentalEvolutionPanel,
  SocialEvolutionPanel,
} from "./EvolutionPanels";
import { FutureNewsMode } from "./FutureNewsMode";
import { FutureCitizenStories } from "./FutureCitizenStories";
import { FutureComparisonView } from "./FutureComparisonView";
import { PresentationMode } from "./PresentationMode";

type TimeMachineViewProps = {
  projectId: string;
  scenarioId: string | null;
};

export function TimeMachineView({ projectId, scenarioId }: TimeMachineViewProps) {
  const branch = useWorkspaceStore((s) => s.timeMachineBranch);
  const milestone = useWorkspaceStore((s) => s.timeMachineMilestone);
  const setBranch = useWorkspaceStore((s) => s.setTimeMachineBranch);
  const setMilestone = useWorkspaceStore((s) => s.setTimeMachineMilestone);
  const setBundle = useWorkspaceStore((s) => s.setTimeMachineBundle);
  const presentationOpen = useWorkspaceStore((s) => s.presentationModeOpen);
  const setPresentationOpen = useWorkspaceStore((s) => s.setPresentationModeOpen);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);

  const { data: fetched } = useQuery({
    queryKey: ["time-machine", scenarioId, activeSimulation?.id],
    queryFn: async () => {
      if (activeSimulation?.timeMachine) return activeSimulation.timeMachine;
      if (scenarioId) {
        const snap = await fetchTimeMachineSnapshot(scenarioId);
        if (snap) return snap;
      }
      if (selectedScenario?.time_machine_snapshot) return selectedScenario.time_machine_snapshot;
      if (selectedScenario) {
        return buildTimeMachineBundle(selectedScenario.impact_scores, selectedScenario.params, {}, null);
      }
      return null;
    },
    enabled: Boolean(scenarioId || activeSimulation || selectedScenario),
  });

  useEffect(() => {
    if (fetched) setBundle(fetched);
  }, [fetched, setBundle]);

  const { trajectory, snapshot, cityState } = useTimeMachine();

  if (!trajectory) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-ink-muted">
        Run a simulation to unlock the Decision Time Machine and explore possible futures.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
        <AlternativeFuturesSwitcher active={branch} onChange={setBranch} />
        <button
          type="button"
          onClick={() => setPresentationOpen(true)}
          className="border border-signal px-3 py-1.5 font-mono-data text-[10px] uppercase text-signal hover:bg-signal/10"
        >
          Enter Presentation
        </button>
      </div>

      <CinematicTimelineRail
        milestones={trajectory.milestones}
        calendarYears={trajectory.calendarYears}
        active={milestone}
        onSelect={setMilestone}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-0 flex-col overflow-y-auto">
          <div className="min-h-[240px] flex-1">
            <CityEvolutionView cityState={cityState} calendarYear={snapshot?.calendarYear} />
          </div>
          <ConsequenceEvolutionView
            consequences={trajectory.consequences}
            activeMilestone={milestone}
          />
        </div>
        <div className="overflow-y-auto border-l border-hairline bg-surface">
          <FutureSnapshotPanel snapshot={snapshot} />
          <SocialEvolutionPanel sentiment={snapshot?.sentiment ?? null} />
          <EconomicEvolutionPanel economic={snapshot?.economic ?? null} />
          <EnvironmentalEvolutionPanel environmental={snapshot?.environmental ?? null} />
          <FutureNewsMode headlines={trajectory.headlines} activeYear={snapshot?.calendarYear} />
          <FutureCitizenStories stories={trajectory.citizenStories} activeYear={snapshot?.calendarYear} />
          <FutureComparisonView projectId={projectId} milestone={milestone === "present" ? "y5" : milestone} />
        </div>
      </div>

      <PresentationMode open={presentationOpen} onClose={() => setPresentationOpen(false)} />
    </div>
  );
}
