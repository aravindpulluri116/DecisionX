import type { AgentId } from "@/types/simulation";

export type OrbPattern = "rings" | "grid" | "waves" | "facets" | "meridian" | "nodes";

export type AgentVisual = {
  color: string;
  glow: string;
  pattern: OrbPattern;
};

/** Premium orb palette — warm intelligence theme, no corporate blue */
export const AGENT_VISUALS: Record<AgentId, AgentVisual> = {
  economic: { color: "#C98C2E", glow: "rgba(201, 140, 46, 0.45)", pattern: "rings" },
  social: { color: "#8B7AA8", glow: "rgba(139, 122, 168, 0.42)", pattern: "facets" },
  environmental: { color: "#7E9A85", glow: "rgba(126, 154, 133, 0.44)", pattern: "waves" },
  stakeholder: { color: "#D97B43", glow: "rgba(217, 123, 67, 0.4)", pattern: "meridian" },
  risk: { color: "#C95A4A", glow: "rgba(201, 90, 74, 0.38)", pattern: "grid" },
  futureShock: { color: "#3D6B8C", glow: "rgba(61, 107, 140, 0.42)", pattern: "nodes" },
  chiefDecisionOfficer: { color: "#223A34", glow: "rgba(34, 58, 52, 0.35)", pattern: "rings" },
};

export function memberPosition(index: number, total: number, radiusPct: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radiusPct,
    y: 50 + Math.sin(angle) * radiusPct,
    angle,
  };
}
