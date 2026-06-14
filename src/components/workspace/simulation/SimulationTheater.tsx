"use client";

import { AnimatePresence, motion } from "framer-motion";
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
              <CouncilHeader />
            </div>

            <div className="flex min-h-0 flex-1">
              <SystemLogPanel />

              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 md:flex-row md:gap-4 md:p-6 lg:p-8">
                <div className="flex w-full min-w-0 flex-col items-center justify-center md:flex-1">
                  <AgentRoundtable />
                </div>

                <div className="hidden min-h-[320px] w-full shrink-0 md:flex md:max-w-sm md:flex-col md:border-l md:border-hairline md:pl-6 lg:max-w-md">
                  <CouncilTranscript />
                </div>

                <div className="space-y-4 md:hidden">
                  <CouncilTranscript />
                  <div className="border-t border-hairline pt-4">
                    <p className="mb-2 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
                      Agent status
                    </p>
                    <AgentTimeline compact />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
