"use client";

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function SimulationDock() {
  const inProgress = useWorkspaceStore((s) => s.simulationInProgress);
  const theaterOpen = useWorkspaceStore((s) => s.simulationTheaterOpen);
  const title = useWorkspaceStore((s) => s.simulationProposalTitle);
  const projectSlug = useWorkspaceStore((s) => s.simulationProjectSlug);
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const setSimulationTheaterOpen = useWorkspaceStore((s) => s.setSimulationTheaterOpen);

  const completed = agentRuns.filter(
    (a) => a.status === "completed" || a.status === "failed",
  ).length;
  const total = agentRuns.length;
  const running = agentRuns.find((a) => a.status === "running");

  const visible = inProgress && !theaterOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4"
        >
          <div className="pointer-events-auto flex max-w-lg flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface/95 px-4 py-3 shadow-[0_12px_40px_oklch(0.18_0.045_264/0.12)] backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-signal">
                Council running in background
              </p>
              <p className="truncate font-display text-sm font-semibold text-ink">
                {title || "Simulation"}
              </p>
              <p className="text-xs text-ink-muted">
                {running
                  ? `${running.label.replace(" Agent", "")} deliberating…`
                  : `${completed}/${total} agents complete`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {projectSlug && (
                <Link
                  href={`/workspace/${projectSlug}`}
                  className="rounded-lg border border-hairline px-2.5 py-1.5 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:border-signal/30 hover:text-signal"
                >
                  Open project
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSimulationTheaterOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-110"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Expand
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
