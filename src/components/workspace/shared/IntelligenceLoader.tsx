"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Building Impact Model...",
  "Analyzing Stakeholders...",
  "Generating Consequence Graph...",
  "Calibrating Confidence Intervals...",
];

/** Shown while heavy workspace panels load (dynamic import fallback). */
export function IntelligenceLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  const message = MESSAGES[idx];

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/92 backdrop-blur-md">
      <div className="relative w-72 overflow-hidden rounded-xl border border-hairline bg-surface p-7 shadow-[0_16px_48px_oklch(0.18_0.045_264/0.1)] glow-signal">
        <div className="absolute inset-x-0 top-0 h-0.5 animate-dx-scan bg-gradient-to-r from-transparent via-signal to-transparent" />
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Intelligence engine
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-3 font-display text-lg font-semibold text-ink"
          >
            {message}
          </motion.p>
        </AnimatePresence>
        <div className="mt-4 h-1 w-full overflow-hidden bg-hairline">
          <motion.div
            className="h-full bg-signal"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
