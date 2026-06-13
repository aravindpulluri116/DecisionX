"use client";

import { useQuery } from "@tanstack/react-query";
import { listProjects, getProjectBySlug } from "@/lib/services/projectService";
import { getSimulation, getReport } from "@/lib/services/simulationService";
import { fetchScenarios } from "@/lib/workspace/queries";

export function useProjects() {
  return useQuery({ queryKey: ["decision-projects"], queryFn: listProjects });
}

export function useDecisionProject(slug: string) {
  return useQuery({
    queryKey: ["decision-project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useProjectScenarios(projectId: string | undefined) {
  return useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => (projectId ? fetchScenarios(projectId) : []),
    enabled: Boolean(projectId),
  });
}

export function useSimulation(id: string | null) {
  return useQuery({
    queryKey: ["simulation", id],
    queryFn: () => (id ? getSimulation(id) : null),
    enabled: Boolean(id),
  });
}

export function useReport(id: string | null) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => (id ? getReport(id) : null),
    enabled: Boolean(id),
  });
}
