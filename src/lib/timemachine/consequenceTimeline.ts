import type { AgentResult } from "@/types/simulation";
import type { CalendarYear, ConsequenceMilestone, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

type ConsequenceLink = {
  source: string;
  target: string;
  type?: string;
  confidence?: number;
};

const MILESTONE_FOR_INDEX: TimelineMilestone[] = ["y1", "y3", "y5", "y10", "y20"];

export function buildConsequenceTimeline(
  futureShock: AgentResult | undefined,
  calendarYears: Record<TimelineMilestone, CalendarYear>,
): ConsequenceMilestone[] {
  const raw = futureShock?.raw as { consequences?: ConsequenceLink[] } | undefined;
  const links = raw?.consequences ?? [
    { source: "Project Decision", target: "Traffic Reduction", type: "impact", confidence: 75 },
    { source: "Traffic Reduction", target: "Property Value Growth", type: "economic", confidence: 68 },
    { source: "Property Value Growth", target: "Rental Inflation", type: "risk", confidence: 62 },
    { source: "Rental Inflation", target: "Population Migration", type: "social", confidence: 55 },
  ];

  return links.slice(0, 5).map((link, i) => {
    const milestone = MILESTONE_FOR_INDEX[Math.min(i, MILESTONE_FOR_INDEX.length - 1)];
    return {
      year: calendarYears[milestone],
      milestone,
      label: link.target,
      description: `${link.source} leads to ${link.target}`,
      type: link.type ?? "impact",
      confidence: link.confidence ?? 60,
    };
  });
}

export function visibleConsequences(
  consequences: ConsequenceMilestone[],
  activeMilestone: TimelineMilestone,
): ConsequenceMilestone[] {
  const idx = TIMELINE_MILESTONES.indexOf(activeMilestone);
  return consequences.filter((c) => TIMELINE_MILESTONES.indexOf(c.milestone) <= idx);
}
