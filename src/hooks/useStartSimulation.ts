"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { initAgentRuns } from "@/lib/orchestration/agentRuns";
import { normalizeSpecialistSelection, resolveSimulationAgentOrder } from "@/lib/agents/selection";
import type { OrchestratorEvent } from "@/lib/orchestration/events";
import { persistSimulationAsScenario } from "@/lib/services/simulationService";
import { projectToScenarioParams } from "@/lib/services/projectService";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { parseSimulationSse } from "@/lib/simulation/parseSse";
import type { DecisionProject, SimulationInput } from "@/types/simulation";
import type { ScenarioParams } from "@/types/workspace";
import { toast } from "sonner";
import { AI_SPONSOR_NAME } from "@/lib/brand";

type StartSimulationArgs = {
  project: DecisionProject;
  params?: ScenarioParams;
  scenarioTitle?: string;
  navigateOnComplete?: boolean;
};

async function handleOrchestratorEvent(
  event: OrchestratorEvent,
  ctx: {
    input: SimulationInput;
    scenarioTitle?: string;
    navigateOnComplete: boolean;
    project: DecisionProject;
    router: ReturnType<typeof useRouter>;
    queryClient: ReturnType<typeof useQueryClient>;
  },
) {
  const {
    appendLog,
    updateAgentRun,
    setActiveSimulation,
    setActiveReport,
    setSelectedScenario,
  } = useWorkspaceStore.getState();

  switch (event.type) {
    case "log":
      appendLog(event.message);
      break;
    case "agent:status":
      updateAgentRun(event.agentId, { status: event.status });
      break;
    case "agent:finding":
      useWorkspaceStore.getState().appendAgentFinding(event.agentId, event.finding);
      break;
    case "agent:complete":
      updateAgentRun(event.agentId, {
        result: event.result,
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      break;
    case "enrichment:ready":
      useWorkspaceStore.getState().setLocationIntelligence(event.intelligence);
      break;
    case "report:ready":
      setActiveReport(event.report);
      break;
    case "simulation:complete": {
      setActiveSimulation(event.simulation);
      const title =
        ctx.scenarioTitle ??
        `${ctx.project.title} — Analysis ${new Date().toLocaleDateString()}`;
      const scenario = await persistSimulationAsScenario(ctx.input, event.simulation, title);
      setSelectedScenario(scenario);
      await ctx.queryClient.invalidateQueries({ queryKey: ["scenarios", ctx.project.id] });
      await ctx.queryClient.invalidateQueries({ queryKey: ["projects"] });
      await ctx.queryClient.invalidateQueries({ queryKey: ["workspace-graph", scenario.id] });
      if (ctx.navigateOnComplete && ctx.project.slug) {
        ctx.router.push(`/workspace/${ctx.project.slug}`);
      }
      toast.success("Analysis complete", { description: title });
      useWorkspaceStore.getState().setWorkspaceTab("report");
      await ctx.queryClient.invalidateQueries({
        queryKey: ["scenario-report", ctx.project.id, scenario.id],
      });
      await ctx.queryClient.invalidateQueries({
        queryKey: ["scenario-simulation", ctx.project.id, scenario.id],
      });
      break;
    }
  }
}

export function useStartSimulation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const setSimulationTheaterOpen = useWorkspaceStore((s) => s.setSimulationTheaterOpen);
  const setSimulationInProgress = useWorkspaceStore((s) => s.setSimulationInProgress);
  const setSimulationProposal = useWorkspaceStore((s) => s.setSimulationProposal);
  const setAgentRuns = useWorkspaceStore((s) => s.setAgentRuns);
  const clearLog = useWorkspaceStore((s) => s.clearLog);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);

  return useCallback(
    async ({ project, params, scenarioTitle, navigateOnComplete = true }: StartSimulationArgs) => {
      if (useWorkspaceStore.getState().simulationInProgress) {
        toast.info("A simulation is already running", {
          description: "Minimize the council view or wait for it to finish.",
        });
        return;
      }

      setBuilderOpen(false);
      setWizardOpen(false);
      clearLog();

      const baseParams = params ?? projectToScenarioParams(project);
      const selectedAgents = normalizeSpecialistSelection(baseParams.selectedAgents);

      if (selectedAgents.length === 0) {
        toast.error("Select at least one council specialist");
        return;
      }

      const mergedParams: ScenarioParams = {
        ...baseParams,
        selectedAgents,
      };

      const councilAgents = resolveSimulationAgentOrder(mergedParams);
      setAgentRuns(
        initAgentRuns({ agentIds: councilAgents, stakeholders: project.stakeholders }),
      );
      setSimulationProposal(
        project.title,
        project.locationIntelligence?.address ?? project.geo?.address ?? "",
      );
      setSimulationInProgress(true, { slug: project.slug, id: project.id });
      setSimulationTheaterOpen(true);
      useWorkspaceStore.getState().setWorkspaceTab("report");

      const input: SimulationInput = {
        project,
        params: mergedParams,
        scenarioTitle,
      };

      const abortController = new AbortController();
      // Route handler sets maxDuration=300; give client a matching timeout
      const timeoutId = setTimeout(() => abortController.abort(), 310_000);

      try {
        const response = await fetch("/api/simulations/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const message =
            typeof body.error === "string"
              ? body.error
              : `Simulation API error: ${response.status}`;
          throw new Error(message);
        }

        for await (const event of parseSimulationSse(response)) {
          await handleOrchestratorEvent(event, {
            input,
            scenarioTitle,
            navigateOnComplete,
            project,
            router,
            queryClient,
          });
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          toast.error("Simulation timed out. Please try again.");
        } else if (e instanceof Error && e.message.includes(AI_SPONSOR_NAME)) {
          toast.error(`${AI_SPONSOR_NAME} unavailable`, { description: e.message });
        } else {
          toast.error("Simulation failed", {
            description: e instanceof Error ? e.message : undefined,
          });
        }
        if (process.env.NODE_ENV !== "production") console.error(e);
      } finally {
        clearTimeout(timeoutId);
        setSimulationInProgress(false, null);
        setSimulationTheaterOpen(false);
      }
    },
    [
      router,
      queryClient,
      setSimulationTheaterOpen,
      setSimulationInProgress,
      setSimulationProposal,
      setAgentRuns,
      clearLog,
      setBuilderOpen,
      setWizardOpen,
    ],
  );
}
