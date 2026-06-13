"use client";

import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

const CONFIDENCE_STYLES = {
  high: "bg-positive/20 text-positive border-positive/40",
  medium: "bg-warning/20 text-warning border-warning/40",
  low: "bg-negative/20 text-negative border-negative/40",
} as const;

export function AgentTimeline() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const completedCount = agentRuns.filter((a) => a.status === "completed").length;
  const runningCount = agentRuns.filter((a) => a.status === "running").length;

  return (
    <div className="space-y-3">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-white/50">
        {completedCount} of {agentRuns.length} agents complete
        {runningCount > 0 ? ` · ${runningCount} running` : ""}
      </p>
      {agentRuns.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "border px-4 py-3 transition-colors",
            agent.status === "running" && "border-signal bg-signal/10",
            agent.status === "completed" && "border-positive/40 bg-positive/5",
            agent.status === "failed" && "border-negative/50 bg-negative/10",
            agent.status === "queued" && "border-white/10 bg-white/5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-white/60">
              {agent.label}
            </span>
            <div className="flex items-center gap-2">
              {agent.result?.confidenceLevel && (
                <span
                  className={cn(
                    "rounded-none border px-1.5 py-0.5 font-mono-data text-[8px] uppercase",
                    CONFIDENCE_STYLES[agent.result.confidenceLevel],
                  )}
                >
                  {agent.result.confidenceLevel}
                </span>
              )}
              <span
                className={cn(
                  "font-mono-data text-[9px] uppercase",
                  agent.status === "completed" && "text-positive",
                  agent.status === "running" && "text-signal",
                  agent.status === "failed" && "text-negative",
                  agent.status === "queued" && "text-white/40",
                )}
              >
                {agent.status}
              </span>
            </div>
          </div>

          {agent.status === "running" && (
            <div className="mt-2 h-0.5 overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-signal"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
              />
            </div>
          )}

          {agent.findings.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {agent.findings.map((f) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-sm text-white/80"
                >
                  {agent.status === "failed" ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-negative" />
                  ) : (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                  )}
                  {f}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}
    </div>
  );
}
