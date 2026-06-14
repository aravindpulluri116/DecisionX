"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { OrbPattern } from "@/lib/council/agent-visuals";

type Props = {
  label: string;
  color: string;
  glow: string;
  pattern: OrbPattern;
  x: number;
  y: number;
  isActive: boolean;
  isComplete: boolean;
  isFailed: boolean;
  dimmed: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
};

const PATTERNS: Record<OrbPattern, ReactNode> = {
  rings: (
    <>
      <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="white" strokeOpacity="0.22" strokeWidth="0.6" />
    </>
  ),
  grid: (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1="12" y1={20 + i * 18} x2="88" y2={20 + i * 18} stroke="white" strokeOpacity="0.12" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`v${i}`} x1={20 + i * 18} y1="12" x2={20 + i * 18} y2="88" stroke="white" strokeOpacity="0.12" />
      ))}
    </>
  ),
  waves: (
    <>
      {[32, 44, 56, 68].map((y, i) => (
        <path
          key={i}
          d={`M 12 ${y} Q 35 ${y - 6} 50 ${y} T 88 ${y}`}
          fill="none"
          stroke="white"
          strokeOpacity={0.14 + i * 0.04}
          strokeWidth="0.7"
        />
      ))}
    </>
  ),
  facets: (
    <polygon points="50,14 78,38 68,78 32,78 22,38" fill="none" stroke="white" strokeOpacity="0.2" />
  ),
  meridian: (
    <>
      <ellipse cx="50" cy="50" rx="38" ry="18" fill="none" stroke="white" strokeOpacity="0.15" />
      <ellipse cx="50" cy="50" rx="18" ry="38" fill="none" stroke="white" strokeOpacity="0.15" />
    </>
  ),
  nodes: (
    <>
      <circle cx="35" cy="35" r="4" fill="white" fillOpacity="0.2" />
      <circle cx="65" cy="40" r="3" fill="white" fillOpacity="0.25" />
      <circle cx="50" cy="62" r="5" fill="white" fillOpacity="0.18" />
    </>
  ),
};

export function CouncilAgentOrb({
  label,
  color,
  glow,
  pattern,
  x,
  y,
  isActive,
  isComplete,
  isFailed,
  dimmed,
  size = "md",
  onClick,
}: Props) {
  const base = size === "sm" ? 40 : 56;
  const scale = isActive ? 1.5 : isComplete ? 1.05 : 0.88;
  const opacity = dimmed && !isActive ? 0.35 : 1;

  const Wrapper = onClick ? "button" : "div";

  return (
    <motion.div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%`, opacity }}
      animate={{ scale }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={
          onClick
            ? "group relative border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--council-amber)]"
            : "relative"
        }
        aria-label={label}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            width: isActive ? base * 2.2 : base * 1.4,
            height: isActive ? base * 2.2 : base * 1.4,
            opacity: isActive ? 0.5 : isComplete ? 0.25 : 0.1,
          }}
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: "blur(10px)" }}
        />

        {isActive && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: color }}
            initial={{ width: base, height: base, opacity: 0.6 }}
            animate={{ width: base * 2, height: base * 2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <div
          className="relative overflow-hidden rounded-full shadow-[0_8px_32px_rgba(34,58,52,0.15)]"
          style={{
            width: base,
            height: base,
            background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${color} 85%, white), ${color})`,
            boxShadow: isActive
              ? `0 0 36px ${glow}`
              : isFailed
                ? "0 0 12px rgba(201,90,74,0.4)"
                : "0 4px 16px rgba(34,58,52,0.12)",
          }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {PATTERNS[pattern]}
          </svg>
          {isFailed && (
            <div className="absolute inset-0 bg-[rgba(201,90,74,0.25)]" />
          )}
        </div>

        <div className="pointer-events-none mt-2 text-center">
          <div className="font-display text-[10px] font-medium tracking-tight text-[var(--council-forest)]">
            {label}
          </div>
          {isComplete && !isActive && (
            <div className="text-[8px] uppercase tracking-[0.18em] text-[var(--council-muted)]">
              {isFailed ? "failed" : "delivered"}
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
