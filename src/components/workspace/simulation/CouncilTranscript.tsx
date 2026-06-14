"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRunState } from "@/types/simulation";

const DWELL_COMPLETE_MS = 2800;
const DWELL_FAILED_MS = 1500;

const cardMotion = {
  initial: { opacity: 0, x: 48, scale: 0.94, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 340, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.92,
    filter: "blur(8px)",
    transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const cardMotionReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function useCouncilStage(agentRuns: AgentRunState[]) {
  const [stageIdx, setStageIdx] = useState(0);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stageRun = agentRuns[stageIdx];
  const stageStatus = stageRun?.status;
  const stageRunId = stageRun?.id;

  const clearDwell = useCallback(() => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
  }, []);

  useEffect(() => {
    clearDwell();
    if (stageStatus !== "completed" && stageStatus !== "failed") return;
    if (stageIdx >= agentRuns.length - 1) return;

    dwellTimer.current = setTimeout(
      () => setStageIdx((i) => Math.min(i + 1, agentRuns.length - 1)),
      stageStatus === "completed" ? DWELL_COMPLETE_MS : DWELL_FAILED_MS,
    );

    return clearDwell;
  }, [stageStatus, stageRunId, stageIdx, agentRuns.length, clearDwell]);

  useEffect(() => {
    setStageIdx(0);
  }, [agentRuns.length]);

  return { stageIdx, setStageIdx };
}

function AgentTurnCard({
  run,
  reduced,
}: {
  run: AgentRunState;
  reduced: boolean;
}) {
  const visual = AGENT_VISUALS[run.id];
  const Icon = visual.icon;
  const isRunning = run.status === "running";
  const isComplete = run.status === "completed";
  const isFailed = run.status === "failed";
  const isCdo = run.id === "chiefDecisionOfficer";
  const latestFinding = run.findings[run.findings.length - 1];
  const cardVariants = reduced ? cardMotionReduced : cardMotion;

  return (
    <motion.article
      key={run.id}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_12px_40px_oklch(0.18_0.045_264/0.08)]"
      style={{
        boxShadow: `0 12px 48px color-mix(in oklab, ${visual.color} 12%, transparent), 0 4px 24px oklch(0.18 0.045 264 / 0.06)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: visual.glow }}
      />
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${visual.color}, transparent)`,
        }}
      />

      <header className="relative flex items-start gap-3 border-b border-hairline/80 px-5 py-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{
            background: `color-mix(in oklab, ${visual.color} 18%, white)`,
            color: visual.color,
            boxShadow: isRunning ? `0 0 20px ${visual.glow}` : undefined,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono-data text-[9px] uppercase tracking-[0.22em] text-ink-muted">
            {visual.role}
          </p>
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {visual.shortLabel}
            {isCdo && (
              <span className="ml-2 rounded-full bg-signal/10 px-2 py-0.5 font-mono-data text-[8px] font-normal uppercase tracking-wider text-signal">
                Verdict
              </span>
            )}
          </h3>
        </div>
        {isRunning && (
          <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-signal" aria-hidden />
        )}
        {isComplete && run.result && (
          <div className="shrink-0 rounded-lg border border-hairline bg-background px-2.5 py-1.5 text-right">
            <p className="font-mono-data text-[8px] uppercase tracking-wider text-ink-muted">
              Impact
            </p>
            <p className="font-display text-lg font-bold tabular-nums text-signal">
              {run.result.impactScore}
            </p>
          </div>
        )}
      </header>

      <div className="relative flex flex-1 flex-col justify-center px-5 py-6">
        {isRunning && !latestFinding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-signal/50"
                  animate={reduced ? {} : { opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="font-display text-sm italic text-ink-muted">Deliberating…</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {latestFinding && (
            <motion.blockquote
              key={latestFinding.slice(0, 48)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <span
                className="pointer-events-none absolute -left-1 -top-4 font-display text-5xl leading-none opacity-[0.12]"
                style={{ color: visual.color }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative text-[15px] leading-relaxed text-ink line-clamp-6">
                {latestFinding}
              </p>
            </motion.blockquote>
          )}
        </AnimatePresence>

        {isComplete && run.result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-5 space-y-3 border-t border-hairline/80 pt-4"
          >
            <p className="text-sm leading-relaxed text-ink line-clamp-4">{run.result.summary}</p>
            <div className="flex flex-wrap gap-2">
              {run.result.risks[0] && (
                <span className="max-w-full rounded-lg border border-negative/20 bg-negative/5 px-2.5 py-1.5 text-[11px] leading-snug text-negative line-clamp-2">
                  <span className="font-medium">Risk · </span>
                  {run.result.risks[0]}
                </span>
              )}
              {run.result.opportunities[0] && (
                <span className="max-w-full rounded-lg border border-positive/20 bg-positive/5 px-2.5 py-1.5 text-[11px] leading-snug text-positive line-clamp-2">
                  <span className="font-medium">Upside · </span>
                  {run.result.opportunities[0]}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {isFailed && (
          <p className="text-sm text-negative">Could not complete — council continues.</p>
        )}

        {run.status === "queued" && (
          <p className="font-display text-sm text-ink-muted/70">Awaiting turn…</p>
        )}
      </div>

      {isComplete && (
        <footer className="border-t border-hairline/60 px-5 py-2.5">
          <p className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-ink-muted/70">
            Glimpse · next specialist incoming
          </p>
        </footer>
      )}
    </motion.article>
  );
}

function StageRail({
  agentRuns,
  stageIdx,
  onSelect,
}: {
  agentRuns: AgentRunState[];
  stageIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      {agentRuns.map((run, i) => {
        const visual = AGENT_VISUALS[run.id];
        const spoken = run.status === "completed" || run.status === "failed";
        const isCurrent = i === stageIdx;
        const isRunning = run.status === "running";

        return (
          <button
            key={run.id}
            type="button"
            onClick={() => onSelect(i)}
            title={visual.shortLabel}
            className={cn(
              "relative h-2 rounded-full transition-all duration-300",
              isCurrent ? "w-6 bg-signal" : spoken ? "w-2 opacity-80" : "w-2 bg-hairline",
            )}
            style={
              !isCurrent && spoken
                ? { backgroundColor: visual.color }
                : isRunning && !isCurrent
                  ? { backgroundColor: visual.color, opacity: 0.45 }
                  : undefined
            }
          />
        );
      })}
    </div>
  );
}

export function CouncilTranscript() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const reduced = usePrefersReducedMotion();
  const { stageIdx, setStageIdx } = useCouncilStage(agentRuns);
  const currentRun = agentRuns[stageIdx];
  const isStreaming = agentRuns.some((r) => r.status === "running");
  const hasStarted = agentRuns.some(
    (r) => r.status !== "queued" || r.findings.length > 0,
  );

  return (
    <div className="flex h-full min-h-[380px] flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            Live council transcript
          </p>
          {currentRun && hasStarted && (
            <p className="mt-0.5 font-mono-data text-[9px] tabular-nums text-ink-muted/80">
              {stageIdx + 1} / {agentRuns.length} · {AGENT_VISUALS[currentRun.id].shortLabel}
            </p>
          )}
        </div>
        {isStreaming && (
          <span className="flex items-center gap-1.5 rounded-full border border-signal/25 bg-signal/8 px-2.5 py-1 font-mono-data text-[9px] uppercase text-signal">
            <span className="relative flex h-2 w-2">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {!hasStarted && (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-background/80 px-6 text-center">
            <motion.div
              animate={reduced ? {} : { scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 h-12 w-12 rounded-full border border-signal/20 bg-signal/10"
            />
            <p className="font-display text-sm text-ink-muted">Council convening…</p>
            <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-ink-muted/70">
              Each specialist speaks in turn — one glimpse at a time
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {hasStarted && currentRun && (
            <AgentTurnCard key={`${currentRun.id}-${stageIdx}`} run={currentRun} reduced={reduced} />
          )}
        </AnimatePresence>
      </div>

      {hasStarted && agentRuns.length > 1 && (
        <StageRail agentRuns={agentRuns} stageIdx={stageIdx} onSelect={setStageIdx} />
      )}
    </div>
  );
}
