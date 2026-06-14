import type { StakeholderOption } from "@/lib/constants/stakeholders";

export const STAKEHOLDER_VISUALS: Record<
  StakeholderOption,
  { color: string; tagline: string; initials: string }
> = {
  Citizens: {
    color: "oklch(0.68 0.16 15)",
    initials: "CI",
    tagline: "Residents and voters in the impact zone",
  },
  Commuters: {
    color: "oklch(0.62 0.14 250)",
    initials: "CO",
    tagline: "Daily travelers on affected routes",
  },
  Businesses: {
    color: "oklch(0.75 0.14 75)",
    initials: "BU",
    tagline: "Local commerce and supply chains",
  },
  Government: {
    color: "oklch(0.58 0.22 262)",
    initials: "GO",
    tagline: "Agencies funding and approving delivery",
  },
  Students: {
    color: "oklch(0.72 0.14 155)",
    initials: "ST",
    tagline: "Schools and youth programs nearby",
  },
  "Environmental Groups": {
    color: "oklch(0.72 0.14 155)",
    initials: "EN",
    tagline: "Ecological and climate advocates",
  },
  "Urban Planners": {
    color: "oklch(0.65 0.18 295)",
    initials: "UP",
    tagline: "Land-use and infrastructure design",
  },
  "Community Groups": {
    color: "oklch(0.68 0.16 15)",
    initials: "CG",
    tagline: "Neighborhood associations and NGOs",
  },
  "Labor Unions": {
    color: "oklch(0.62 0.2 25)",
    initials: "LU",
    tagline: "Workers building or operating the project",
  },
  "Healthcare Providers": {
    color: "oklch(0.68 0.14 195)",
    initials: "HP",
    tagline: "Hospitals and clinics in the corridor",
  },
};
