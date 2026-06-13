"use client";

import {
  Network,
  Clock,
  GitCompare,
  FileText,
  Map,
  PanelLeft,
  PanelRight,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceMode } from "@/types/simulation";
import { cn } from "@/lib/utils";
import { ImpactScoreSummary } from "../intelligence/ImpactScoreStrip";

const MODES: { id: WorkspaceMode; label: string; icon: typeof Network; short: string }[] = [
  { id: "canvas", label: "Canvas", icon: Network, short: "Graph" },
  { id: "timemachine", label: "Time Machine", icon: Clock, short: "Future" },
  { id: "compare", label: "Compare", icon: GitCompare, short: "Compare" },
  { id: "report", label: "Report", icon: FileText, short: "Report" },
  { id: "map", label: "Map", icon: Map, short: "Geo" },
];

type WorkspaceHudProps = {
  projectTitle: string;
  scenarioTitle?: string;
  navOpen: boolean;
  intelOpen: boolean;
  onToggleNav: () => void;
  onToggleIntel: () => void;
  onRunSimulation: () => void;
  onNewDecision: () => void;
};

export function WorkspaceHud({
  projectTitle,
  scenarioTitle,
  navOpen,
  intelOpen,
  onToggleNav,
  onToggleIntel,
  onRunSimulation,
  onNewDecision,
}: WorkspaceHudProps) {
  const workspaceMode = useWorkspaceStore((s) => s.workspaceMode);
  const setWorkspaceMode = useWorkspaceStore((s) => s.setWorkspaceMode);
  const selectedScenario = useWorkspaceStore((s) => s.selectedScenario);
  const setCompareScenarioIds = useWorkspaceStore((s) => s.setCompareScenarioIds);

  const activeMode = workspaceMode === "timeline" ? "timemachine" : workspaceMode;

  const selectMode = (mode: WorkspaceMode) => {
    if (mode === "compare" && selectedScenario) {
      setCompareScenarioIds([selectedScenario.id, selectedScenario.id]);
    }
    setWorkspaceMode(mode);
  };

  return (
    <header className="relative z-20 flex shrink-0 flex-col border-b border-hairline bg-surface/95 backdrop-blur-md">
      {/* Top row: brand, project, actions */}
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleNav}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-muted transition-colors hover:border-ink/20 hover:bg-background hover:text-ink"
            aria-label={navOpen ? "Hide navigator" : "Show navigator"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <Link href="/" className="hidden items-center gap-2 sm:flex">
            <div className="relative h-3.5 w-3.5">
              <div className="absolute inset-0 border border-ink" />
              <div className="absolute inset-[2px] bg-signal" />
            </div>
            <span className="font-display text-sm font-semibold tracking-tight">
              Decision<span className="text-signal">X</span>
            </span>
          </Link>

          <span className="hidden text-ink-muted/40 sm:inline">/</span>
          <div className="min-w-0 truncate">
            <p className="truncate font-display text-sm font-semibold text-ink">{projectTitle}</p>
            {scenarioTitle && (
              <p className="truncate text-xs text-ink-muted">{scenarioTitle}</p>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <ImpactScoreSummary scores={selectedScenario?.impact_scores ?? null} />
          </div>

          <button
            type="button"
            onClick={onNewDecision}
            className="hidden items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:border-ink/20 hover:text-ink sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-signal" />
            New
          </button>

          <button
            type="button"
            onClick={onRunSimulation}
            className="flex items-center gap-1.5 rounded-md bg-signal px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Run simulation</span>
            <span className="sm:hidden">Run</span>
          </button>

          <button
            type="button"
            onClick={onToggleIntel}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
              intelOpen
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-hairline text-ink-muted hover:border-ink/20 hover:bg-background hover:text-ink",
            )}
            aria-label={intelOpen ? "Hide intelligence panel" : "Show intelligence panel"}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-0.5 overflow-x-auto border-t border-hairline/80 px-3 pb-2 pt-1.5 sm:px-4">
        {MODES.map(({ id, label, icon: Icon, short }) => {
          const active = activeMode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectMode(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                active
                  ? "bg-ink text-surface shadow-sm"
                  : "text-ink-muted hover:bg-background hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
