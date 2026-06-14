"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectAlternativeFromReport, type ProjectedAlternative } from "@/lib/workspace/alternative-projection";
import { parseAlternative, type ParsedAlternative } from "@/lib/workspace/report-formatters";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import type { ImpactScores, ScenarioParams } from "@/types/workspace";

type UseAlternativeProjectionArgs = {
  projectTitle: string;
  projectId: string;
  scenarioId: string | undefined;
  baselineScores: ImpactScores | null;
  baselineParams: ScenarioParams | null;
  alternativeRaw: string | undefined;
  executiveSummary?: string;
  enabled: boolean;
};

type ProjectionResponse = {
  alternative: ProjectedAlternative;
  source: "ai" | "heuristic";
  warning?: string;
};

async function fetchAlternativeProjection(input: {
  projectTitle: string;
  baselineScores: ImpactScores;
  baselineParams: ScenarioParams;
  alternativeRaw: string;
  executiveSummary?: string;
}): Promise<ProjectionResponse> {
  const res = await fetch("/api/compare/project-alternative", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Projection request failed");
  }

  return res.json() as Promise<ProjectionResponse>;
}

export function useAlternativeProjection({
  projectTitle,
  projectId,
  scenarioId,
  baselineScores,
  baselineParams,
  alternativeRaw,
  executiveSummary,
  enabled,
}: UseAlternativeProjectionArgs) {
  const parsed: ParsedAlternative | null = useMemo(() => {
    if (!alternativeRaw) return null;
    return parseAlternative(alternativeRaw);
  }, [alternativeRaw]);

  const heuristic = useMemo((): ProjectedAlternative | null => {
    if (!baselineScores || !parsed) return null;
    return projectAlternativeFromReport(baselineScores, parsed);
  }, [baselineScores, parsed]);

  const canFetch =
    enabled &&
    Boolean(scenarioId) &&
    Boolean(baselineScores) &&
    Boolean(baselineParams) &&
    Boolean(alternativeRaw);

  const query = useQuery({
    queryKey: ["alternative-projection", projectId, scenarioId, alternativeRaw],
    queryFn: () =>
      fetchAlternativeProjection({
        projectTitle,
        baselineScores: baselineScores!,
        baselineParams: baselineParams!,
        alternativeRaw: alternativeRaw!,
        executiveSummary,
      }),
    enabled: canFetch,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const alternative = query.data?.alternative ?? heuristic;
  const source = query.data?.source ?? heuristic?.source;
  const isRefining = canFetch && query.isFetching && source !== "ai";

  return {
    alternative,
    parsed,
    source,
    isRefining,
    isLoading: canFetch && query.isLoading && !heuristic,
    warning: query.data?.warning,
    error: query.error,
  };
}

export function baselineViabilityFromScores(scores: ImpactScores): number {
  return computeViabilityIndex(scores);
}
