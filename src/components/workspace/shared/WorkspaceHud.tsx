"use client";

import {
  Brain,
  FolderKanban,
  GitCompare,
  FileText,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceTab } from "@/types/simulation";
import { cn } from "@/lib/utils";
import { ImpactScoreSummary } from "../intelligence/ImpactScoreStrip";

const TABS: {
  id: WorkspaceTab;
  label: string;
  short: string;
  icon: typeof FileText;
}[] = [
  { id: "report", label: "Report", short: "Report", icon: FileText },
  { id: "compare", label: "Compare", short: "Compare", icon: GitCompare },
  { id: "projects", label: "Projects", short: "Projects", icon: FolderKanban },
  { id: "intelligence", label: "Intelligence", short: "Intel", icon: Brain },
];

type WorkspaceHudProps = {
  projectTitle: string;
  scenarioTitle?: string;
  onRunSimulation: () => void;
  onNewDecision: () => void;
};

export function WorkspaceHud({
  projectTitle,
  scenarioTitle,
  onRunSimulation,
  onNewDecision,
}: WorkspaceHudProps) {
  const workspaceTab = useWorkspaceStore((s) => s.workspaceTab);
  const setWorkspaceTab = useWorkspaceStore((s) => s.setWorkspaceTab);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);

  return (
    <header className="relative z-20 flex shrink-0 flex-col border-b border-hairline bg-surface/95 shadow-[0_1px_0_oklch(0.18_0.045_264/0.05)] backdrop-blur-xl">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <div className="relative h-3.5 w-3.5 transition-transform group-hover:scale-105">
              <div className="absolute inset-0 border border-ink" />
              <div className="absolute inset-[2px] bg-signal" />
            </div>
            <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">
              Decision<span className="text-signal">X</span>
            </span>
          </Link>

          <Link
            href="/workspace"
            className="hidden shrink-0 rounded-md px-2 py-0.5 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:bg-signal/5 hover:text-signal sm:inline"
          >
            Workspace
          </Link>
          <span className="hidden text-ink-muted/30 sm:inline">/</span>
          <div className="min-w-0 truncate">
            <p className="truncate font-display text-sm font-semibold text-ink">{projectTitle}</p>
            {scenarioTitle && (
              <p className="truncate text-xs text-ink-muted">{scenarioTitle}</p>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-lg border border-hairline bg-background/60 px-2 py-1 md:block">
            <ImpactScoreSummary scores={selectedScenario?.impact_scores ?? null} />
          </div>

          <button
            type="button"
            onClick={onNewDecision}
            className="hidden items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-xs text-ink-muted transition-all hover:border-signal/30 hover:bg-signal/5 hover:text-signal sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-signal" />
            New
          </button>

          <button
            type="button"
            onClick={onRunSimulation}
            className="flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-xs font-medium text-white shadow-[0_2px_12px_oklch(0.52_0.22_262/0.3)] transition-all hover:shadow-[0_4px_20px_oklch(0.52_0.22_262/0.4)] hover:brightness-110"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Run simulation</span>
            <span className="sm:hidden">Run</span>
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-t border-hairline/80 bg-background/40 px-3 pb-2 pt-2 sm:px-4">
        {TABS.map(({ id, label, icon: Icon, short }) => {
          const active = workspaceTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setWorkspaceTab(id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all",
                active
                  ? "bg-ink font-medium text-surface shadow-sm"
                  : "text-ink-muted hover:bg-surface hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
              {active && (
                <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-signal" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
