"use client";

import { motion, animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import type { JudgeDemoPack } from "@/lib/judge/types";

export function JudgeStepSociety({ pack }: { pack: JudgeDemoPack }) {
  const { society } = pack;
  const count = useMotionValue(0);
  const [displayCount, setDisplayCount] = useState("0");

  useMotionValueEvent(count, "change", (v) => {
    setDisplayCount(Math.round(v).toLocaleString());
  });

  useEffect(() => {
    const controls = animate(count, society.citizenCount, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, society.citizenCount]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 4 · Synthetic Society
      </p>
      <motion.h2 className="mt-4 font-display text-3xl font-bold">Virtual Population</motion.h2>
      <p className="mt-6 font-display text-6xl font-bold tabular-nums text-signal md:text-7xl">
        {displayCount}
      </p>
      <p className="mt-2 font-mono-data text-[10px] uppercase text-white/40">Synthetic citizens simulated</p>

      <div className="mt-12 grid w-full max-w-xl grid-cols-3 gap-px border border-white/10 bg-white/10">
        {[
          { label: "Support", value: society.supportPct, color: "bg-positive" },
          { label: "Opposition", value: society.opposePct, color: "bg-negative" },
          { label: "Undecided", value: society.neutralPct, color: "bg-white/30" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="bg-[#0A0A0B] px-4 py-6 text-center"
          >
            <p className="font-mono-data text-[10px] uppercase text-white/40">{item.label}</p>
            <motion.p
              className="mt-2 font-display text-3xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {item.value}%
            </motion.p>
            <div className="mx-auto mt-3 h-1 w-full max-w-[80px] bg-white/10">
              <motion.div
                className={cnBar(item.color)}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex h-24 w-full max-w-xl items-end justify-center gap-1">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-signal/60"
            initial={{ height: 8 }}
            animate={{ height: 12 + Math.sin(i * 0.5) * 20 + society.supportPct * 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
          />
        ))}
      </div>
    </div>
  );
}

function cnBar(color: string) {
  return `h-full ${color}`;
}
