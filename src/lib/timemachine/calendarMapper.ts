import type { CalendarYear, TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

const DEFAULT_BASE_YEAR = 2026;

const YEAR_OFFSET: Record<TimelineMilestone, number> = {
  present: 0,
  y1: 1,
  y3: 4,
  y5: 6,
  y10: 11,
  y20: 21,
};

export function buildCalendarYears(baseYear = DEFAULT_BASE_YEAR): Record<TimelineMilestone, CalendarYear> {
  const years = {} as Record<TimelineMilestone, CalendarYear>;
  for (const m of TIMELINE_MILESTONES) {
    years[m] = baseYear + YEAR_OFFSET[m];
  }
  return years;
}

export function milestoneLabel(m: TimelineMilestone, years: Record<TimelineMilestone, CalendarYear>): string {
  if (m === "present") return "Present";
  return String(years[m]);
}
