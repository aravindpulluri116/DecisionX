"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { buildEvidencePackFromSimulation } from "@/lib/evidence/buildEvidencePack";
import type { EvidencePack } from "@/types/evidence";

export function useEvidencePack(): EvidencePack | null {
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const locationIntelligence = useWorkspaceStore((s) => s.locationIntelligence);

  return useMemo(() => {
    if (!activeSimulation) return null;
    return buildEvidencePackFromSimulation(
      {
        ...activeSimulation,
        impactScores: activeSimulation.impactScores ?? selectedScenario?.impact_scores ?? undefined,
      },
      locationIntelligence,
    );
  }, [activeSimulation, selectedScenario?.impact_scores, locationIntelligence]);
}
