"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AgentId, AgentRunState } from "@/types/simulation";
import { AGENT_VISUALS, memberPosition } from "@/lib/council/agent-visuals";
import {
  affinityStrength,
  computeConfidence,
  computeConsensusLabel,
  orderedAgentRuns,
  activeAgentId,
} from "@/lib/council/chamber-utils";
import { CouncilAgentOrb } from "./CouncilAgentOrb";
import { AgentOpinionPanelPresence } from "./AgentOpinionPanel";

type Props = {
  proposalTitle: string;
  proposalLocation?: string;
  agentRuns: AgentRunState[];
  statusMessage?: string;
  variant?: "theater" | "overlay";
  showSystemLog?: boolean;
  systemLog?: string[];
};

export function CouncilChamber({
  proposalTitle,
  proposalLocation,
  agentRuns,
  statusMessage,
  variant = "theater",
  showSystemLog = false,
  systemLog = [],
}: Props) {
  const [selectedId, setSelectedId] = useState<AgentId | null>(null);
  const ordered = useMemo(() => orderedAgentRuns(agentRuns), [agentRuns]);
  const activeId = activeAgentId(agentRuns, selectedId);
  const activeAgent = ordered.find((a) => a.id === activeId);
  const activeIndex = ordered.findIndex((a) => a.id === activeId);
  const panelSide = activeIndex <= ordered.length / 2 ? "right" : "left";

  const confidence = computeConfidence(agentRuns);
  const consensus = computeConsensusLabel(agentRuns);
  const isAnalyzing = consensus === "ANALYZING...";
  const anyActive = agentRuns.some((a) => a.status === "running");
  const dimChamber = anyActive || selectedId != null;

  const positions = ordered.map((_, i) => memberPosition(i, ordered.length, variant === "overlay" ? 34 : 38));

  const ringRadius = variant === "overlay" ? 72 : 88;
  const circumference = 2 * Math.PI * ringRadius;
  const ringProgress = (confidence / 100) * circumference;

  return (
    <div
      className={
        variant === "theater"
          ? "relative flex h-full min-h-[min(88vh,900px)] w-full flex-col"
          : "relative flex h-full min-h-[280px] w-full items-center justify-center"
      }
    >
      {/* warm ivory atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, color-mix(in oklab, var(--council-surface) 95%, transparent), var(--council-bg))",
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: dimChamber ? "rgba(34, 58, 52, 0.05)" : "rgba(34, 58, 52, 0)" }}
        transition={{ duration: 0.5 }}
      />

      {showSystemLog && systemLog.length > 0 && (
        <div className="absolute bottom-4 left-4 z-30 hidden max-h-28 w-64 overflow-y-auto rounded-2xl council-glass p-3 lg:block">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--council-muted)]">
            System trace
          </p>
          <div className="mt-2 font-mono-data text-[10px] leading-relaxed text-[var(--council-forest)]/70">
            {systemLog.slice(-6).map((line, i) => (
              <div key={`${line}-${i}`} className="mb-0.5">{line}</div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mx-auto h-full w-full max-w-5xl px-4 py-8">
        {variant === "theater" && (
          <header className="relative z-10 mb-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--council-muted)]">
              AI Council Chamber · Deliberation in progress
            </p>
            {statusMessage && (
              <p className="mt-2 font-display text-sm italic text-[var(--council-forest)]/80">
                {statusMessage}
              </p>
            )}
          </header>
        )}

        <div className="relative h-[min(72vh,640px)] w-full">
          {/* connection layer */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {ordered.flatMap((a, i) =>
              ordered.slice(i + 1).map((b) => {
                const pa = positions[i];
                const pb = positions[ordered.indexOf(b)];
                const strength = affinityStrength(a, b);
                return (
                  <line
                    key={`${a.id}-${b.id}`}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke="var(--council-forest)"
                    strokeOpacity={strength}
                    strokeWidth={0.08 + strength * 0.2}
                  />
                );
              }),
            )}
            {ordered.map((agent, i) => {
              const p = positions[i];
              const isActive = agent.id === activeId;
              const visual = AGENT_VISUALS[agent.id];
              const spoke = agent.status === "completed" || agent.status === "failed";
              return (
                <line
                  key={`beam-${agent.id}`}
                  x1={p.x}
                  y1={p.y}
                  x2={50}
                  y2={50}
                  stroke={visual.color}
                  strokeOpacity={isActive ? 0.7 : spoke ? 0.22 : 0.06}
                  strokeWidth={isActive ? 0.35 : 0.12}
                  strokeDasharray={isActive ? "0" : "0.8 1.2"}
                />
              );
            })}
            {[12, 20, 28, 36].map((r) => (
              <circle
                key={r}
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke="var(--council-forest)"
                strokeOpacity={0.05}
                strokeWidth={0.08}
              />
            ))}
          </svg>

          {/* agent orbs */}
          {ordered.map((agent, i) => {
            const p = positions[i];
            const visual = AGENT_VISUALS[agent.id];
            const isActive = agent.id === activeId;
            return (
              <CouncilAgentOrb
                key={agent.id}
                label={agent.label.replace(" Agent", "").replace("Chief Decision Officer", "Chief")}
                color={visual.color}
                glow={visual.glow}
                pattern={visual.pattern}
                x={p.x}
                y={p.y}
                isActive={isActive}
                isComplete={agent.status === "completed"}
                isFailed={agent.status === "failed"}
                dimmed={dimChamber && !isActive}
                size={variant === "overlay" ? "sm" : "md"}
                onClick={() => setSelectedId(isActive && selectedId ? null : agent.id)}
              />
            );
          })}

          {/* proposal nucleus + confidence ring */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <svg
              width={variant === "overlay" ? 180 : 220}
              height={variant === "overlay" ? 180 : 220}
              viewBox="0 0 220 220"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <circle
                cx="110"
                cy="110"
                r={ringRadius}
                fill="none"
                stroke="var(--council-forest)"
                strokeOpacity={0.1}
                strokeWidth="2"
              />
              <motion.circle
                cx="110"
                cy="110"
                r={ringRadius}
                fill="none"
                stroke="var(--council-amber)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${ringProgress} ${circumference}`}
                transform="rotate(-90 110 110)"
                animate={{ strokeDasharray: `${ringProgress} ${circumference}` }}
                transition={{ type: "spring", stiffness: 40, damping: 18 }}
              />
            </svg>

            <motion.div
              className="relative flex flex-col items-center justify-center rounded-full text-center council-glass-strong"
              style={{
                width: variant === "overlay" ? 120 : 148,
                height: variant === "overlay" ? 120 : 148,
              }}
              animate={{
                boxShadow: isAnalyzing
                  ? "0 12px 40px rgba(34,58,52,0.1)"
                  : "0 0 48px rgba(201,140,46,0.2), 0 20px 50px rgba(34,58,52,0.12)",
              }}
            >
              <div className="px-3">
                <div className="text-[8px] uppercase tracking-[0.28em] text-[var(--council-muted)]">
                  Proposal
                </div>
                <div
                  className="mt-1 font-display text-[11px] font-semibold leading-tight tracking-tight text-[var(--council-forest)] sm:text-[13px]"
                >
                  {proposalTitle}
                </div>
                {proposalLocation && (
                  <div className="mt-1 text-[9px] text-[var(--council-muted)]">{proposalLocation}</div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              key={consensus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="rounded-full px-3 py-1 font-display text-[9px] font-medium uppercase tracking-[0.22em]"
                style={{
                  background: isAnalyzing ? "var(--council-surface-soft)" : "var(--council-forest)",
                  color: isAnalyzing ? "var(--council-muted)" : "var(--council-bg)",
                }}
              >
                {consensus}
              </div>
            </motion.div>
          </div>

          <AgentOpinionPanelPresence
            agent={activeAgent ?? null}
            side={panelSide}
            visible={!!activeAgent && (anyActive || selectedId != null)}
          />
        </div>
      </div>
    </div>
  );
}
