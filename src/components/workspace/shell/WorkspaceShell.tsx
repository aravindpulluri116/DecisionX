"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DecisionNavigator } from "../navigator/DecisionNavigator";
import { IntelligencePanel } from "../intelligence/IntelligencePanel";
import { IntelligenceDrawer } from "../intelligence/IntelligenceDrawer";
import { IntelligenceLoader } from "../shared/IntelligenceLoader";
import { WorkspaceHud } from "../shared/WorkspaceHud";

// Heavy view components: lazy-loaded on first render to keep initial bundle small
const DecisionCanvas = dynamic(
  () => import("../canvas/DecisionCanvas").then((m) => ({ default: m.DecisionCanvas })),
  { loading: () => <IntelligenceLoader />, ssr: false },
);
const ScenarioBuilder = dynamic(
  () => import("../builder/ScenarioBuilder").then((m) => ({ default: m.ScenarioBuilder })),
  { ssr: false },
);
const ProjectWizard = dynamic(
  () => import("../wizard/ProjectWizard").then((m) => ({ default: m.ProjectWizard })),
  { ssr: false },
);
const SimulationTheater = dynamic(
  () => import("../simulation/SimulationTheater").then((m) => ({ default: m.SimulationTheater })),
  { ssr: false },
);
const CompareView = dynamic(
  () => import("../compare/CompareView").then((m) => ({ default: m.CompareView })),
  { loading: () => <IntelligenceLoader />, ssr: false },
);
const ReportView = dynamic(
  () => import("../report/ReportView").then((m) => ({ default: m.ReportView })),
  { loading: () => <IntelligenceLoader />, ssr: false },
);
const GeoIntelligenceMap = dynamic(
  () => import("../map/GeoIntelligenceMap").then((m) => ({ default: m.GeoIntelligenceMap })),
  { loading: () => <IntelligenceLoader />, ssr: false },
);
const TimeMachineView = dynamic(
  () => import("../timemachine/TimeMachineView").then((m) => ({ default: m.TimeMachineView })),
  { loading: () => <IntelligenceLoader />, ssr: false },
);
const LocationIntelligencePanel = dynamic(
  () =>
    import("../map/LocationIntelligencePanel").then((m) => ({
      default: m.LocationIntelligencePanel,
    })),
  { ssr: false },
);
import { fetchActiveScenario, fetchProjectBySlug, fetchScenarios } from "@/lib/workspace/queries";
import { touchRecentProject } from "@/lib/workspace/mock-storage";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toDecisionProject } from "@/lib/services/projectService";
import { useStartSimulation } from "@/hooks/useStartSimulation";
import type { Scenario } from "@/types/workspace";

type WorkspaceShellProps = {
  projectSlug: string;
};

function CenterPanel({
  scenarioId,
  projectTitle,
  projectId,
}: {
  scenarioId: string | null;
  projectTitle: string;
  projectId: string;
}) {
  const workspaceMode = useWorkspaceStore((s) => s.workspaceMode);

  switch (workspaceMode) {
    case "timeline":
    case "timemachine":
      return <TimeMachineView projectId={projectId} scenarioId={scenarioId} />;
    case "compare":
      return <CompareView projectId={projectId} />;
    case "report":
      return <ReportView />;
    case "map":
      return <GeoIntelligenceMap />;
    default:
      return <DecisionCanvas scenarioId={scenarioId} projectTitle={projectTitle} />;
  }
}

function RightPanel() {
  const workspaceMode = useWorkspaceStore((s) => s.workspaceMode);
  const locationIntelligence = useWorkspaceStore((s) => s.locationIntelligence);

  if (workspaceMode === "map") {
    return <LocationIntelligencePanel intelligence={locationIntelligence} />;
  }
  return <IntelligencePanel />;
}

export function WorkspaceShell({ projectSlug }: WorkspaceShellProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(true);
  const [intelOpen, setIntelOpen] = useState(true);
  const queryClient = useQueryClient();
  const startSimulation = useStartSimulation();

  const setSelectedScenario = useWorkspaceStore((s) => s.setSelectedScenario);
  const setSelectedNodeId = useWorkspaceStore((s) => s.setSelectedNodeId);
  const setNodeIntelligence = useWorkspaceStore((s) => s.setNodeIntelligence);
  const setLocationIntelligence = useWorkspaceStore((s) => s.setLocationIntelligence);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);
  const workspaceMode = useWorkspaceStore((s) => s.workspaceMode);

  const { data: project, isPending, isError, isFetched } = useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => fetchProjectBySlug(projectSlug),
    retry: 1,
  });

  const { data: activeScenario } = useQuery({
    queryKey: ["active-scenario", project?.id],
    queryFn: () => (project ? fetchActiveScenario(project.id) : null),
    enabled: Boolean(project?.id),
  });

  useEffect(() => {
    if (project?.location_intelligence) {
      setLocationIntelligence(project.location_intelligence);
    }
  }, [project?.location_intelligence, setLocationIntelligence]);

  useEffect(() => {
    if (project?.slug) {
      touchRecentProject(project.slug);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  }, [project?.slug, queryClient]);

  useEffect(() => {
    if (activeScenario) {
      setActiveScenarioId(activeScenario.id);
      setSelectedScenario(activeScenario);
    }
  }, [activeScenario, setSelectedScenario]);

  // Map mode benefits from geo panel; canvas mode keeps intel panel
  useEffect(() => {
    if (workspaceMode === "map") setIntelOpen(true);
  }, [workspaceMode]);

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setSelectedScenario(scenario);
    setSelectedNodeId(null);
    setNodeIntelligence(null);
  };

  const handleRunSimulation = async () => {
    if (!project) return;
    if (!activeScenarioId) {
      setBuilderOpen(true);
      return;
    }
    const decisionProject = toDecisionProject(project);
    await startSimulation({
      project: decisionProject,
      params: activeScenario?.params,
      scenarioTitle: activeScenario?.title,
    });
  };

  const overlays = (
    <>
      {project && (
        <ScenarioBuilder
          project={project}
          onScenarioCreated={async (id) => {
            setActiveScenarioId(id);
            setSelectedNodeId(null);
            setNodeIntelligence(null);
            await queryClient.invalidateQueries({ queryKey: ["scenarios", project.id] });
            await queryClient.invalidateQueries({ queryKey: ["active-scenario", project.id] });
            await queryClient.invalidateQueries({ queryKey: ["workspace-graph", id] });
            const scenarios = await queryClient.fetchQuery({
              queryKey: ["scenarios", project.id],
              queryFn: () => fetchScenarios(project.id),
            });
            const created = scenarios.find((s) => s.id === id);
            if (created) setSelectedScenario(created);
          }}
        />
      )}
      <ProjectWizard />
      <SimulationTheater />
      <IntelligenceDrawer />
    </>
  );

  if (isPending) {
    return (
      <>
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-signal border-t-transparent" />
          <p className="text-sm text-ink-muted">Loading workspace…</p>
        </div>
        {overlays}
      </>
    );
  }

  if (isError || (isFetched && !project)) {
    return (
      <>
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="font-display text-xl font-semibold text-ink">Project not found</p>
          <p className="max-w-md text-sm text-ink-muted">
            {isError
              ? "Could not load this workspace. If Supabase is configured, make sure it is running — or create a new decision."
              : `"${projectSlug}" does not exist. Create it with New decision, or open a seed project.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-white"
            >
              New decision
            </button>
            <a
              href="/workspace/metro-expansion-hyderabad"
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-muted hover:text-ink"
            >
              Open demo project
            </a>
          </div>
        </div>
        {overlays}
      </>
    );
  }

  if (!project) return overlays;

  const showIntelPanel =
    intelOpen && workspaceMode !== "timemachine" && workspaceMode !== "compare";

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <WorkspaceHud
        projectTitle={project.title}
        scenarioTitle={activeScenario?.title}
        navOpen={navOpen}
        intelOpen={intelOpen}
        onToggleNav={() => setNavOpen((o) => !o)}
        onToggleIntel={() => setIntelOpen((o) => !o)}
        onRunSimulation={handleRunSimulation}
        onNewDecision={() => setWizardOpen(true)}
      />

      <div className="relative min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          {navOpen && (
            <>
              <ResizablePanel
                defaultSize={16}
                minSize={navOpen ? 14 : 3}
                maxSize={22}
                collapsible
                collapsedSize={3}
              >
                <DecisionNavigator
                  projectId={project.id}
                  projectSlug={projectSlug}
                  activeScenarioId={activeScenarioId}
                  onScenarioSelect={handleScenarioSelect}
                  collapsed={false}
                />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-hairline/80" />
            </>
          )}

          {!navOpen && (
            <div className="w-44 shrink-0 border-r border-hairline">
              <DecisionNavigator
                projectId={project.id}
                projectSlug={projectSlug}
                activeScenarioId={activeScenarioId}
                onScenarioSelect={handleScenarioSelect}
                collapsed
              />
            </div>
          )}

          <ResizablePanel defaultSize={showIntelPanel ? 58 : 100} minSize={45}>
            <div className="relative h-full overflow-hidden bg-[oklch(0.988_0.004_240)]">
              <CenterPanel
                scenarioId={activeScenarioId}
                projectTitle={project.title}
                projectId={project.id}
              />
            </div>
          </ResizablePanel>

          {showIntelPanel && (
            <>
              <ResizableHandle withHandle className="bg-hairline/80" />
              <ResizablePanel defaultSize={26} minSize={20} maxSize={34}>
                <RightPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {overlays}
    </div>
  );
}
