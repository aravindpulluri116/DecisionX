"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_ORDER } from "@/agents";
import { AGENT_VISUALS, seatPosition } from "@/lib/workspace/agentVisuals";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { AgentId } from "@/types/simulation";

const SIZE = 440;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 158;
const SEAT_R = 30;

type Props = {
  activeId?: AgentId | null;
  onSelect?: (id: AgentId) => void;
  className?: string;
};

export function AgentCouncilDiagram({ activeId, onSelect, className = "" }: Props) {
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = useState<AgentId | null>(null);
  const focusId = activeId ?? hovered ?? "chiefDecisionOfficer";

  return (
    <div className={`relative mx-auto w-full max-w-[460px] ${className}`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full"
        aria-label="DecisionX agent council"
        role="img"
      >
        <defs>
          <radialGradient id="councilCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.52 0.22 262 / 0.22)" />
            <stop offset="100%" stopColor="oklch(0.52 0.22 262 / 0)" />
          </radialGradient>
          <filter id="seatGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 42}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth="1"
          className={reduced ? undefined : "animate-dx-glow"}
        />
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 10}
          fill="none"
          stroke="oklch(0.52 0.22 262 / 0.2)"
          strokeWidth="1"
          strokeDasharray="5 10"
        />

        {AGENT_ORDER.map((id) => {
          const visual = AGENT_VISUALS[id];
          const seat = seatPosition(visual.angleDeg, RADIUS, CX, CY);
          const isFocus = focusId === id;
          const isCdo = id === "chiefDecisionOfficer";

          return (
            <g key={id}>
              {isFocus && !isCdo && (
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  x1={seat.x}
                  y1={seat.y}
                  x2={CX}
                  y2={CY}
                  stroke={visual.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
              )}
              <g
                transform={`translate(${seat.x}, ${seat.y})`}
                className={onSelect ? "cursor-pointer" : undefined}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(id)}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onSelect && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect(id);
                  }
                }}
              >
                <circle
                  r={SEAT_R + (isFocus ? 6 : 0)}
                  fill={visual.glow}
                  opacity={isFocus ? 0.55 : 0.2}
                  className="transition-all duration-500"
                />
                <circle
                  r={SEAT_R}
                  fill="var(--surface)"
                  stroke={isFocus ? visual.color : "var(--hairline)"}
                  strokeWidth={isFocus ? 2 : 1}
                  filter={isFocus ? "url(#seatGlow)" : undefined}
                  className="transition-all duration-300"
                />
                <foreignObject x={-14} y={-14} width={28} height={28}>
                  <div className="flex h-full w-full items-center justify-center">
                    <visual.icon
                      className="h-4 w-4"
                      style={{ color: isFocus ? visual.color : "var(--ink-muted)" }}
                      strokeWidth={1.75}
                    />
                  </div>
                </foreignObject>
              </g>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={52} fill="url(#councilCore)" />
        <circle
          cx={CX}
          cy={CY}
          r={44}
          fill="var(--surface)"
          stroke="oklch(0.52 0.22 262 / 0.45)"
          strokeWidth="1.5"
        />
        <foreignObject x={CX - 20} y={CY - 20} width={40} height={40}>
          <div className="flex h-full w-full items-center justify-center">
            <AGENT_VISUALS.chiefDecisionOfficer.icon
              className="h-6 w-6 text-signal"
              strokeWidth={1.75}
            />
          </div>
        </foreignObject>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={focusId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 left-1/2 w-[min(100%,280px)] -translate-x-1/2 rounded-xl border border-hairline bg-surface/95 px-4 py-3 text-center shadow-elevated backdrop-blur-md"
        >
          <div
            className="font-mono-data text-[10px] uppercase tracking-[0.2em]"
            style={{ color: AGENT_VISUALS[focusId].color }}
          >
            {AGENT_VISUALS[focusId].shortLabel}
          </div>
          <div className="mt-1 font-display text-sm font-semibold text-ink">
            {AGENT_VISUALS[focusId].role}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
