"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { fetchProjects } from "@/lib/workspace/queries";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ProjectWizard } from "../wizard/ProjectWizard";
import { ProjectCard } from "../shared/ProjectCard";
import { WorkspaceEmptyState } from "../shared/WorkspaceEmptyState";
import { WorkspaceLoadingState } from "../shared/WorkspaceLoadingState";
import { AI_SPONSOR_NAME } from "@/lib/brand";

export function WorkspaceIndex() {
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);
  const { data: projects = [], isPending, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: 1,
  });

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [projects],
  );

  if (isPending) {
    return <WorkspaceLoadingState message="Loading workspace…" />;
  }

  if (isError) {
    return (
      <>
        <WorkspaceEmptyState
          icon={Sparkles}
          title="Could not load projects"
          description="Check your connection or Supabase configuration, then refresh."
          className="h-screen"
        />
        <ProjectWizard />
      </>
    );
  }

  if (sortedProjects.length === 0) {
    return (
      <>
        <WorkspaceEmptyState
          icon={Sparkles}
          title="DecisionX Workspace"
          description={`Create your first decision project. ${AI_SPONSOR_NAME}'s multi-agent system analyzes economic, social, and environmental impact from your real project details.`}
          tags={["7 AI agents", "Geo intelligence", "Live analysis"]}
          action={
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="group inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-sm font-medium text-surface transition-all hover:bg-signal hover:shadow-[0_4px_24px_oklch(0.52_0.22_262/0.25)]"
            >
              <Plus className="h-4 w-4" />
              New decision
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          }
          footer={
            <Link
              href="/"
              className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-signal"
            >
              ← Back to home
            </Link>
          }
          className="h-screen"
        />
        <ProjectWizard />
      </>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-background">
        <div className="mesh-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-8"
          >
            <div>
              <Link
                href="/"
                className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-signal"
              >
                ← DecisionX Home
              </Link>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                Your decisions
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {sortedProjects.length} project{sortedProjects.length === 1 ? "" : "s"} · pick one to
                open or start a new analysis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_oklch(0.52_0.22_262/0.3)] transition-all hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              New decision
            </button>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sortedProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ProjectWizard />
    </>
  );
}
