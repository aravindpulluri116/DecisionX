"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decisions, toneColor } from "@/lib/mock/decisions";
import { SectionLabel } from "@/components/site/SectionLabel";

export function SectionRippleEffect() {
  const [activeId, setActiveId] = useState(decisions[0].id);
  const active = decisions.find((d) => d.id === activeId)!;

  return (
    <section className="relative border-b border-hairline bg-surface">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.52_0.22_262/0.03)_0%,transparent_40%)]" />
      <div className="relative mx-auto max-w-[1400px] px-6 py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <SectionLabel index="02" title="The ripple effect" />
            <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
              Choose a decision.<br />
              <span className="text-ink-muted">Watch it propagate.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-ink-muted">
              Each scenario emits a chain of consequences across stakeholders and time. Hover any node for the
              factors behind it.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
              {decisions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveId(d.id)}
                  className={`group flex flex-col items-start gap-1 px-4 py-3.5 text-left transition-all ${
                    d.id === activeId
                      ? "bg-ink text-background shadow-inner"
                      : "bg-surface hover:bg-signal/5"
                  }`}
                >
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] opacity-70">
                    {d.category}
                  </span>
                  <span className="font-display text-sm font-semibold">{d.title}</span>
                </button>
              ))}
            </div>
          </div>

          <RippleGraph key={activeId} chain={active.chain} title={active.title} />
        </div>
      </div>
    </section>
  );
}

function RippleGraph({
  chain,
  title,
}: {
  chain: typeof decisions[number]["chain"];
  title: string;
}) {
  const W = 760;
  const H = 480;
  const cx = 140;
  const cy = H / 2;
  const colStep = (W - cx - 60) / chain.length;

  const points = chain.map((c, i) => {
    const yOffset = (i % 2 === 0 ? -1 : 1) * 70 + (i - chain.length / 2) * 10;
    return { x: cx + colStep * (i + 1), y: cy + yOffset, ...c };
  });

  return (
    <div className="relative aspect-[760/480] w-full overflow-hidden rounded-xl border border-hairline bg-background shadow-[0_8px_32px_oklch(0.18_0.045_264/0.06)]">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="absolute left-4 top-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        ◢ consequence chain · {title}
      </div>
      <div className="absolute right-4 top-4 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        T+0 → T+36m
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
        {/* connector lines */}
        {points.map((p, i) => {
          const prev = i === 0 ? { x: cx, y: cy } : points[i - 1];
          const d = `M ${prev.x} ${prev.y} C ${(prev.x + p.x) / 2} ${prev.y}, ${(prev.x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`;
          return (
            <motion.path
              key={`l-${i}`}
              d={d}
              fill="none"
              stroke="var(--ink)"
              strokeOpacity={0.25}
              strokeWidth={1}
              strokeDasharray="3 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: i * 0.18 + 0.2 }}
            />
          );
        })}

        {/* seed */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r={28} fill="var(--ink)" />
          <circle cx={cx} cy={cy} r={28} fill="none" stroke="var(--signal)" strokeOpacity={0.4}>
            <animate attributeName="r" values="28;60;28" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="10" fontFamily="JetBrains Mono">
            SEED
          </text>
        </motion.g>

        {/* consequence nodes */}
        {points.map((p, i) => (
          <ConsequenceNode key={`n-${i}`} {...p} index={i} />
        ))}
      </svg>
    </div>
  );
}

function ConsequenceNode({
  x,
  y,
  label,
  tone,
  weight,
  index,
}: {
  x: number;
  y: number;
  label: string;
  tone?: keyof typeof toneColor;
  weight?: number;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const color = toneColor[tone ?? "neutral"];
  const r = 10 + (weight ?? 0.5) * 8;

  return (
    <motion.g
      initial={{ opacity: 0, y: y + 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 + index * 0.18 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer" }}
    >
      <circle cx={x} cy={y} r={r + 8} fill={color} opacity={hover ? 0.18 : 0.08} />
      <circle cx={x} cy={y} r={r} fill={color} />
      <line x1={x + r + 4} y1={y} x2={x + r + 24} y2={y} stroke="var(--ink)" strokeOpacity={0.4} />
      <foreignObject x={x + r + 28} y={y - 28} width={180} height={70}>
        <div className="font-display text-[12px] font-medium leading-tight text-ink">{label}</div>
        <div className="mt-1 font-mono-data text-[9px] uppercase tracking-[0.15em] text-ink-muted">
          L{index + 1} · w {(weight ?? 0).toFixed(2)}
        </div>
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 font-mono-data text-[9px] text-ink-muted"
            >
              factors: history · cohort · elasticity
            </motion.div>
          )}
        </AnimatePresence>
      </foreignObject>
    </motion.g>
  );
}