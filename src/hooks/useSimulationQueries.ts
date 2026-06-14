"use client";

import { useQuery } from "@tanstack/react-query";
import { getReportForScenario, getSimulationForScenario } from "@/lib/services/simulationService";

export function useScenarioReport(projectId: string | undefined, scenarioId: string | undefined) {
  return useQuery({
    queryKey: ["scenario-report", projectId, scenarioId],
    queryFn: () =>
      projectId ? getReportForScenario(projectId, scenarioId ?? null) : null,
    enabled: Boolean(projectId),
  });
}

export function useScenarioSimulation(projectId: string | undefined, scenarioId: string | undefined) {
  return useQuery({
    queryKey: ["scenario-simulation", projectId, scenarioId],
    queryFn: () =>
      projectId ? getSimulationForScenario(projectId, scenarioId ?? null) : null,
    enabled: Boolean(projectId),
  });
}
