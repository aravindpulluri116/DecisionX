"use client";

import { useMemo } from "react";
import {
  getActiveAgentId,
  layoutRoundtableSeats,
  seatSubtitle,
  shortSeatLabel,
} from "@/lib/workspace/agentVisuals";
import { usePrefersReducedMotion } from "@/lib/motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/types/simulation";

const SIZE = 540;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 200;
const SEAT_R = 34;
const CORE_GLOW_R = 70;
const CORE_R = 54;

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function wrapTitle(title: string, maxLine = 18): [string, string?] {
  const words = title.trim().split(/\s+/);
  if (words.join(" ").length <= maxLine) return [words.join(" ")];
  const line1: string[] = [];
  let len = 0;
  for (const w of words) {
    if (len + w.length + 1 > maxLine && line1.length > 0) break;
    line1.push(w);
    len += w.length + 1;
  }
  const rest = words.slice(line1.length).join(" ");
  return [line1.join(" "), rest ? truncate(rest, maxLine) : undefined];
}

export function AgentRoundtable() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const proposalTitle = useWorkspaceStore((s) => s.simulationProposalTitle);
  const proposalLocation = useWorkspaceStore((s) => s.simulationProposalLocation);
  const reduced = usePrefersReducedMotion();

  const activeId = getActiveAgentId(agentRuns);
  const anyRunning = agentRuns.some((a) => a.status === "running");

  const seats = useMemo(
    () => layoutRoundtableSeats(agentRuns, RADIUS, CX, CY),
    [agentRuns],
  );

  const [titleLine1, titleLine2] = useMemo(
    () => wrapTitle(proposalTitle || "Active decision"),
    [proposalTitle],
  );

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-2xl"
      aria-label="Agent council roundtable"
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal-soft)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <circle
        cx={CX}
        cy={CY}
        r={RADIUS + 8}
        fill="none"
        stroke="var(--signal-soft)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      {seats
        .filter(({ run }) => run.status === "completed")
        .map(({ run, x, y, visual }) => (
          <line
            key={`link-${run.id}`}
            x1={x}
            y1={y}
            x2={CX}
            y2={CY}
            stroke={visual.color}
            strokeWidth="1"
            strokeOpacity={0.2}
          />
        ))}

      {activeId &&
        (() => {
          const seat = seats.find((s) => s.run.id === activeId);
          if (!seat || seat.run.status !== "running") return null;
          return (
            <line
              key={`beam-${activeId}`}
              x1={seat.x}
              y1={seat.y}
              x2={CX}
              y2={CY}
              stroke={seat.visual.color}
              strokeWidth="2"
              strokeOpacity={0.55}
              className={cn(!reduced && "animate-dx-beam")}
            />
          );
        })()}

      <circle cx={CX} cy={CY} r={CORE_GLOW_R} fill="url(#coreGlow)" />
      <circle
        cx={CX}
        cy={CY}
        r={CORE_R}
        fill="var(--surface)"
        stroke="var(--signal)"
        strokeWidth="2"
        className={cn(anyRunning && !reduced && "animate-dx-pulse")}
        style={{ filter: "drop-shadow(0 2px 12px var(--signal-soft))" }}
      />
      <text
        x={CX}
        y={titleLine2 ? CY - 18 : CY - 6}
        textAnchor="middle"
        fill="var(--signal)"
        fontSize="10"
        fontFamily="var(--font-mono)"
        letterSpacing="0.12em"
      >
        PROPOSAL
      </text>
      <text
        x={CX}
        y={titleLine2 ? CY + 4 : CY + 14}
        textAnchor="middle"
        fill="var(--ink)"
        fontSize="11"
        fontFamily="var(--font-display)"
        fontWeight="600"
      >
        {titleLine1}
      </text>
      {titleLine2 && (
        <text
          x={CX}
          y={CY + 20}
          textAnchor="middle"
          fill="var(--ink-muted)"
          fontSize="10"
          fontFamily="var(--font-display)"
        >
          {titleLine2}
        </text>
      )}
      {proposalLocation && (
        <text
          x={CX}
          y={CY + (titleLine2 ? 34 : 28)}
          textAnchor="middle"
          fill="var(--ink-muted)"
          fontSize="8"
          fontFamily="var(--font-mono)"
        >
          {truncate(proposalLocation, 36)}
        </text>
      )}

      {seats.map(({ run, visual, x, y, isCdo }) => {
        const status = (run.status ?? "queued") as AgentStatus;
        const isActive = activeId === run.id && status === "running";
        const subtitle = seatSubtitle(run);

        return (
          <AgentSeat
            key={run.id}
            x={x}
            y={y}
            visual={visual}
            status={status}
            isActive={isActive}
            isCdo={isCdo}
            reduced={reduced}
            label={shortSeatLabel(run)}
            subtitle={subtitle}
            findingsCount={run.findings.length}
          />
        );
      })}
    </svg>
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
  label,
  subtitle,
  findingsCount,
}: {
  x: number;
  y: number;
  visual: ReturnType<typeof layoutRoundtableSeats>[number]["visual"];
  status: AgentStatus;
  isActive: boolean;
  isCdo: boolean;
  reduced: boolean;
  label: string;
  subtitle: string | null;
  findingsCount: number;
}) {
  const opacity = status === "queued" ? 0.45 : 1;
  const r = isCdo ? SEAT_R + 5 : SEAT_R;
  const labelY = subtitle ? r + 14 : r + 16;
  const metaY = subtitle ? r + 28 : r + 30;

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
        fill="var(--surface)"
        stroke={visual.color}
        strokeWidth={isActive ? 2.5 : 1.5}
        style={{
          filter: isActive
            ? `drop-shadow(0 0 10px ${visual.glow})`
            : "drop-shadow(0 1px 4px var(--shadow-elevated))",
        }}
      />
      <circle r="8" fill={visual.color} cy={-2} />
      {status === "completed" && (
        <g transform={`translate(${r - 5}, ${-r + 5})`}>
          <circle r="10" fill="var(--positive)" />
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
        y={labelY}
        textAnchor="middle"
        fill="var(--ink)"
        fontSize="10"
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
      >
        {label.toUpperCase()}
      </text>
      {subtitle && (
        <text
          y={r + 26}
          textAnchor="middle"
          fill="var(--ink-muted)"
          fontSize="8"
          fontFamily="var(--font-mono)"
        >
          {truncate(subtitle, 30)}
        </text>
      )}
      {findingsCount > 0 && status !== "queued" && (
        <text
          y={metaY + (subtitle ? 10 : 0)}
          textAnchor="middle"
          fill={visual.color}
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {findingsCount} opinion{findingsCount !== 1 ? "s" : ""}
        </text>
      )}
      {status === "queued" && findingsCount === 0 && (
        <text
          y={metaY + (subtitle ? 10 : 0)}
          textAnchor="middle"
          fill="var(--ink-muted)"
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          waiting
        </text>
      )}
    </g>
  );
}
