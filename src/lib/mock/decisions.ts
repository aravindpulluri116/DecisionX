export type ConsequenceLevel = {
  label: string;
  tone?: "positive" | "warning" | "negative" | "neutral";
  weight?: number; // 0-1 magnitude
};

export type DecisionScenario = {
  id: string;
  title: string;
  category: string;
  chain: ConsequenceLevel[]; // first = immediate, last = long-term
};

export const decisions: DecisionScenario[] = [
  {
    id: "metro",
    title: "Build Metro",
    category: "Infrastructure",
    chain: [
      { label: "Traffic Reduction", tone: "positive", weight: 0.82 },
      { label: "Property Growth", tone: "positive", weight: 0.74 },
      { label: "Rental Inflation", tone: "warning", weight: 0.61 },
      { label: "Displacement Risk", tone: "negative", weight: 0.42 },
    ],
  },
  {
    id: "fare",
    title: "Increase Bus Fare",
    category: "Transit Policy",
    chain: [
      { label: "Revenue Lift", tone: "positive", weight: 0.55 },
      { label: "Ridership Decline", tone: "warning", weight: 0.68 },
      { label: "Congestion Rise", tone: "negative", weight: 0.59 },
      { label: "Low-Income Impact", tone: "negative", weight: 0.71 },
    ],
  },
  {
    id: "zone",
    title: "Industrial Zone",
    category: "Land Use",
    chain: [
      { label: "Job Creation", tone: "positive", weight: 0.79 },
      { label: "Local GDP Lift", tone: "positive", weight: 0.64 },
      { label: "Air Quality Drop", tone: "negative", weight: 0.66 },
      { label: "Water Stress", tone: "warning", weight: 0.48 },
    ],
  },
  {
    id: "highway",
    title: "New Highway",
    category: "Infrastructure",
    chain: [
      { label: "Travel Time ↓", tone: "positive", weight: 0.7 },
      { label: "Sprawl Growth", tone: "warning", weight: 0.62 },
      { label: "Emissions Rise", tone: "negative", weight: 0.58 },
      { label: "Habitat Loss", tone: "negative", weight: 0.45 },
    ],
  },
];

export const toneColor: Record<NonNullable<ConsequenceLevel["tone"]>, string> = {
  positive: "var(--positive)",
  warning: "var(--warning)",
  negative: "var(--negative)",
  neutral: "var(--ink-muted)",
};