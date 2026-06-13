"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";

const MESSAGES = [
  "Building Impact Model...",
  "Analyzing Stakeholders...",
  "Generating Consequence Graph...",
  "Calibrating Confidence Intervals...",
];

export function IntelligenceLoader() {
  const loading = useWorkspaceStore((s) => s.loading);
  const loadingMessage = useWorkspaceStore((s) => s.loadingMessage);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, [loading]);

  const message = loadingMessage || MESSAGES[idx];

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <div className="relative w-64 overflow-hidden border border-hairline bg-surface p-6">
            <div className="absolute inset-x-0 top-0 h-px animate-dx-scan bg-signal" />
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
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
