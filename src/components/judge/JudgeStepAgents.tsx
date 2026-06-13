"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { JudgeDemoPack } from "@/lib/judge/types";
import { useJudgeStore } from "@/stores/judge-store";
import { cn } from "@/lib/utils";

export function JudgeStepAgents({ pack }: { pack: JudgeDemoPack }) {
  const visibleAgentIndex = useJudgeStore((s) => s.visibleAgentIndex);
  const visible = pack.agentSequence.slice(0, visibleAgentIndex + 1);

  return (
    <div className="flex flex-1 flex-col px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 2 · Intelligence Analysis
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold">Multi-Agent Pipeline</h2>
      <p className="mt-2 font-mono-data text-[10px] text-white/40">
        {visible.length} of {pack.agentSequence.length} agents complete
      </p>
      <div className="mt-8 max-w-3xl space-y-3">
        <AnimatePresence>
          {visible.map((agent, i) => (
            <motion.div
              key={agent.agentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "border px-4 py-4",
                i === visible.length - 1 ? "border-signal bg-signal/10" : "border-white/10 bg-white/5",
              )}
            >
              <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-signal">
                {agent.label}
              </p>
              <ul className="mt-2 space-y-1">
                {agent.findings.map((f) => (
                  <li key={f} className="text-sm text-white/70">
                    <span className="text-signal/70">→</span> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
