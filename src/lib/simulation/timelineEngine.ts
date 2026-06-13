import type { TimelineYear } from "@/types/simulation";
import type { CanvasNode, ImpactScores, WorkspaceGraph } from "@/types/workspace";

const YEAR_FACTOR: Record<TimelineYear, number> = {
  1: 0.25,
  3: 0.5,
  5: 0.75,
  10: 1,
};

export function morphGraphForYear(graph: WorkspaceGraph, year: TimelineYear): WorkspaceGraph {
  const factor = YEAR_FACTOR[year];
  const nodes = graph.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      yearLabel: `Y${year}`,
    },
  }));

  const intelligence = { ...graph.intelligence };
  for (const node of nodes) {
    const intel = intelligence[node.id];
    if (intel) {
      intelligence[node.id] = {
        ...intel,
        impact_strength: Math.round(intel.impact_strength * (0.5 + factor * 0.5)),
        timeline: intel.timeline.filter((_, i) => i <= Math.floor(factor * intel.timeline.length)),
      };
    }
  }

  return { nodes, edges: graph.edges, intelligence };
}

export function morphScoresForYear(scores: ImpactScores, year: TimelineYear): ImpactScores {
  const factor = YEAR_FACTOR[year];
  const morph = (v: number, invert = false) => {
    const base = invert ? 100 - v : v;
    const morphed = base * (0.6 + factor * 0.4);
    return Math.round(invert ? 100 - morphed : morphed);
  };

  return {
    economic: morph(scores.economic),
    social: morph(scores.social),
    environmental: morph(scores.environmental),
    infrastructure: morph(scores.infrastructure),
    politicalRisk: morph(scores.politicalRisk, true),
    publicAcceptance: morph(scores.publicAcceptance),
  };
}

export const TIMELINE_YEARS: TimelineYear[] = [1, 3, 5, 10];
