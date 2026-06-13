"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AgentTimeline } from "./AgentTimeline";

export function SimulationTheater() {
  const open = useWorkspaceStore((s) => s.simulationTheaterOpen);
  const systemLog = useWorkspaceStore((s) => s.systemLog);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex bg-ink/95 text-white"
        >
          <div className="flex w-full">
            <div className="hidden w-72 shrink-0 flex-col border-r border-white/10 p-6 lg:flex">
              <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-white/50">
                System activity
              </p>
              <div className="mt-4 flex-1 overflow-y-auto font-mono-data text-[11px] leading-relaxed text-white/60">
                {systemLog.map((line, i) => (
                  <div key={`${line}-${i}`} className="mb-1">
                    <span className="text-signal/70">&gt;</span> {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6 md:p-10">
              <div className="mb-8">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.25em] text-signal">
                  ◢ decision intelligence / mission control
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Running strategic analysis
                </h1>
                <div className="relative mt-4 h-px w-full overflow-hidden bg-white/10">
                  <div className="absolute inset-y-0 w-1/3 animate-dx-scan bg-signal" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <AgentTimeline />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
