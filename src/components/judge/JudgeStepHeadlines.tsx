"use client";

import { motion } from "framer-motion";
import type { JudgeDemoPack } from "@/lib/judge/types";

export function JudgeStepHeadlines({ pack }: { pack: JudgeDemoPack }) {
  const featured = pack.headlines.filter((h) => h.year >= 2030).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col items-center px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 5 · Future Headlines
      </p>
      <h2 className="mt-4 font-display text-3xl font-bold">The Future, in Headlines</h2>
      <div className="mt-10 w-full max-w-2xl space-y-4">
        {featured.map((h, i) => (
          <motion.article
            key={h.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="border border-white/10 bg-white/5 p-6"
          >
            <p className="font-mono-data text-sm text-signal">{h.year}</p>
            <h3 className="mt-2 font-display text-xl font-semibold">{h.title}</h3>
            <p className="mt-2 text-sm text-white/50">{h.subtitle}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
