"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AGENT_ORDER } from "@/agents";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function CouncilTranscript() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runById = Object.fromEntries(agentRuns.map((r) => [r.id, r]));

  const hasContent = agentRuns.some(
    (r) => r.status !== "queued" || r.findings.length > 0,
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [agentRuns]);

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Live council transcript
        </p>
        {agentRuns.some((r) => r.status === "running") && (
          <span className="flex items-center gap-1.5 font-mono-data text-[9px] uppercase text-signal">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            Streaming
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {!hasContent && (
          <div className="rounded-xl border border-dashed border-hairline bg-background px-4 py-8 text-center">
            <p className="font-display text-sm text-ink-muted">Council convening…</p>
            <p className="mt-1 text-xs text-ink-muted/70">Agent responses will appear here as they arrive</p>
          </div>
        )}

        {AGENT_ORDER.map((agentId) => {
          const run = runById[agentId];
          if (!run) return null;

          const visual = AGENT_VISUALS[agentId];
          const accent = visual.color;
          const isRunning = run.status === "running";
          const isComplete = run.status === "completed";
          const isFailed = run.status === "failed";
          const hasAgentContent =
            isRunning || isComplete || isFailed || run.findings.length > 0;

          if (!hasAgentContent) return null;

          return (
            <section key={agentId} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
                  {visual.role}
                </span>
                {isRunning && (
                  <Loader2 className="h-3 w-3 animate-spin text-signal" aria-hidden />
                )}
                {isComplete && run.result && (
                  <span className="ml-auto font-mono-data text-[9px] tabular-nums text-signal">
                    Impact {run.result.impactScore} · {run.result.confidence}% conf.
                  </span>
                )}
              </div>

              {isRunning && run.findings.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-signal/20 bg-signal/5 px-3 py-2 text-xs italic text-ink-muted"
                >
                  Deliberating…
                </motion.p>
              )}

              <AnimatePresence initial={false}>
                {run.findings.map((finding, i) => (
                  <motion.div
                    key={`${agentId}-f-${i}-${finding.slice(0, 24)}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-hairline bg-surface p-3 shadow-sm"
                    style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
                  >
                    <p className="text-sm leading-relaxed text-ink">&ldquo;{finding}&rdquo;</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isComplete && run.result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl border p-3",
                    agentId === "chiefDecisionOfficer"
                      ? "border-signal/30 bg-signal/8"
                      : "border-hairline bg-background/80",
                  )}
                >
                  <p className="text-sm leading-relaxed text-ink">{run.result.summary}</p>
                  {run.result.risks[0] && (
                    <p className="mt-2 text-xs text-negative">
                      <span className="font-medium">Risk:</span> {run.result.risks[0]}
                    </p>
                  )}
                  {run.result.opportunities[0] && (
                    <p className="mt-1 text-xs text-positive">
                      <span className="font-medium">Opportunity:</span> {run.result.opportunities[0]}
                    </p>
                  )}
                </motion.div>
              )}

              {isFailed && (
                <p className="text-xs text-negative">Agent failed — continuing with partial analysis.</p>
              )}
            </section>
          );
        })}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
