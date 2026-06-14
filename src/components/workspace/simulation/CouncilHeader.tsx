"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";

type CouncilHeaderProps = {
  className?: string;
};

export function CouncilHeader({ className = "" }: CouncilHeaderProps) {
  const agentRuns = useWorkspaceStore((s) => s.agentRuns);
  const spoken = agentRuns.filter(
    (a) => a.status === "completed" || a.findings.length > 0,
  ).length;
  const total = agentRuns.length || 7;
  const pct = total > 0 ? (spoken / total) * 100 : 0;
  const running = agentRuns.some((a) => a.status === "running");

  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <header className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.28em] text-signal">
            ◢ Agent council / live session
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Strategic roundtable analysis
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {running
              ? "Specialists are deliberating — opinions stream in real time"
              : spoken === total
                ? "Council session complete"
                : "Convening the decision intelligence council…"}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 shadow-sm">
          <svg width="44" height="44" className="-rotate-90" aria-hidden>
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="oklch(0.18 0.045 264 / 0.08)"
              strokeWidth="3"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="oklch(0.52 0.22 262)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div>
            <p className="font-display text-lg font-bold tabular-nums text-ink">
              {spoken}/{total}
            </p>
            <p className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
              have spoken
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-px w-full overflow-hidden bg-hairline">
        <div className="absolute inset-y-0 w-1/3 animate-dx-scan bg-gradient-to-r from-transparent via-signal to-transparent" />
      </div>
    </header>
  );
}
