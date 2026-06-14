/** Selectable stakeholder groups in the project wizard */
export const STAKEHOLDER_OPTIONS = [
  "Citizens",
  "Commuters",
  "Businesses",
  "Government",
  "Students",
  "Environmental Groups",
  "Urban Planners",
  "Community Groups",
  "Labor Unions",
  "Healthcare Providers",
] as const;

export type StakeholderOption = (typeof STAKEHOLDER_OPTIONS)[number];
