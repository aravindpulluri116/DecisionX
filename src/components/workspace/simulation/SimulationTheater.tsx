"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AgentRoundtable } from "./AgentRoundtable";
import { CouncilHeader } from "./CouncilHeader";
import { CouncilTranscript } from "./CouncilTranscript";
import { AgentTimeline } from "./AgentTimeline";

function SystemLogPanel() {
  const systemLog = useWorkspaceStore((s) => s.systemLog);

  return (
    <div className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-surface/80 p-5 xl:flex">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        System activity
      </p>
      <div className="mt-4 flex-1 overflow-y-auto font-mono-data text-[10px] leading-relaxed text-ink-muted">
        {systemLog.length === 0 ? (
          <p className="text-ink-muted/50">Orchestrator idle…</p>
        ) : (
          systemLog.map((line, i) => (
            <div key={`${line}-${i}`} className="mb-1.5">
              <span className="text-signal">&gt;</span> {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SimulationTheater() {
  const open = useWorkspaceStore((s) => s.simulationTheaterOpen);
  const setSimulationTheaterOpen = useWorkspaceStore((s) => s.setSimulationTheaterOpen);
  const setWorkspaceTab = useWorkspaceStore((s) => s.setWorkspaceTab);
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const activeSimulation = useWorkspaceStore((s) => s.activeSimulation);

  const isRunning = agentRuns.some((a) => a.status === "running");
  const isComplete =
    activeSimulation?.status === "completed" &&
    !isRunning &&
    agentRuns.some((a) => a.status === "completed");

  const handleViewReport = () => {
    setWorkspaceTab("report");
    setSimulationTheaterOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-background text-ink"
        >
          <div className="mesh-bg pointer-events-none absolute inset-0 opacity-60" />
          <div className="dot-bg pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-hairline bg-surface/90 px-5 py-5 backdrop-blur-md md:px-8">
              <div className="flex items-start justify-between gap-4">
                <CouncilHeader className="min-w-0 flex-1" />
                <button
                  type="button"
                  onClick={() => setSimulationTheaterOpen(false)}
                  className="shrink-0 rounded-lg border border-hairline p-2 text-ink-muted transition-colors hover:bg-background hover:text-ink"
                  aria-label="Close council view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1">
              <SystemLogPanel />

              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 md:flex-row md:gap-4 md:p-6 lg:p-8">
                <div className="flex shrink-0 flex-col items-center justify-center md:flex-1">
                  <div className="rounded-2xl border border-hairline bg-surface/80 p-4 shadow-[0_8px_32px_oklch(0.18_0.045_264/0.06)] glow-signal md:p-6">
                    <AgentRoundtable />
                  </div>
                </div>

                <div className="flex min-h-[320px] w-full shrink-0 flex-col gap-4 md:max-w-md md:flex-1 lg:max-w-lg">
                  <div className="min-h-0 flex-1 md:border-l md:border-hairline md:pl-6">
                    <CouncilTranscript />
                  </div>
                  <div className="hidden border-t border-hairline pt-4 md:block">
                    <p className="mb-2 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
                      Agent status
                    </p>
                    <AgentTimeline compact />
                  </div>
                </div>

                <div className="space-y-4 md:hidden">
                  <div className="border-t border-hairline pt-4">
                    <p className="mb-2 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
                      Agent status
                    </p>
                    <AgentTimeline compact />
                  </div>
                </div>
              </div>
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="shrink-0 border-t border-hairline bg-surface/95 px-5 py-4 backdrop-blur-md md:px-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-muted">
                    Council session complete — transcript preserved below. Review findings or open the
                    full report.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSimulationTheaterOpen(false)}
                      className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-muted hover:text-ink"
                    >
                      Keep reviewing
                    </button>
                    <button
                      type="button"
                      onClick={handleViewReport}
                      className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white"
                    >
                      <FileText className="h-4 w-4" />
                      View report
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
