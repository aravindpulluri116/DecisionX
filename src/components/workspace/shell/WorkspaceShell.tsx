"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceShellLayout } from "../shared/WorkspaceShellLayout";
import { WorkspaceLoadingState } from "../shared/WorkspaceLoadingState";
import { WorkspaceEmptyState } from "../shared/WorkspaceEmptyState";
import { WorkspaceHud } from "../shared/WorkspaceHud";
import { IntelligencePanel } from "../intelligence/IntelligencePanel";
import { IntelligenceLoader } from "../shared/IntelligenceLoader";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { fetchActiveScenario, ensureProjectRecord, fetchProjectBySlug, fetchScenarios, linkOrphanSimulationRuns } from "@/lib/workspace/queries";
import { touchRecentProject } from "@/lib/workspace/mock-storage";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toDecisionProject, projectToScenarioParams } from "@/lib/services/projectService";
import { useScenarioSimulation } from "@/hooks/useSimulationQueries";
import { useEvidencePack } from "@/hooks/useEvidencePack";
import { useStartSimulation } from "@/hooks/useStartSimulation";
import { ExplanationDrawer } from "../evidence/ExplanationDrawer";
import type { Scenario } from "@/types/workspace";

const ScenarioBuilder = dynamic(
  () => import("../builder/ScenarioBuilder").then((m) => ({ default: m.ScenarioBuilder })),
  { ssr: false },
);
const ProjectWizard = dynamic(
  () => import("../wizard/ProjectWizard").then((m) => ({ default: m.ProjectWizard })),
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

type WorkspaceShellProps = {
  projectSlug: string;
};

export function WorkspaceShell({ projectSlug }: WorkspaceShellProps) {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const startSimulation = useStartSimulation();

  const setSelectedScenario = useWorkspaceStore((s) => s.setSelectedScenario);
  const setActiveSimulation = useWorkspaceStore((s) => s.setActiveSimulation);
  const setActiveReport = useWorkspaceStore((s) => s.setActiveReport);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);
  const setLocationIntelligence = useWorkspaceStore((s) => s.setLocationIntelligence);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);
  const setWorkspaceTab = useWorkspaceStore((s) => s.setWorkspaceTab);
  const workspaceTab = useWorkspaceStore((s) => s.workspaceTab);
  const explanationOpen = useWorkspaceStore((s) => s.explanationOpen);
  const explanationTarget = useWorkspaceStore((s) => s.explanationTarget);
  const closeExplanation = useWorkspaceStore((s) => s.closeExplanation);
  const evidencePack = useEvidencePack();

  const { data: project, isPending, isError, isFetched, isLoading } = useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => fetchProjectBySlug(projectSlug),
    retry: 1,
  });

  const { data: hydratedSimulation } = useScenarioSimulation(
    project?.id,
    selectedScenario?.id,
  );

  useEffect(() => {
    if (!hydratedSimulation) return;

    const current = useWorkspaceStore.getState().activeSimulation;
    const hydratedAgents = Object.keys(hydratedSimulation.agentResults ?? {}).length;
    const currentAgents = Object.keys(current?.agentResults ?? {}).length;
    const sameScenario =
      !current?.scenarioId || current.scenarioId === selectedScenario?.id;

    if (!current || !sameScenario || hydratedAgents >= currentAgents) {
      setActiveSimulation({
        ...hydratedSimulation,
        impactScores:
          hydratedSimulation.impactScores ??
          current?.impactScores ??
          selectedScenario?.impact_scores ??
          undefined,
        agentResults:
          hydratedAgents > 0
            ? hydratedSimulation.agentResults
            : (current?.agentResults ?? hydratedSimulation.agentResults),
        graph: hydratedSimulation.graph ?? current?.graph,
      });
    }
  }, [hydratedSimulation, selectedScenario?.impact_scores, selectedScenario?.id, setActiveSimulation]);

  const { data: activeScenario } = useQuery({
    queryKey: ["active-scenario", project?.id],
    queryFn: () => (project ? fetchActiveScenario(project.id) : null),
    enabled: Boolean(project?.id),
  });

  useEffect(() => {
    if (!project) return;
    const p = toDecisionProject(project);
    void ensureProjectRecord({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status,
      impact_score: p.impact_score,
      risk_level: p.risk_level,
      project_type: p.project_type,
      location: p.location,
      description: p.description,
      category: p.category,
      stakeholders: p.stakeholders,
      budget: p.budget,
      timeline: p.timeline,
    }).catch((e) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[WorkspaceShell] project sync failed:", e);
      }
    });
  }, [project]);

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
    if (
      selectedScenario &&
      project?.id &&
      selectedScenario.project_id === project.id &&
      selectedScenario.id !== activeScenarioId
    ) {
      setActiveScenarioId(selectedScenario.id);
    }
  }, [selectedScenario, project?.id, activeScenarioId]);

  useEffect(() => {
    if (activeScenario && project?.id) {
      setActiveScenarioId(activeScenario.id);
      setSelectedScenario(activeScenario);
      void linkOrphanSimulationRuns(project.id, activeScenario.id).then(() => {
        queryClient.invalidateQueries({
          queryKey: ["scenario-simulation", project.id, activeScenario.id],
        });
      });
    }
  }, [activeScenario, project?.id, setSelectedScenario, queryClient]);

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    setSelectedScenario(scenario);
    setActiveReport(null);
    setActiveSimulation(null);
    setWorkspaceTab("report");
  };

  const handleRunSimulation = async () => {
    if (!project) return;

    const decisionProject = toDecisionProject(project);

    let scenario =
      (selectedScenario?.project_id === project.id ? selectedScenario : null) ??
      activeScenario ??
      null;

    if (!scenario?.params) {
      const scenarios = await queryClient.fetchQuery({
        queryKey: ["scenarios", project.id],
        queryFn: () => fetchScenarios(project.id),
      });
      scenario =
        scenarios.find((s) => s.is_active) ??
        [...scenarios].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0] ??
        null;
      if (scenario) {
        setSelectedScenario(scenario);
        setActiveScenarioId(scenario.id);
      }
    }

    const params =
      scenario?.params ??
      (activeSimulation?.projectId === project.id ? activeSimulation.params : undefined) ??
      hydratedSimulation?.params ??
      projectToScenarioParams(decisionProject);

    const scenarioTitle =
      scenario?.title ?? `${project.title} — Analysis ${new Date().toLocaleDateString()}`;

    await startSimulation({
      project: decisionProject,
      params,
      scenarioTitle,
      navigateOnComplete: false,
    });
  };

  const overlays = (
    <>
      {project && (
        <ScenarioBuilder
          project={project}
          onScenarioCreated={async (id) => {
            setActiveScenarioId(id);
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
      <ExplanationDrawer
        open={explanationOpen}
        onClose={closeExplanation}
        pack={evidencePack}
        target={explanationTarget}
      />
    </>
  );

  if (isPending || (isLoading && !project)) {
    return (
      <>
        <WorkspaceLoadingState message="Loading workspace…" />
        {overlays}
      </>
    );
  }

  if (isError || (isFetched && !project)) {
    return (
      <>
        <WorkspaceEmptyState
          icon={FileText}
          title="Project not found"
          description={
            isError
              ? "Could not load this workspace. Check your Supabase connection, or create a new decision."
              : `"${projectSlug}" was not found. It may have been removed.`
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white shadow-[0_2px_12px_oklch(0.52_0.22_262/0.3)]"
              >
                <Plus className="h-4 w-4" />
                New decision
              </button>
              <Link
                href="/workspace"
                className="rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                All projects
              </Link>
            </div>
          }
          className="h-screen"
        />
        {overlays}
      </>
    );
  }

  if (!project) return overlays;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <WorkspaceHud
        projectTitle={project.title}
        scenarioTitle={activeScenario?.title}
        projectId={project.id}
        projectSlug={projectSlug}
        activeScenarioId={activeScenarioId}
        onScenarioSelect={handleScenarioSelect}
        onRunSimulation={handleRunSimulation}
        onNewDecision={() => setWizardOpen(true)}
      />

      <WorkspaceShellLayout className="flex-1">
        {workspaceTab === "report" && (
          <div className="relative h-full overflow-hidden border-t border-hairline/50 bg-surface/80">
            <ReportView projectId={project.id} />
          </div>
        )}

        {workspaceTab === "compare" && (
          <div className="relative h-full overflow-hidden border-t border-hairline/50 bg-surface/80">
            <CompareView projectId={project.id} />
          </div>
        )}

        {workspaceTab === "intelligence" && (
          <div className="mx-auto h-full max-w-3xl overflow-hidden rounded-t-xl border-x border-t border-hairline/80 bg-surface/90 shadow-sm">
            <IntelligencePanel variant="page" />
          </div>
        )}
      </WorkspaceShellLayout>

      {overlays}
    </div>
  );
}
