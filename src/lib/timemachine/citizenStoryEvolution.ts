import type { CalendarYear, EvolvedCitizenStory, TimelineMilestone } from "@/types/timemachine";
import type { CohortSentiment } from "@/types/timemachine";

const PERSONAS = [
  { name: "Anita", profile: "Student", occupation: "University Student", zone: "Central" },
  { name: "Rajesh", profile: "Business Owners", occupation: "Shop Owner", zone: "South" },
  { name: "Priya", profile: "Commuters", occupation: "IT Professional", zone: "West" },
  { name: "Lakshmi", profile: "Families", occupation: "Healthcare Worker", zone: "East" },
  { name: "Vikram", profile: "Environmental Advocates", occupation: "NGO Coordinator", zone: "North" },
];

export function buildCitizenStoryEvolution(
  cohorts: CohortSentiment[],
  calendarYears: Record<TimelineMilestone, CalendarYear>,
): EvolvedCitizenStory[] {
  return PERSONAS.map((p) => {
    const cohort = cohorts.find((c) => c.profile === p.profile) ?? cohorts[0];
    const stance: EvolvedCitizenStory["stance"] =
      cohort.supportPct > 60 ? "support" : cohort.supportPct < 40 ? "oppose" : "neutral";

    const beats: EvolvedCitizenStory["milestones"] = [
      {
        year: calendarYears.y1,
        narrative:
          stance === "support"
            ? "Early disruption from construction, but commute times already improving on partial routes."
            : "Construction noise and reduced foot traffic affect daily routine.",
      },
      {
        year: calendarYears.y5,
        narrative:
          stance === "support"
            ? "New transit access opens employment options across the city."
            : "Rising rents near corridor strain household budget.",
      },
      {
        year: calendarYears.y10,
        narrative:
          stance === "support"
            ? "Relocated closer to city center for better mobility and career growth."
            : "Considering relocation due to affordability pressure.",
      },
    ];

    if (stance === "support" && p.profile === "Student") {
      beats[0].narrative = "Commute reduced by 40 minutes on new metro segment.";
    }
    if (stance === "oppose" && p.profile === "Business Owners") {
      beats[0].narrative = "Construction affects customer access to the shop.";
    }

    return { ...p, stance, milestones: beats };
  });
}
