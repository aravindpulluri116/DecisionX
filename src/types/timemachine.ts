export type TimelineMilestone = "present" | "y1" | "y3" | "y5" | "y10" | "y20";

export type CalendarYear = number;

export type FutureBranch = "bestCase" | "expectedCase" | "worstCase";

export type PoliticalViabilityLevel = "low" | "medium" | "high";

export type PopulationSnapshot = {
  totalEstimate: number;
  densityIndex: number;
  migrationDirection: "inward" | "outward" | "stable";
};

export type EconomicSnapshot = {
  businessActivity: number;
  employment: number;
  investment: number;
  taxRevenue: number;
};

export type EnvironmentalSnapshot = {
  carbonImpact: number;
  landUsage: number;
  greenSpaces: number;
  pollution: number;
};

export type CohortSentiment = {
  profile: string;
  supportPct: number;
  opposePct: number;
  neutralPct: number;
};

export type SentimentSnapshot = {
  supportPct: number;
  opposePct: number;
  neutralPct: number;
  cohorts: CohortSentiment[];
};

export type FutureSnapshot = {
  milestone: TimelineMilestone;
  calendarYear: CalendarYear;
  population: PopulationSnapshot;
  economic: EconomicSnapshot;
  infrastructure: number;
  environmental: EnvironmentalSnapshot;
  sentiment: SentimentSnapshot;
  politicalViability: PoliticalViabilityLevel;
  viabilityScore: number;
};

export type ConsequenceMilestone = {
  year: CalendarYear;
  milestone: TimelineMilestone;
  label: string;
  description: string;
  type: string;
  confidence: number;
};

export type FutureHeadline = {
  year: CalendarYear;
  title: string;
  subtitle: string;
  tone: "positive" | "neutral" | "negative";
};

export type EvolvedCitizenStory = {
  name: string;
  profile: string;
  occupation: string;
  zone: string;
  stance: "support" | "oppose" | "neutral";
  milestones: { year: CalendarYear; narrative: string }[];
};

export type CityEvolutionState = {
  milestone: TimelineMilestone;
  buildingScale: number;
  transitCoverage: number;
  populationDensity: number;
  zoneHeatmap: { zoneId: string; supportWeight: number }[];
};

export type FutureTrajectory = {
  branch: FutureBranch;
  milestones: TimelineMilestone[];
  calendarYears: Record<TimelineMilestone, CalendarYear>;
  snapshots: Record<TimelineMilestone, FutureSnapshot>;
  consequences: ConsequenceMilestone[];
  headlines: FutureHeadline[];
  citizenStories: EvolvedCitizenStory[];
  cityStates: CityEvolutionState[];
  generatedAt: string;
};

export type TimeMachineBundle = {
  expected: FutureTrajectory;
  best: FutureTrajectory;
  worst: FutureTrajectory;
};

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  "present",
  "y1",
  "y3",
  "y5",
  "y10",
  "y20",
];
