"use client";

import { motion } from "framer-motion";
import type { FutureHeadline } from "@/types/timemachine";
import { cn } from "@/lib/utils";

type FutureNewsModeProps = {
  headlines: FutureHeadline[];
  activeYear?: number;
};

export function FutureNewsMode({ headlines, activeYear }: FutureNewsModeProps) {
  const filtered = activeYear
    ? headlines.filter((h) => h.year <= activeYear)
    : headlines;

  if (!filtered.length) {
    return (
      <div className="p-4 text-xs text-ink-muted">Future headlines appear as the timeline advances.</div>
    );
  }

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">Future headlines</p>
      <div className="mt-3 space-y-2">
        {filtered.slice(-3).map((h) => (
          <motion.article
            key={`${h.year}-${h.title}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-hairline bg-background p-3"
          >
            <p className="font-mono-data text-[9px] uppercase text-signal">{h.year}</p>
            <h4 className="mt-1 text-sm font-semibold">{h.title}</h4>
            <p className={cn("mt-1 text-xs text-ink-muted", h.tone === "negative" && "text-negative")}>
              {h.subtitle}
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
