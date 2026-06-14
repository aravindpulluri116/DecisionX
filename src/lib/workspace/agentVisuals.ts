import {
  Brain,
  Cloud,
  Crown,
  GitBranch,
  Heart,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { AGENT_ORDER } from "@/agents";
import type { AgentId, AgentRunState } from "@/types/simulation";

export type AgentVisual = {
  id: AgentId;
  role: string;
  shortLabel: string;
  color: string;
  glow: string;
  ring: string;
  icon: LucideIcon;
  /** Degrees from top (12 o'clock), clockwise */
  angleDeg: number;
};

const SEAT_COUNT = AGENT_ORDER.length;

export const AGENT_VISUALS: Record<AgentId, AgentVisual> = {
  economic: {
    id: "economic",
    role: "Fiscal impact",
    shortLabel: "Economic",
    color: "oklch(0.75 0.14 75)",
    glow: "oklch(0.75 0.14 75 / 0.45)",
    ring: "oklch(0.75 0.14 75 / 0.35)",
    icon: TrendingUp,
    angleDeg: 0,
  },
  social: {
    id: "social",
    role: "Public sentiment",
    shortLabel: "Social",
    color: "oklch(0.68 0.16 15)",
    glow: "oklch(0.68 0.16 15 / 0.45)",
    ring: "oklch(0.68 0.16 15 / 0.35)",
    icon: Heart,
    angleDeg: 360 / SEAT_COUNT,
  },
  environmental: {
    id: "environmental",
    role: "Ecological cost",
    shortLabel: "Environment",
    color: "oklch(0.72 0.14 155)",
    glow: "oklch(0.72 0.14 155 / 0.45)",
    ring: "oklch(0.72 0.14 155 / 0.35)",
    icon: Cloud,
    angleDeg: (360 / SEAT_COUNT) * 2,
  },
  stakeholder: {
    id: "stakeholder",
    role: "Stakeholder map",
    shortLabel: "Stakeholder",
    color: "oklch(0.65 0.18 295)",
    glow: "oklch(0.65 0.18 295 / 0.45)",
    ring: "oklch(0.65 0.18 295 / 0.35)",
    icon: Brain,
    angleDeg: (360 / SEAT_COUNT) * 3,
  },
  risk: {
    id: "risk",
    role: "Risk matrix",
    shortLabel: "Risk",
    color: "oklch(0.62 0.2 25)",
    glow: "oklch(0.62 0.2 25 / 0.45)",
    ring: "oklch(0.62 0.2 25 / 0.35)",
    icon: ShieldAlert,
    angleDeg: (360 / SEAT_COUNT) * 4,
  },
  futureShock: {
    id: "futureShock",
    role: "Consequence chain",
    shortLabel: "Future shock",
    color: "oklch(0.75 0.12 195)",
    glow: "oklch(0.75 0.12 195 / 0.45)",
    ring: "oklch(0.75 0.12 195 / 0.35)",
    icon: GitBranch,
    angleDeg: (360 / SEAT_COUNT) * 5,
  },
  chiefDecisionOfficer: {
    id: "chiefDecisionOfficer",
    role: "Final verdict",
    shortLabel: "CDO",
    color: "oklch(0.58 0.22 262)",
    glow: "oklch(0.58 0.22 262 / 0.5)",
    ring: "oklch(0.58 0.22 262 / 0.4)",
    icon: Crown,
    angleDeg: (360 / SEAT_COUNT) * 6,
  },
};

export function getAgentVisual(id: AgentId): AgentVisual {
  return AGENT_VISUALS[id];
}

/** First running agent, else last completed, else first queued */
export function getActiveAgentId(runs: AgentRunState[]): AgentId | null {
  const running = runs.find((r) => r.status === "running");
  if (running) return running.id;

  const completed = [...runs].reverse().find((r) => r.status === "completed");
  if (completed) return completed.id;

  const queued = runs.find((r) => r.status === "queued");
  return queued?.id ?? null;
}

export function seatPosition(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}
