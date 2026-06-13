"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { JUDGE_DEMO_PACKS } from "@/lib/judge/demo-packs";

const SCENARIO_CARDS = [
  { id: "metro", icon: "◈" },
  { id: "industrial", icon: "◆" },
  { id: "flyover", icon: "◇" },
] as const;

type JudgeEntryScreenProps = {
  onStart: (packId: string) => void;
};

export function JudgeEntryScreen({ onStart }: JudgeEntryScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-3xl text-center"
      >
        <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">Judge Mode</p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
          Welcome to DecisionX
        </h1>
        <p className="mt-4 text-lg text-white/60">
          Measure the impact before making the decision.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-3"
      >
        {SCENARIO_CARDS.map(({ id, icon }, i) => {
          const pack = JUDGE_DEMO_PACKS[id];
          return (
            <motion.button
              key={id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => onStart(id)}
              className="group border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition-colors hover:border-signal hover:bg-signal/10"
            >
              <span className="font-mono-data text-2xl text-signal">{icon}</span>
              <h2 className="mt-4 font-display text-xl font-semibold">{pack.title}</h2>
              <p className="mt-2 text-sm text-white/50">{pack.tagline}</p>
              <p className="mt-4 font-mono-data text-[10px] uppercase text-white/30">~2.5 min demo</p>
            </motion.button>
          );
        })}
      </motion.div>

      <Link
        href="/"
        className="relative z-10 mt-12 font-mono-data text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60"
      >
        ← Back to site
      </Link>
    </div>
  );
}
