"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Heart,
  Leaf,
  MapPin,
  Train,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWizardStore, WIZARD_CATEGORIES } from "@/stores/wizard-store";
import { useStartSimulation } from "@/hooks/useStartSimulation";
import { useGeoEnrichmentPreview } from "@/hooks/useGeoQueries";
import { createProject } from "@/lib/services/projectService";
import type { EnrichedProjectContext } from "@/lib/services/enrichProjectContext";
import { formatBudgetCrore } from "@/lib/format/currency";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ScenarioParams } from "@/types/workspace";
import type { ProjectCategory } from "@/types/simulation";
import { StakeholderPicker, useStakeholderSuggestions } from "./StakeholderPicker";
import { WizardStepRail, type WizardStep } from "./WizardStepRail";
import { WizardFieldGroup } from "./WizardFieldGroup";

const TIMELINES = ["2 years", "5 years", "10 years", "15 years"];

const CATEGORY_ICONS: Record<ProjectCategory, typeof Train> = {
  Transportation: Train,
  "Urban Development": Building2,
  Environment: Leaf,
  Education: GraduationCap,
  Healthcare: Heart,
  "Economic Policy": TrendingUp,
};

const STEP_META: Record<WizardStep, { title: string; subtitle: string }> = {
  1: {
    title: "Define your decision",
    subtitle: "Name the project and describe what it will do, for whom, and where.",
  },
  2: {
    title: "Location & category",
    subtitle: "Pin the geography and classify the decision domain.",
  },
  3: {
    title: "Parameters",
    subtitle: "Set budget and timeline — stakeholders are pre-selected by AI; add or remove groups as needed.",
  },
  4: {
    title: "Review & launch",
    subtitle: "Confirm details — Claude will run live multi-agent analysis.",
  },
};

function flattenApiFieldErrors(details: unknown): Record<string, string> {
  if (!details || typeof details !== "object") return {};
  const fieldErrors = (details as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors;
  if (!fieldErrors) return {};
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out;
}

function locationPreviewLine(intel: EnrichedProjectContext["locationIntelligence"] | undefined) {
  if (!intel) return "Enter a location, then refresh to load OpenStreetMap context";
  if (intel.unavailable) {
    return "OpenStreetMap unavailable — population will be estimated by AI";
  }
  const r5 = intel.radiusImpacts.find((r) => r.radiusKm === 5);
  const schools = r5?.schools ?? 0;
  const hospitals = r5?.hospitals ?? 0;
  return `${schools} schools · ${hospitals} hospitals within 5km (OpenStreetMap)`;
}

function LaunchProgressPanel({ status, messages }: { status: string | null; messages: string[] }) {
  const pct = Math.min(92, 12 + messages.length * 12);

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-signal" />
        </div>
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-signal">
          Analysis in progress
        </p>
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold text-ink">Launching your project…</h3>
      <p className="mt-2 text-sm text-ink-muted">
        Enriching location data and starting Claude multi-agent simulation.
      </p>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-signal to-environmental"
          initial={{ width: "8%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="mt-6 max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-hairline bg-background/80 p-4">
        {messages.map((msg, i) => (
          <motion.p
            key={`${msg}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono-data text-xs text-ink-muted"
          >
            {msg}
          </motion.p>
        ))}
        {status && (
          <motion.p
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono-data text-xs text-signal"
          >
            {status}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export function ProjectWizard() {
  const open = useWorkspaceStore((s) => s.wizardOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);
  const setLocationIntelligence = useWorkspaceStore((s) => s.setLocationIntelligence);
  const {
    draft,
    errors,
    step,
    updateDraft,
    validate,
    validateStep,
    nextStep,
    prevStep,
    reset,
    setErrors,
    setStep,
  } = useWizardStore();
  const startSimulation = useStartSimulation();
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [launchMessages, setLaunchMessages] = useState<string[]>([
    "Initialising project pipeline…",
  ]);

  const selectedStakeholders = draft.stakeholders ?? [];
  const location = draft.location?.trim() ?? "";
  const { data: previewIntel, refetch: refetchGeo, isFetching: geoLoading } = useGeoEnrichmentPreview(
    location,
    undefined,
    Boolean(location.length >= 2),
  );

  const handleStakeholdersSuggested = useCallback(
    (stakeholders: string[], _rationale: string) => {
      updateDraft({ stakeholders });
    },
    [updateDraft],
  );

  const {
    loading: stakeholdersLoading,
    rationale: stakeholdersRationale,
    aiSuggested,
    error: stakeholdersError,
    markUserEdited: markStakeholdersEdited,
  } = useStakeholderSuggestions({
    enabled: step === 3 && open,
    title: draft.title ?? "",
    description: draft.description ?? "",
    location: draft.location ?? "",
    category: draft.category,
    budget: draft.budget,
    timeline: draft.timeline,
    onSuggested: handleStakeholdersSuggested,
  });

  useEffect(() => {
    if (stakeholdersError) {
      toast.error("Could not auto-select stakeholders", { description: stakeholdersError });
    }
  }, [stakeholdersError]);

  const handleRefreshLocation = useCallback(async () => {
    if (location.length < 2) return;
    await refetchGeo();
  }, [location, refetchGeo]);

  const close = () => {
    if (launching) return;
    reset();
    setWizardOpen(false);
  };

  const handleContinue = () => {
    if (step < 4) nextStep();
  };

  const launch = async () => {
    if (!validate()) {
      const errs = useWizardStore.getState().errors;
      if (errs.title || errs.description) setStep(1);
      else if (errs.location || errs.category) setStep(2);
      else setStep(3);
      return;
    }

    setLaunching(true);
    setLaunchMessages(["Loading location data from OpenStreetMap…"]);
    setLaunchStatus("Loading location data from OpenStreetMap…");

    try {
      const body = {
        title: draft.title!.trim(),
        description: draft.description!.trim(),
        location: draft.location!.trim(),
        budget: draft.budget!,
        timeline: draft.timeline!,
        category: draft.category as ProjectCategory,
        stakeholders: selectedStakeholders,
      };

      setLaunchStatus("Enriching context and estimating population with AI…");
      setLaunchMessages((m) => [...m, "Enriching context with Claude…"]);
      const enrichRes = await fetch("/api/projects/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!enrichRes.ok) {
        const err = await enrichRes.json().catch(() => ({}));
        const apiFieldErrors = flattenApiFieldErrors(err.details);
        if (Object.keys(apiFieldErrors).length > 0) {
          setErrors(apiFieldErrors);
          setLaunching(false);
          setLaunchStatus(null);
          return;
        }
        throw new Error(typeof err.error === "string" ? err.error : "Project enrichment failed");
      }

      const enriched = (await enrichRes.json()) as EnrichedProjectContext;

      setLaunchStatus("Creating project…");
      setLaunchMessages((m) => [...m, "Creating project record…"]);
      const project = await createProject(
        {
          title: body.title,
          description: body.description,
          location: body.location,
          budget: body.budget,
          timeline: body.timeline,
          category: enriched.metadata.category,
          stakeholders: enriched.metadata.stakeholders,
          project_type: enriched.metadata.projectType,
          geo: enriched.geo,
          locationIntelligence: enriched.locationIntelligence,
        },
        enriched.scenarioParams,
      );

      setLocationIntelligence(enriched.locationIntelligence);
      setLaunchMessages((m) => [...m, "Starting simulation…"]);
      reset();
      setWizardOpen(false);

      await startSimulation({
        project,
        params: enriched.scenarioParams as ScenarioParams,
        scenarioTitle: `${project.title} — Initial Analysis`,
        navigateOnComplete: true,
      });

      router.push(`/workspace/${project.slug}`);
    } catch (e) {
      toast.error("Could not start project", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLaunching(false);
      setLaunchStatus(null);
    }
  };

  if (!open) return null;

  const previewText = previewIntel ? locationPreviewLine(previewIntel) : locationPreviewLine(undefined);
  const meta = STEP_META[step];
  const descLen = (draft.description ?? "").trim().length;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="mesh-bg absolute inset-0 opacity-40" />

      <header className="relative z-10 flex items-center justify-between border-b border-hairline bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={close}
          disabled={launching}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink-muted transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-50"
          aria-label="Close wizard"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            DecisionX · New Decision
          </p>
        </div>
        <div className="w-9" />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-hairline bg-surface/80 p-6 lg:block">
          <WizardStepRail current={step} />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-hairline px-4 py-3 lg:hidden">
            <WizardStepRail current={step} />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
            {launching ? (
              <LaunchProgressPanel status={launchStatus} messages={launchMessages} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="mx-auto max-w-xl"
                >
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {meta.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{meta.subtitle}</p>

                  <div className="mt-8 space-y-6">
                    {step === 1 && (
                      <>
                        <WizardFieldGroup label="Project name" error={errors.title}>
                          <Input
                            value={draft.title ?? ""}
                            onChange={(e) => updateDraft({ title: e.target.value })}
                            placeholder="e.g. Metro Line Extension to Whitefield"
                            className="h-12 text-base"
                            disabled={launching}
                            autoFocus
                          />
                        </WizardFieldGroup>
                        <WizardFieldGroup
                          label="Description"
                          error={errors.description}
                          helper={`${descLen}/30 characters minimum · use at least 5 meaningful words`}
                        >
                          <Textarea
                            value={draft.description ?? ""}
                            onChange={(e) => updateDraft({ description: e.target.value })}
                            placeholder="Describe scope, beneficiaries, and expected outcomes"
                            className="min-h-[140px] text-base"
                            rows={5}
                            disabled={launching}
                          />
                        </WizardFieldGroup>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <WizardFieldGroup label="Location" error={errors.location}>
                          <Input
                            value={draft.location ?? ""}
                            onChange={(e) => updateDraft({ location: e.target.value })}
                            placeholder="e.g. Whitefield, Bangalore, Karnataka"
                            className="h-12 text-base"
                            disabled={launching}
                            autoFocus
                          />
                        </WizardFieldGroup>

                        <div className="rounded-xl border border-hairline bg-background/80 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10">
                              <MapPin className="h-4 w-4 text-signal" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
                                Geo preview
                              </p>
                              <p className="mt-1 text-sm text-ink">
                                {geoLoading ? "Loading OpenStreetMap…" : previewText}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRefreshLocation}
                              disabled={launching || location.length < 2 || geoLoading}
                              className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 font-mono-data text-[10px] uppercase text-ink-muted transition-colors hover:text-signal disabled:opacity-50"
                            >
                              Refresh
                            </button>
                          </div>
                        </div>

                        <WizardFieldGroup label="Category" error={errors.category}>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {WIZARD_CATEGORIES.map((cat) => {
                              const Icon = CATEGORY_ICONS[cat];
                              const selected = draft.category === cat;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  disabled={launching}
                                  onClick={() => updateDraft({ category: cat })}
                                  className={cn(
                                    "flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-all",
                                    selected
                                      ? "border-signal/50 bg-signal/10 ring-1 ring-signal/20"
                                      : "border-hairline bg-background hover:border-signal/30",
                                  )}
                                >
                                  <Icon className={cn("h-4 w-4", selected ? "text-signal" : "text-ink-muted")} />
                                  <span className="text-xs font-medium leading-tight text-ink">{cat}</span>
                                </button>
                              );
                            })}
                          </div>
                        </WizardFieldGroup>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <WizardFieldGroup
                          label="Budget (₹ crore)"
                          error={errors.budget}
                          helper={
                            draft.budget
                              ? formatBudgetCrore(draft.budget)
                              : "Enter total capital budget in crore"
                          }
                        >
                          <Input
                            type="number"
                            value={draft.budget ?? ""}
                            onChange={(e) =>
                              updateDraft({ budget: e.target.value ? Number(e.target.value) : undefined })
                            }
                            placeholder="e.g. 1200"
                            className="h-12 text-base"
                            disabled={launching}
                            autoFocus
                          />
                        </WizardFieldGroup>

                        <WizardFieldGroup label="Timeline" error={errors.timeline}>
                          <div className="flex flex-wrap gap-2">
                            {TIMELINES.map((t) => (
                              <button
                                key={t}
                                type="button"
                                disabled={launching}
                                onClick={() => updateDraft({ timeline: t })}
                                className={cn(
                                  "rounded-full border px-4 py-2 font-mono-data text-[10px] uppercase tracking-wide transition-all",
                                  draft.timeline === t
                                    ? "border-signal bg-signal text-white shadow-[0_2px_12px_oklch(0.52_0.22_262/0.3)]"
                                    : "border-hairline bg-background text-ink-muted hover:border-signal/40",
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </WizardFieldGroup>

                        <WizardFieldGroup
                          label="Stakeholders"
                          error={errors.stakeholders}
                          helper={
                            stakeholdersLoading
                              ? "Claude is picking affected groups from your project details…"
                              : `${selectedStakeholders.length} selected — AI pre-filled based on your project; add more below if needed`
                          }
                        >
                          <StakeholderPicker
                            value={selectedStakeholders}
                            onChange={(stakeholders) => updateDraft({ stakeholders })}
                            onUserEdit={markStakeholdersEdited}
                            disabled={launching}
                            aiSuggested={aiSuggested}
                            aiRationale={stakeholdersRationale}
                            loading={stakeholdersLoading}
                          />
                        </WizardFieldGroup>
                      </>
                    )}

                    {step === 4 && (
                      <div className="space-y-4 rounded-xl border border-hairline bg-surface p-5 shadow-sm">
                        <SummaryRow label="Project" value={draft.title ?? "—"} />
                        <SummaryRow label="Description" value={draft.description ?? "—"} multiline />
                        <SummaryRow label="Location" value={draft.location ?? "—"} />
                        <SummaryRow label="Category" value={draft.category ?? "—"} />
                        <SummaryRow
                          label="Budget"
                          value={draft.budget ? formatBudgetCrore(draft.budget) : "—"}
                        />
                        <SummaryRow label="Timeline" value={draft.timeline ?? "—"} />
                        <SummaryRow
                          label="Stakeholders"
                          value={
                            selectedStakeholders.length > 0
                              ? selectedStakeholders.join(", ")
                              : "—"
                          }
                          multiline
                        />
                        <p className="border-t border-hairline pt-4 text-xs text-ink-muted">
                          Launching runs OpenStreetMap enrichment, Claude metadata agents, and a live
                          multi-agent simulation — no placeholder data.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {!launching && (
            <footer className="flex items-center justify-between border-t border-hairline bg-surface/90 px-4 py-4 backdrop-blur-md sm:px-8 lg:px-12">
              <button
                type="button"
                onClick={step === 1 ? close : prevStep}
                className="inline-flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 3 && stakeholdersLoading) {
                      toast.info("Waiting for AI stakeholder suggestions…");
                      return;
                    }
                    if (validateStep(step)) handleContinue();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-surface transition-all hover:bg-signal"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={launch}
                  className="inline-flex items-center gap-2 rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_oklch(0.52_0.22_262/0.35)] transition-all hover:brightness-110"
                >
                  <Zap className="h-4 w-4" />
                  Launch simulation
                </button>
              )}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3 text-sm">
      <span className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <span className={cn("text-ink", multiline && "leading-relaxed")}>{value}</span>
    </div>
  );
}
