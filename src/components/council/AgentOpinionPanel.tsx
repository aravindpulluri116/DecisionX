"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AgentRunState } from "@/types/simulation";
import { AGENT_VISUALS } from "@/lib/council/agent-visuals";

type Props = {
  agent: AgentRunState;
  side: "left" | "right";
};

export function AgentOpinionPanel({ agent, side }: Props) {
  const visual = AGENT_VISUALS[agent.id];
  const benefits = agent.result?.opportunities ?? [];
  const risk = agent.result?.risks?.[0] ?? agent.findings[agent.findings.length - 1] ?? "Evaluating…";

  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 z-40 w-[min(320px,38vw)] -translate-y-1/2"
      style={side === "left" ? { left: "3%" } : { right: "3%" }}
      initial={{ opacity: 0, x: side === "left" ? -32 : 32, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      <div className="council-glass rounded-[24px] p-5 shadow-[var(--council-shadow-soft)]">
        <div
          className="mb-4 h-px w-10"
          style={{ background: `linear-gradient(90deg, ${visual.color}, transparent)` }}
        />
        <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--council-muted)]">
          {agent.label}
        </div>

        {agent.findings.length > 0 && (
          <p className="mt-2 font-display text-[15px] leading-snug text-[var(--council-forest)]">
            {agent.findings[agent.findings.length - 1]}
          </p>
        )}

        {benefits.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--council-sage)]">
              Benefits
            </div>
            <ul className="mt-1.5 space-y-1 text-[12px] leading-snug">
              {benefits.slice(0, 3).map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-[var(--council-sage)]">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--council-terracotta)]">
            Risk
          </div>
          <p className="mt-1 text-[12px] leading-snug text-[var(--council-forest)]/85">{risk}</p>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-[var(--council-border)] pt-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--council-muted)]">
              Confidence
            </div>
            <div
              className="font-display text-3xl tabular-nums tracking-tight"
              style={{ color: visual.color }}
            >
              {agent.result?.confidence ?? "—"}
            </div>
          </div>
          <div
            className="h-10 w-10 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, color-mix(in oklab, ${visual.color} 70%, white), ${visual.color})`,
              boxShadow: `0 0 16px ${visual.glow}`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function AgentOpinionPanelPresence({
  agent,
  side,
  visible,
}: {
  agent: AgentRunState | null;
  side: "left" | "right";
  visible: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {visible && agent ? <AgentOpinionPanel key={agent.id} agent={agent} side={side} /> : null}
    </AnimatePresence>
  );
}
