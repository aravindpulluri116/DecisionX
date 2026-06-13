"use client";

import { motion } from "framer-motion";
import { ImpactScoreRadials } from "@/components/workspace/intelligence/ImpactScoreRadials";
import type { JudgeDemoPack } from "@/lib/judge/types";

export function JudgeStepImpact({ pack }: { pack: JudgeDemoPack }) {
  return (
    <div className="flex flex-1 flex-col items-center px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 3 · Impact Dashboard
      </p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 font-display text-3xl font-bold"
      >
        Consequence Intelligence
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 w-full max-w-2xl [&_*]:border-white/10 [&_*]:text-white"
      >
        <ImpactScoreRadials scores={pack.impactScores} />
      </motion.div>
    </div>
  );
}
