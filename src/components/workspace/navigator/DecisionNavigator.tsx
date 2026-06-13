"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Sparkles, ChevronRight, FolderOpen, History, Library } from "lucide-react";
import { fetchProjects, fetchScenarios, activateScenario } from "@/lib/workspace/queries";
import { duplicateScenario } from "@/lib/services/simulationService";
import { isCustomProject } from "@/lib/workspace/mock-data";
import { isSupabasePersistenceEnabled } from "@/lib/workspace/mock-storage";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Project, RiskLevel, Scenario } from "@/types/workspace";
import { cn } from "@/lib/utils";

const riskDot: Record<RiskLevel, string> = {
  low: "bg-positive",
  medium: "bg-warning",
  high: "bg-negative",
  critical: "bg-negative",
};

type DecisionNavigatorProps = {
  projectId: string;
  projectSlug: string;
  activeScenarioId: string | null;
  onScenarioSelect: (scenario: Scenario) => void;
  collapsed?: boolean;
};

function ProjectChip({
  project,
  active,
  compact,
}: {
  project: Project;
  active: boolean;
  compact?: boolean;
}) {
  const custom = isCustomProject(project.slug);

  return (
    <Link
      href={`/workspace/${project.slug}`}
      title={project.title}
      className={cn(
        "flex items-center gap-2 rounded-lg transition-colors",
        compact ? "px-2 py-1.5" : "px-2.5 py-2",
        active ? "bg-ink text-surface" : "text-ink hover:bg-background",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          active ? "bg-surface/60" : riskDot[project.risk_level],
        )}
      />
      <span className={cn("min-w-0 flex-1 truncate font-medium", compact ? "text-xs" : "text-sm")}>
        {project.title}
      </span>
      {custom && !active && !compact && (
        <span className="shrink-0 text-[9px] uppercase tracking-wide text-signal">Yours</span>
      )}
      {active && !compact && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
    </Link>
  );
}

function PersistenceHint() {
  const usesDb = isSupabasePersistenceEnabled();
  return (
    <p className="px-2 text-[10px] leading-snug text-ink-muted">
      {usesDb
        ? "Custom decisions sync to Supabase when connected."
        : "Custom decisions are saved in this browser (localStorage)."}
    </p>
  );
}

export function DecisionNavigator({
  projectId,
  projectSlug,
  activeScenarioId,
  onScenarioSelect,
  collapsed,
}: DecisionNavigatorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const { data: scenarios = [] } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: () => fetchScenarios(projectId),
  });

  const { yours, demos } = useMemo(() => {
    const custom = projects.filter((p) => isCustomProject(p.slug));
    const seed = projects.filter((p) => !isCustomProject(p.slug));
    return { yours: custom, demos: seed };
  }, [projects]);

  const handleScenarioClick = async (scenario: Scenario) => {
    await activateScenario(projectId, scenario.id);
    onScenarioSelect(scenario);
    queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
    queryClient.invalidateQueries({ queryKey: ["workspace-graph", scenario.id] });
  };

  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col border-r border-hairline bg-surface">
        <div className="border-b border-hairline p-2">
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-signal/30 bg-signal/10 py-2 text-signal hover:bg-signal/20"
            title="New decision"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">New</span>
          </button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-2">
            {yours.length > 0 && (
              <section>
                <p className="mb-1 flex items-center gap-1 px-1 text-[9px] font-medium uppercase tracking-wider text-ink-muted">
                  <History className="h-3 w-3" />
                  Yours
                </p>
                <div className="space-y-0.5">
                  {yours.map((p) => (
                    <ProjectChip key={p.id} project={p} active={p.slug === projectSlug} compact />
                  ))}
                </div>
              </section>
            )}
            <section>
              <p className="mb-1 flex items-center gap-1 px-1 text-[9px] font-medium uppercase tracking-wider text-ink-muted">
                <Library className="h-3 w-3" />
                Demos
              </p>
              <div className="space-y-0.5">
                {demos.map((p) => (
                  <ProjectChip key={p.id} project={p} active={p.slug === projectSlug} compact />
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
        <div className="border-t border-hairline p-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-lg py-1 text-[10px] text-ink-muted hover:text-ink"
          >
            ← Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-surface">
      <div className="border-b border-hairline px-3 py-3">
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          New decision
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-3">
          {yours.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                <History className="h-3 w-3" />
                Your decisions
              </h2>
              <div className="space-y-0.5">
                {yours.map((p) => (
                  <ProjectChip key={p.id} project={p} active={p.slug === projectSlug} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              <Library className="h-3 w-3" />
              Demo projects
            </h2>
            <div className="space-y-0.5">
              {demos.map((p) => (
                <ProjectChip key={p.id} project={p} active={p.slug === projectSlug} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                Simulations
              </h2>
              <button
                type="button"
                onClick={() => setBuilderOpen(true)}
                className="flex items-center gap-0.5 text-[11px] text-signal hover:underline"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>
            <div className="space-y-0.5">
              {scenarios.length === 0 ? (
                <p className="px-2 py-3 text-xs text-ink-muted">No simulations yet.</p>
              ) : (
                scenarios.map((s) => (
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
                        s.id === activeScenarioId ? "bg-signal" : "bg-ink/15",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    {s.is_active && (
                      <span className="shrink-0 rounded bg-positive/10 px-1.5 py-0.5 text-[9px] font-medium uppercase text-positive">
                        Live
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {activeScenarioId && (
              <button
                type="button"
                onClick={async () => {
                  const copy = await duplicateScenario(projectId, activeScenarioId);
                  if (copy) queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });
                }}
                className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-xs text-ink-muted hover:bg-background hover:text-ink"
              >
                Duplicate active scenario
              </button>
            )}
          </section>
        </div>
      </ScrollArea>

      <div className="space-y-2 border-t border-hairline p-3">
        <PersistenceHint />
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-lg py-1.5 text-xs text-ink-muted transition-colors hover:bg-background hover:text-ink"
        >
          ← Back to site
        </button>
      </div>
    </div>
  );
}
