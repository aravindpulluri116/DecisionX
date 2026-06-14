"use client";

import { motion } from "framer-motion";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

type AgentTimelineProps = {
  compact?: boolean;
};

export function AgentTimeline({ compact = false }: AgentTimelineProps) {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const completedCount = agentRuns.filter((a) => a.status === "completed").length;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {agentRuns.map((agent) => {
          const visual = AGENT_VISUALS[agent.id];
          return (
            <div
              key={agent.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-data text-[9px] uppercase",
                agent.status === "running" && "border-signal/40 bg-signal/10 text-signal",
                agent.status === "completed" && "border-positive/40 bg-positive/10 text-positive",
                agent.status === "failed" && "border-negative/40 bg-negative/10 text-negative",
                agent.status === "queued" && "border-hairline bg-background text-ink-muted",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: visual.color }}
              />
              {visual.shortLabel}
            </div>
          );
        })}
        <p className="w-full font-mono-data text-[9px] text-ink-muted">
          {completedCount}/{agentRuns.length} complete
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
        {completedCount} of {agentRuns.length} agents complete
      </p>
      {agentRuns.map((agent, i) => {
        const visual = AGENT_VISUALS[agent.id];
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "rounded-lg border px-3 py-2 transition-colors",
              agent.status === "running" && "border-signal/30 bg-signal/8",
              agent.status === "completed" && "border-positive/30 bg-positive/5",
              agent.status === "failed" && "border-negative/30 bg-negative/5",
              agent.status === "queued" && "border-hairline bg-background",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-mono-data text-[10px] uppercase text-ink-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: visual.color }}
                />
                {agent.label}
              </span>
              <span
                className={cn(
                  "font-mono-data text-[9px] uppercase",
                  agent.status === "completed" && "text-positive",
                  agent.status === "running" && "text-signal",
                  agent.status === "failed" && "text-negative",
                  agent.status === "queued" && "text-ink-muted/60",
                )}
              >
                {agent.status}
              </span>
            </div>
            {agent.findings[0] && (
              <p className="mt-1.5 line-clamp-2 text-xs text-ink-muted">
                &ldquo;{agent.findings[agent.findings.length - 1]}&rdquo;
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
