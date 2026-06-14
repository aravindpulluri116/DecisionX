"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import {
  AGENT_TRANSCRIPT_DWELL_MS,
  agentTranscriptRevision,
  findNextShowableIndex,
  getAgentTranscriptContent,
  isAgentShowable,
} from "@/lib/council/transcript-utils";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRunState } from "@/types/simulation";

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
    transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const cardMotionReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function useCouncilStage(agentRuns: AgentRunState[]) {
  const [stageIdx, setStageIdx] = useState(0);
  const [dwellKey, setDwellKey] = useState(0);
  const userPinnedRef = useRef(false);
  const pinTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const stageRun = agentRuns[stageIdx];
  const revision = agentTranscriptRevision(stageRun);

  useEffect(() => {
    setStageIdx(0);
    setDwellKey(0);
    userPinnedRef.current = false;
  }, [agentRuns.length]);

  // Snap forward if current seat has nothing live yet.
  useEffect(() => {
    if (userPinnedRef.current) return;
    const run = agentRuns[stageIdx];
    if (run && isAgentShowable(run)) return;

    const next = agentRuns.findIndex((r, i) => i >= stageIdx && isAgentShowable(r));
    if (next >= 0 && next !== stageIdx) setStageIdx(next);
  }, [agentRuns, stageIdx]);

  // Every 3s, advance to the next agent that has real output (council order).
  useEffect(() => {
    if (userPinnedRef.current) return;
    const run = agentRuns[stageIdx];
    if (!run || !isAgentShowable(run)) return;

    const timer = setTimeout(() => {
      const next = findNextShowableIndex(agentRuns, stageIdx);
      if (next != null) {
        setStageIdx(next);
        setDwellKey((k) => k + 1);
      }
    }, AGENT_TRANSCRIPT_DWELL_MS);

    return () => clearTimeout(timer);
  }, [stageIdx, revision, dwellKey, agentRuns]);

  const pinStage = useCallback((idx: number) => {
    userPinnedRef.current = true;
    setStageIdx(idx);
    setDwellKey((k) => k + 1);
    if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
    pinTimerRef.current = setTimeout(() => {
      userPinnedRef.current = false;
      setDwellKey((k) => k + 1);
    }, AGENT_TRANSCRIPT_DWELL_MS * 2);
  }, []);

  return { stageIdx, pinStage, dwellKey };
}

function DwellProgress({
  active,
  reduced,
  resetKey,
}: {
  active: boolean;
  reduced: boolean;
  resetKey: number;
}) {
  if (!active || reduced) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-hairline/80">
      <motion.div
        key={resetKey}
        className="h-full origin-left bg-signal"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: AGENT_TRANSCRIPT_DWELL_MS / 1000, ease: "linear" }}
      />
    </div>
  );
}

function AgentTurnCard({
  run,
  reduced,
  dwellKey,
}: {
  run: AgentRunState;
  reduced: boolean;
  dwellKey: number;
}) {
  const visual = AGENT_VISUALS[run.id];
  const Icon = visual.icon;
  const isCdo = run.id === "chiefDecisionOfficer";
  const content = getAgentTranscriptContent(run);
  const cardVariants = reduced ? cardMotionReduced : cardMotion;
  const showable = isAgentShowable(run);

  return (
    <motion.article
      key={`${run.id}-${dwellKey}`}
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
            boxShadow: run.status === "running" ? `0 0 20px ${visual.glow}` : undefined,
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
        {run.status === "running" && (
          <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-signal" aria-hidden />
        )}
        {content.impactScore != null && (
          <div className="shrink-0 rounded-lg border border-hairline bg-background px-2.5 py-1.5 text-right">
            <p className="font-mono-data text-[8px] uppercase tracking-wider text-ink-muted">
              Impact
            </p>
            <p className="font-display text-lg font-bold tabular-nums text-signal">
              {content.impactScore}
            </p>
          </div>
        )}
      </header>

      <div className="relative flex flex-1 flex-col justify-center px-5 py-6">
        {content.mode === "waiting" && (
          <div className="space-y-3">
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
            <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
              Awaiting agent response…
            </p>
          </div>
        )}

        {content.mode === "failed" && (
          <p className="text-sm text-negative">Agent failed — council continues with partial analysis.</p>
        )}

        {(content.mode === "streaming" || content.mode === "complete") && content.quote && (
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={content.quote.slice(0, 64)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <span
                className="pointer-events-none absolute -left-1 -top-4 font-display text-5xl leading-none opacity-[0.12]"
                style={{ color: visual.color }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="relative text-[15px] leading-relaxed text-ink">{content.quote}</p>
            </motion.blockquote>
          </AnimatePresence>
        )}

        {content.mode === "complete" && content.summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className={cn(
              "space-y-3",
              content.quote ? "mt-5 border-t border-hairline/80 pt-4" : "",
            )}
          >
            <p className="text-sm leading-relaxed text-ink">{content.summary}</p>
            <div className="flex flex-wrap gap-2">
              {content.risk && (
                <span className="max-w-full rounded-lg border border-negative/20 bg-negative/5 px-2.5 py-1.5 text-[11px] leading-snug text-negative">
                  <span className="font-medium">Risk · </span>
                  {content.risk}
                </span>
              )}
              {content.opportunity && (
                <span className="max-w-full rounded-lg border border-positive/20 bg-positive/5 px-2.5 py-1.5 text-[11px] leading-snug text-positive">
                  <span className="font-medium">Upside · </span>
                  {content.opportunity}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {run.status === "queued" && !showable && (
          <p className="font-display text-sm text-ink-muted/70">Queued in council order…</p>
        )}
      </div>

      <DwellProgress active={showable} reduced={reduced} resetKey={dwellKey} />

      {showable && (
        <footer className="border-t border-hairline/60 px-5 py-2.5">
          <p className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-ink-muted/70">
            {run.status === "running"
              ? "Live stream · rotates when next agent speaks"
              : `On screen ${AGENT_TRANSCRIPT_DWELL_MS / 1000}s · next specialist`}
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
        const showable = isAgentShowable(run);
        const isCurrent = i === stageIdx;

        return (
          <button
            key={run.id}
            type="button"
            onClick={() => onSelect(i)}
            title={visual.shortLabel}
            disabled={!showable}
            className={cn(
              "relative h-2 rounded-full transition-all duration-300",
              isCurrent ? "w-6 bg-signal" : showable ? "w-2 opacity-80" : "w-2 bg-hairline opacity-40",
            )}
            style={
              !isCurrent && showable
                ? { backgroundColor: visual.color }
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
  const { stageIdx, pinStage, dwellKey } = useCouncilStage(agentRuns);
  const currentRun = agentRuns[stageIdx];
  const isStreaming = agentRuns.some((r) => r.status === "running");
  const hasStarted = agentRuns.some(isAgentShowable);
  const nextIdx = findNextShowableIndex(agentRuns, stageIdx);
  const nextLabel =
    nextIdx != null ? AGENT_VISUALS[agentRuns[nextIdx]!.id].shortLabel : null;

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
              {nextLabel && currentRun.status !== "running" && (
                <span className="text-ink-muted/60"> → {nextLabel}</span>
              )}
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
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-ink-muted/70">
              Each agent&apos;s real findings appear here for {AGENT_TRANSCRIPT_DWELL_MS / 1000}s, then
              the next specialist takes the floor
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {hasStarted && currentRun && isAgentShowable(currentRun) && (
            <AgentTurnCard
              key={`${currentRun.id}-stage-${stageIdx}-${dwellKey}`}
              run={currentRun}
              reduced={reduced}
              dwellKey={dwellKey}
            />
          )}
        </AnimatePresence>
      </div>

      {hasStarted && agentRuns.length > 1 && (
        <StageRail agentRuns={agentRuns} stageIdx={stageIdx} onSelect={pinStage} />
      )}
    </div>
  );
}
