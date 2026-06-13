"use client";

import { motion } from "framer-motion";
import { visibleConsequences } from "@/lib/timemachine/consequenceTimeline";
import type { ConsequenceMilestone, TimelineMilestone } from "@/types/timemachine";

type ConsequenceEvolutionViewProps = {
  consequences: ConsequenceMilestone[];
  activeMilestone: TimelineMilestone;
};

export function ConsequenceEvolutionView({ consequences, activeMilestone }: ConsequenceEvolutionViewProps) {
  const visible = visibleConsequences(consequences, activeMilestone);

  return (
    <div className="border-t border-hairline bg-surface p-4">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
        Consequence evolution
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {visible.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2"
          >
            <div className="border border-hairline bg-background px-3 py-2">
              <p className="font-mono-data text-[9px] uppercase text-signal">{c.year}</p>
              <p className="text-sm font-medium">{c.label}</p>
            </div>
            {i < visible.length - 1 && <span className="text-ink-muted">→</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
