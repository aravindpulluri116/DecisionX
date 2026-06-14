"use client";

import { AGENT_ORDER } from "@/agents";
import {
  AGENT_VISUALS,
  getActiveAgentId,
  seatPosition,
} from "@/lib/workspace/agentVisuals";
import { usePrefersReducedMotion } from "@/lib/motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import type { AgentId, AgentStatus } from "@/types/simulation";

const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 148;
const SEAT_R = 28;

const INK = "oklch(0.18 0.045 264)";
const INK_MUTED = "oklch(0.48 0.028 258)";
const SURFACE = "oklch(1 0 0)";
const HAIRLINE = "oklch(0.18 0.045 264 / 0.1)";
const SIGNAL = "oklch(0.52 0.22 262)";

export function AgentRoundtable() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const reduced = usePrefersReducedMotion();
  const activeId = getActiveAgentId(agentRuns);
  const anyRunning = agentRuns.some((a) => a.status === "running");

  const runById = Object.fromEntries(agentRuns.map((r) => [r.id, r]));

  return (
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center py-2">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full max-w-[400px]"
        aria-label="Agent council roundtable"
      >
        <defs>
          <radialGradient id="coreGlowLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.52 0.22 262 / 0.18)" />
            <stop offset="100%" stopColor="oklch(0.52 0.22 262 / 0)" />
          </radialGradient>
        </defs>

        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 36}
          fill="none"
          stroke={HAIRLINE}
          strokeWidth="1"
          className={cn(!reduced && "animate-dx-glow")}
        />
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 8}
          fill="none"
          stroke="oklch(0.52 0.22 262 / 0.25)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {activeId &&
          runById[activeId]?.status === "running" &&
          (() => {
            const visual = AGENT_VISUALS[activeId];
            const seat = seatPosition(visual.angleDeg, RADIUS, CX, CY);
            return (
              <line
                key={`beam-${activeId}`}
                x1={seat.x}
                y1={seat.y}
                x2={CX}
                y2={CY}
                stroke={visual.color}
                strokeWidth="2"
                strokeOpacity={0.55}
                className={cn(!reduced && "animate-dx-beam")}
              />
            );
          })()}

        <circle cx={CX} cy={CY} r={52} fill="url(#coreGlowLight)" />
        <circle
          cx={CX}
          cy={CY}
          r={40}
          fill={SURFACE}
          stroke={SIGNAL}
          strokeWidth="2"
          className={cn(anyRunning && !reduced && "animate-dx-pulse")}
          style={{ filter: "drop-shadow(0 2px 12px oklch(0.52 0.22 262 / 0.2))" }}
        />
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fill={SIGNAL}
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.15em"
        >
          DECISION
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fill={INK}
          fontSize="11"
          fontFamily="var(--font-display)"
          fontWeight="600"
        >
          CORE
        </text>

        {AGENT_ORDER.map((id) => {
          const visual = AGENT_VISUALS[id];
          const run = runById[id];
          const status = (run?.status ?? "queued") as AgentStatus;
          const seat = seatPosition(visual.angleDeg, RADIUS, CX, CY);
          const isActive = activeId === id && status === "running";
          const isCdo = id === "chiefDecisionOfficer";

          return (
            <AgentSeat
              key={id}
              x={seat.x}
              y={seat.y}
              visual={visual}
              status={status}
              isActive={isActive}
              isCdo={isCdo}
              reduced={reduced}
              findingsCount={run?.findings.length ?? 0}
            />
          );
        })}
      </svg>
    </div>
  );
}

function AgentSeat({
  x,
  y,
  visual,
  status,
  isActive,
  isCdo,
  reduced,
  findingsCount,
}: {
  x: number;
  y: number;
  visual: (typeof AGENT_VISUALS)[AgentId];
  status: AgentStatus;
  isActive: boolean;
  isCdo: boolean;
  reduced: boolean;
  findingsCount: number;
}) {
  const opacity = status === "queued" ? 0.45 : status === "failed" ? 1 : 1;
  const r = isCdo ? SEAT_R + 4 : SEAT_R;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {isActive && !reduced && (
        <circle
          r={r + 10}
          fill="none"
          stroke={visual.color}
          strokeWidth="1"
          strokeOpacity={0.35}
          className="animate-dx-ripple"
        />
      )}
      <circle
        r={r}
        fill={SURFACE}
        stroke={visual.color}
        strokeWidth={isActive ? 2.5 : 1.5}
        style={{
          filter: isActive ? `drop-shadow(0 0 10px ${visual.glow})` : "drop-shadow(0 1px 4px oklch(0.18 0.045 264 / 0.08))",
        }}
      />
      <circle r="6" fill={visual.color} cy={-2} />
      {status === "completed" && (
        <g transform={`translate(${r - 4}, ${-r + 4})`}>
          <circle r="8" fill="oklch(0.51 0.15 145)" />
          <path
            d="M -4 0 L -1 3 L 4 -3"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      <text
        y={r + 14}
        textAnchor="middle"
        fill={INK}
        fontSize="8"
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
      >
        {visual.shortLabel.toUpperCase()}
      </text>
      {findingsCount > 0 && status !== "queued" && (
        <text
          y={r + 26}
          textAnchor="middle"
          fill={visual.color}
          fontSize="7"
          fontFamily="var(--font-mono)"
        >
          {findingsCount} opinion{findingsCount !== 1 ? "s" : ""}
        </text>
      )}
      {status === "queued" && (
        <text y={r + 26} textAnchor="middle" fill={INK_MUTED} fontSize="7" fontFamily="var(--font-mono)">
          waiting
        </text>
      )}
    </g>
  );
}
