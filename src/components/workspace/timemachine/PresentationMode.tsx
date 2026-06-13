"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTimeMachine } from "@/hooks/useTimeMachine";
import { useTimelineScrub } from "@/hooks/useTimelineScrub";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usePrefersReducedMotion } from "@/lib/motion";

type PresentationModeProps = {
  open: boolean;
  onClose: () => void;
};

export function PresentationMode({ open, onClose }: PresentationModeProps) {
  const { trajectory, snapshot } = useTimeMachine();
  const milestone = useWorkspaceStore((s) => s.timeMachineMilestone);
  const setMilestone = useWorkspaceStore((s) => s.setTimeMachineMilestone);
  const autoPlay = useWorkspaceStore((s) => s.timeMachineAutoPlay);
  const setAutoPlay = useWorkspaceStore((s) => s.setTimeMachineAutoPlay);
  const reduced = usePrefersReducedMotion();
  const { next, prev, milestones } = useTimelineScrub(milestone, setMilestone);

  useEffect(() => {
    if (!open || !autoPlay || reduced) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [open, autoPlay, reduced, next]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setAutoPlay(!autoPlay);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, onClose, autoPlay, setAutoPlay]);

  if (!open || !trajectory || !snapshot) return null;

  const headline = trajectory.headlines.find((h) => h.year <= snapshot.calendarYear)?.title;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex flex-col bg-ink text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-4">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-signal">
            Decision Time Machine · Presentation
          </p>
          <button type="button" onClick={onClose} className="p-2 text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <motion.p
            key={snapshot.calendarYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono-data text-sm uppercase tracking-[0.3em] text-white/50"
          >
            {snapshot.calendarYear}
          </motion.p>
          <motion.h1
            key={headline ?? snapshot.milestone}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl font-display text-4xl font-bold md:text-5xl"
          >
            {headline ?? `Future state · ${snapshot.politicalViability} viability`}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 font-mono-data text-lg text-white/70"
          >
            Support {snapshot.sentiment.supportPct}% · Infrastructure {snapshot.infrastructure} ·
            Employment {snapshot.economic.employment}
          </motion.p>
        </div>

        <div className="flex justify-center gap-4 border-t border-white/10 py-6 font-mono-data text-[10px] uppercase text-white/40">
          {milestones.map((m) => (
            <span key={m} className={milestone === m ? "text-signal" : ""}>
              {trajectory.calendarYears[m]}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
