"use client";

import { motion } from "framer-motion";
import type { JudgeDemoPack } from "@/lib/judge/types";

export function JudgeStepRecommendation({ pack }: { pack: JudgeDemoPack }) {
  const rec = pack.recommendation;

  return (
    <div className="flex flex-1 flex-col items-center px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 6 · Final Recommendation
      </p>
      <motion.p
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-6 font-display text-7xl font-bold text-signal md:text-8xl"
      >
        {rec.viabilityScore}
      </motion.p>
      <p className="font-mono-data text-[10px] uppercase text-white/40">Decision Viability Score</p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 max-w-2xl text-center text-lg text-white/70"
      >
        {rec.executiveSummary}
      </motion.p>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <Column title="Key Risks" items={rec.keyRisks} delay={0.3} />
        <Column title="Key Opportunities" items={rec.keyOpportunities} delay={0.4} />
        <Column title="Suggested Mitigations" items={rec.mitigations} delay={0.5} />
        <div className="border border-white/10 p-4">
          <p className="font-mono-data text-[10px] uppercase text-white/40">Recommended Alternative</p>
          <p className="mt-2 text-sm">{rec.alternativeScenario}</p>
        </div>
      </div>
    </div>
  );
}

function Column({ title, items, delay }: { title: string; items: string[]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-white/10 p-4"
    >
      <p className="font-mono-data text-[10px] uppercase text-white/40">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-white/70">
            → {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
