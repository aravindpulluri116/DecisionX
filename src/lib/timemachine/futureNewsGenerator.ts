import type {
  ConsequenceMilestone,
  FutureHeadline,
  FutureSnapshot,
  TimelineMilestone,
} from "@/types/timemachine";

export function generateFutureHeadlines(
  snapshots: Record<TimelineMilestone, FutureSnapshot>,
  consequences: ConsequenceMilestone[],
): FutureHeadline[] {
  const headlines: FutureHeadline[] = [];
  const y5 = snapshots.y5;
  const y10 = snapshots.y10;
  const y20 = snapshots.y20;

  if (y5) {
    headlines.push({
      year: y5.calendarYear,
      title: "Construction Phase Nears Completion Across Key Corridors",
      subtitle: `Public sentiment at ${y5.sentiment.supportPct}% support as infrastructure matures`,
      tone: y5.sentiment.supportPct > 60 ? "positive" : "neutral",
    });
  }

  const econConseq = consequences.find((c) => c.label.toLowerCase().includes("property") || c.label.toLowerCase().includes("economic"));
  if (y10 && econConseq) {
    headlines.push({
      year: y10.calendarYear,
      title: `${econConseq.label} Drives Regional Economic Activity`,
      subtitle: `Business activity index reaches ${y10.economic.businessActivity}/100`,
      tone: "positive",
    });
  }

  if (y10) {
    headlines.push({
      year: y10.calendarYear,
      title: "Metro Corridor Boosts Regional Economy",
      subtitle: `Employment index at ${y10.economic.employment}; investment flows accelerate`,
      tone: "positive",
    });
  }

  if (y20) {
    headlines.push({
      year: y20.calendarYear,
      title: "Housing Affordability Emerges as Key Policy Challenge",
      subtitle: `Support at ${y20.sentiment.supportPct}% as migration patterns shift`,
      tone: y20.sentiment.opposePct > 35 ? "negative" : "neutral",
    });
  }

  return headlines;
}
