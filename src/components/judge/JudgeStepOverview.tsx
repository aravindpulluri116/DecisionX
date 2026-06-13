"use client";

import { motion } from "framer-motion";
import type { JudgeDemoPack } from "@/lib/judge/types";

import { formatBudgetCrore } from "@/lib/format/currency";

export function JudgeStepOverview({ pack }: { pack: JudgeDemoPack }) {
  const items = [
    { label: "Budget", value: formatBudgetCrore(pack.overview.budget) },
    { label: "Timeline", value: pack.overview.timeline },
    { label: "Location", value: pack.overview.location },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal"
      >
        Step 1 · Project Overview
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 max-w-3xl text-center font-display text-4xl font-bold md:text-5xl"
      >
        {pack.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 max-w-2xl text-center text-lg text-white/60"
      >
        {pack.overview.description}
      </motion.p>
      <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-[#0A0A0B] px-6 py-8 text-center"
          >
            <p className="font-mono-data text-[10px] uppercase text-white/40">{item.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold">{item.value}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {pack.overview.stakeholders.map((s) => (
          <span key={s} className="border border-white/20 px-3 py-1 font-mono-data text-[10px] uppercase">
            {s}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
