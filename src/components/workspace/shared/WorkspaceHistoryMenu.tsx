"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { activateScenario, fetchProjects, fetchScenarios } from "@/lib/workspace/queries";
import { duplicateScenario } from "@/lib/services/simulationService";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Project, RiskLevel, Scenario } from "@/types/workspace";
import { cn } from "@/lib/utils";

const riskDot: Record<RiskLevel, string> = {
  low: "bg-positive",
  medium: "bg-warning",
  high: "bg-negative",
  critical: "bg-negative",
};

type WorkspaceHistoryMenuProps = {
  projectId: string;
  projectSlug: string;
  activeScenarioId: string | null;
  onScenarioSelect: (scenario: Scenario) => void;
};

function HistoryProjectLink({
  project,
  active,
  onNavigate,
}: {
  project: Project;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={`/workspace/${project.slug}`}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
        active ? "bg-ink text-surface" : "text-ink hover:bg-background",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          active ? "bg-surface/60" : riskDot[project.risk_level],
        )}
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{project.title}</span>
    </Link>
  );
}

export function WorkspaceHistoryMenu({
  projectId,
  projectSlug,
  activeScenarioId,
  onScenarioSelect,
}: WorkspaceHistoryMenuProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const { data: scenarios = [] } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
    enabled: open,
  });

  const close = () => setOpen(false);

  const handleScenarioClick = async (scenario: Scenario) => {
    await activateScenario(projectId, scenario.id);
    onScenarioSelect(scenario);
    queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
    queryClient.invalidateQueries({ queryKey: ["workspace-graph", scenario.id] });
    close();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-xs text-ink-muted transition-all hover:border-signal/30 hover:bg-signal/5 hover:text-signal"
        >
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-hairline bg-surface p-0 shadow-elevated">
        <ScrollArea className="max-h-[min(70vh,420px)]">
          <div className="space-y-5 p-4">
            <section>
              <h2 className="mb-2 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Past decisions
              </h2>
              {projects.length === 0 ? (
                <p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-xs text-ink-muted">
                  No decisions yet.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {projects.map((p) => (
                    <HistoryProjectLink
                      key={p.id}
                      project={p}
                      active={p.slug === projectSlug}
                      onNavigate={close}
                    />
                  ))}
                </div>
              )}
              <Link
                href="/workspace"
                onClick={close}
                className="mt-2 block text-center text-[11px] text-signal hover:underline"
              >
                View all
              </Link>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Simulations
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setBuilderOpen(true);
                    close();
                  }}
                  className="flex items-center gap-1 rounded-full border border-signal/30 bg-signal/5 px-2 py-0.5 font-mono-data text-[9px] uppercase text-signal hover:bg-signal/10"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
              </div>
              {scenarios.length === 0 ? (
                <p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-xs text-ink-muted">
                  No simulations for this project.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {scenarios.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleScenarioClick(s)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        s.id === activeScenarioId
                          ? "bg-signal/10 font-medium text-signal"
                          : "text-ink hover:bg-background",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          s.id === activeScenarioId ? "bg-signal" : "bg-ink/20",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      {s.is_active && (
                        <span className="shrink-0 font-mono-data text-[8px] uppercase text-positive">
                          Live
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {activeScenarioId && (
                <button
                  type="button"
                  onClick={async () => {
                    const copy = await duplicateScenario(projectId, activeScenarioId);
                    if (copy) queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
                  }}
                  className="mt-2 w-full text-left text-[11px] text-ink-muted hover:text-ink"
                >
                  Duplicate active scenario
                </button>
              )}
            </section>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
