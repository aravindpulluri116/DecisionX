"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type JudgeClosingCardProps = {
  slug: string;
  onReplay: () => void;
  onPickAnother: () => void;
};

export function JudgeClosingCard({ slug, onReplay, onPickAnother }: JudgeClosingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
    >
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">Demo Complete</p>
      <h2 className="mt-4 max-w-xl font-display text-4xl font-bold">
        See the future before you decide.
      </h2>
      <p className="mt-4 max-w-lg text-white/50">
        DecisionX helps governments and organizations measure economic, social, environmental, and
        stakeholder impacts before implementation.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="border border-signal bg-signal px-6 py-3 font-mono-data text-[10px] uppercase text-white"
        >
          Replay Demo
        </button>
        <button
          type="button"
          onClick={onPickAnother}
          className="border border-white/20 px-6 py-3 font-mono-data text-[10px] uppercase text-white/70 hover:text-white"
        >
          Pick Another Scenario
        </button>
        <Link
          href={`/workspace/${slug}`}
          className="border border-white/20 px-6 py-3 font-mono-data text-[10px] uppercase text-white/70 hover:text-white"
        >
          Open in Workspace
        </Link>
      </div>
    </motion.div>
  );
}
