"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown } from "lucide-react";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/types/simulation";

type TranscriptEntry = {
  key: string;
  agentId: AgentId;
  label: string;
  text: string;
  kind: "finding" | "verdict";
};

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function CouncilTranscript() {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);

  const { entries, verdict } = useMemo(() => {
    const flat: TranscriptEntry[] = [];

    for (const run of agentRuns) {
      run.findings.forEach((finding, i) => {
        flat.push({
          key: `${run.id}-f-${i}`,
          agentId: run.id,
          label: run.label,
          text: finding,
          kind: "finding",
        });
      });
    }

    const cdo = agentRuns.find((r) => r.id === "chiefDecisionOfficer");
    const verdictText = cdo?.result?.summary;

    return {
      entries: flat.slice(-8),
      verdict:
        cdo?.status === "completed" && verdictText
          ? { text: verdictText, label: cdo.label }
          : null,
    };
  }, [agentRuns]);

  const hasContent = entries.length > 0 || verdict;

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <p className="mb-3 font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        Live council transcript
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!hasContent && (
          <div className="rounded-xl border border-dashed border-hairline bg-background px-4 py-8 text-center">
            <p className="font-display text-sm text-ink-muted">Council convening…</p>
            <p className="mt-1 text-xs text-ink-muted/70">Awaiting first specialist analysis</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const visual = AGENT_VISUALS[entry.agentId];
            const accent = visual?.color ?? "oklch(0.52 0.22 262)";

            return (
              <motion.div
                key={entry.key}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border border-hairline bg-surface p-3 shadow-sm"
                style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
                    {visual?.role ?? entry.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  &ldquo;{truncate(entry.text)}&rdquo;
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {verdict && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border border-signal/30 bg-signal/8 p-4",
              "shadow-[0_4px_24px_oklch(0.52_0.22_262/0.12)]",
            )}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-signal" />
              <span className="font-mono-data text-[10px] uppercase tracking-wider text-signal">
                Final verdict
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink">
              {truncate(verdict.text, 280)}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
