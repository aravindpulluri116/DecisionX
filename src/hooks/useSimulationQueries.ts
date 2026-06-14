"use client";

import { useQuery } from "@tanstack/react-query";
import { withTimeout } from "@/lib/supabase/with-timeout";
import { getReportForScenario, getSimulationForScenario } from "@/lib/services/simulationService";

const QUERY_TIMEOUT_MS = 8_000;

export function useScenarioReport(projectId: string | undefined, scenarioId: string | undefined) {
  return useQuery({
    queryKey: ["scenario-report", projectId, scenarioId],
    queryFn: () =>
      withTimeout(
        projectId && scenarioId
          ? getReportForScenario(projectId, scenarioId)
          : Promise.resolve(null),
        QUERY_TIMEOUT_MS,
      ),
    enabled: Boolean(projectId && scenarioId),
    retry: 1,
  });
}

export function useScenarioSimulation(projectId: string | undefined, scenarioId: string | undefined) {
  return useQuery({
    queryKey: ["scenario-simulation", projectId, scenarioId],
    queryFn: () =>
      withTimeout(
        projectId && scenarioId
          ? getSimulationForScenario(projectId, scenarioId)
          : Promise.resolve(null),
        QUERY_TIMEOUT_MS,
      ),
    enabled: Boolean(projectId && scenarioId),
    retry: 1,
  });
}
