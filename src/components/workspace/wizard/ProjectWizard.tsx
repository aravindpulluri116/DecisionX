"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Heart,
  IndianRupee,
  Leaf,
  MapPin,
  Pencil,
  Sparkles,
  Train,
  TrendingUp,
  Users,
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
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";
import { formatBudgetCrore } from "@/lib/format/currency";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ScenarioParams } from "@/types/workspace";
import type { ProjectCategory } from "@/types/simulation";
import { LocationMapPreview } from "./LocationMapPreview";
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

const STEP_META: Record<WizardStep, { title: string; subtitle: string; icon: typeof Sparkles }> = {
  1: {
    title: "Define your decision",
    subtitle: "Name the project and describe what it will do, for whom, and where.",
    icon: Pencil,
  },
  2: {
    title: "Location & category",
    subtitle: "Pin the geography and classify the decision domain.",
    icon: MapPin,
  },
  3: {
    title: "Parameters",
    subtitle: "Set budget and timeline — stakeholders are pre-selected by AI.",
    icon: IndianRupee,
  },
  4: {
    title: "Review & launch",
    subtitle: "Confirm details — Claude will run live multi-agent analysis.",
    icon: Zap,
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
  return `${schools} schools · ${hospitals} hospitals within 5km`;
}

function LaunchProgressPanel({ status, messages }: { status: string | null; messages: string[] }) {
  const pct = Math.min(92, 12 + messages.length * 12);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center py-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-signal/25 bg-signal/10">
        <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-2xl bg-signal/20" />
        <Sparkles className="relative h-7 w-7 text-signal" />
      </div>
      <p className="mt-6 font-mono-data text-[10px] uppercase tracking-[0.25em] text-signal">
        Analysis in progress
      </p>
      <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Launching your project
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Enriching location data and starting Claude multi-agent simulation.
      </p>

      <div className="mt-8 w-full max-w-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-hairline">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-signal to-environmental"
            initial={{ width: "8%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
          {pct}% complete
        </p>
      </div>

      <div className="mt-8 w-full max-w-md space-y-2 rounded-2xl border border-hairline bg-surface/80 p-4 text-left shadow-elevated">
        {messages.map((msg, i) => (
          <motion.div
            key={`${msg}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2.5"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
            <p className="font-mono-data text-xs leading-relaxed text-ink-muted">{msg}</p>
          </motion.div>
        ))}
        {status && (
          <motion.div
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2.5 border-t border-hairline pt-2"
          >
            <span className="relative mt-1 flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            <p className="font-mono-data text-xs text-signal">{status}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

type DraftPreviewProps = {
  title?: string;
  description?: string;
  location?: string;
  category?: string;
  budget?: number;
  timeline?: string;
  stakeholders: string[];
};

function WizardDraftPreview({
  title,
  description,
  location,
  category,
  budget,
  timeline,
  stakeholders,
}: DraftPreviewProps) {
  const filled = [title, description, location, category, budget, timeline].filter(Boolean).length;

  return (
    <div className="mt-8 rounded-2xl border border-hairline bg-background/80 p-4 shadow-sm">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">Live preview</p>
      <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold text-ink">
        {title?.trim() || "Untitled decision"}
      </h3>
      {description?.trim() ? (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{description}</p>
      ) : (
        <p className="mt-2 text-xs italic text-ink-muted/70">Description will appear here…</p>
      )}

      <div className="mt-4 space-y-2 border-t border-hairline pt-4">
        <PreviewRow icon={MapPin} label="Location" value={location || "—"} />
        <PreviewRow icon={Building2} label="Category" value={category || "—"} />
        <PreviewRow
          icon={IndianRupee}
          label="Budget"
          value={budget ? formatBudgetCrore(budget) : "—"}
        />
        <PreviewRow icon={Calendar} label="Timeline" value={timeline || "—"} />
        <PreviewRow
          icon={Users}
          label="Stakeholders"
          value={stakeholders.length > 0 ? `${stakeholders.length} groups` : "—"}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-ink-muted">
          <span className="font-mono-data uppercase tracking-wider">Completion</span>
          <span className="font-mono-data">{Math.round((filled / 6) * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-gradient-to-r from-signal to-environmental transition-all duration-300"
            style={{ width: `${(filled / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-signal/70" />
      <span className="w-20 shrink-0 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <span className="min-w-0 truncate text-ink">{value}</span>
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
  const queryClient = useQueryClient();
  const [launching, setLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);
  const [launchMessages, setLaunchMessages] = useState<string[]>([
    "Initialising project pipeline…",
  ]);
  const [mapCoords, setMapCoords] = useState<GeoCoordinates | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const selectedStakeholders = draft.stakeholders ?? [];
  const location = draft.location?.trim() ?? "";
  const previewCoords = mapCoords ?? draft.geo?.coords;
  const { data: previewIntel, isError: geoError } = useGeoEnrichmentPreview(
    location,
    previewCoords,
    false,
  );
  const geoLoading = geocoding || enriching;

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

  const handleMapCoordsChange = useCallback(
    (coords: GeoCoordinates) => {
      setMapCoords(coords);
      updateDraft({ geo: { coords, address: location } });
    },
    [location, updateDraft],
  );

  const handleRefreshLocation = useCallback(async () => {
    if (location.length < 2) return;

    setGeocoding(true);
    try {
      const geocodeRes = await fetch("/api/geo/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      if (geocodeRes.ok) {
        const geo = (await geocodeRes.json()) as { coords: GeoCoordinates; address: string };
        setMapCoords(geo.coords);
        updateDraft({
          geo: { coords: geo.coords, address: geo.address },
        });

        setEnriching(true);
        try {
          const enrichRes = await fetch("/api/geo/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location, coords: geo.coords }),
          });
          if (enrichRes.ok) {
            const intel = (await enrichRes.json()) as LocationIntelligence;
            queryClient.setQueryData(
              ["geo-enrich-preview", location, geo.coords.lat, geo.coords.lng],
              intel,
            );
          }
        } finally {
          setEnriching(false);
        }
      } else {
        const err = await geocodeRes.json().catch(() => ({}));
        toast.error("Could not find location", {
          description: typeof err.error === "string" ? err.error : "Try a more specific place name",
        });
        return;
      }
    } catch {
      toast.error("Geocode failed", { description: "Check your connection and try again" });
      return;
    } finally {
      setGeocoding(false);
    }
  }, [location, queryClient, updateDraft]);

  const close = () => {
    if (launching) return;
    setMapCoords(null);
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
  const StepIcon = meta.icon;
  const descLen = (draft.description ?? "").trim().length;
  const descProgress = Math.min(100, Math.round((descLen / 30) * 100));

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-background">
      <div className="mesh-bg absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-signal/8 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between border-b border-hairline bg-surface/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          onClick={close}
          disabled={launching}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-background text-ink-muted transition-colors hover:border-signal/30 hover:text-ink disabled:opacity-50"
          aria-label="Close wizard"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            DecisionX · New Decision
          </p>
          <p className="mt-0.5 font-display text-sm font-semibold text-ink">{meta.title}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-background font-mono-data text-[10px] font-semibold text-signal">
          {step}/4
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-hairline bg-surface/70 p-6 backdrop-blur-sm lg:flex">
          <WizardStepRail current={step} />
          <WizardDraftPreview
            title={draft.title}
            description={draft.description}
            location={draft.location}
            category={draft.category}
            budget={draft.budget}
            timeline={draft.timeline}
            stakeholders={selectedStakeholders}
          />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-hairline bg-surface/50 px-4 py-3 lg:hidden">
            <WizardStepRail current={step} compact />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
            {launching ? (
              <LaunchProgressPanel status={launchStatus} messages={launchMessages} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-signal/20 bg-signal/10 sm:flex">
                      <StepIcon className="h-5 w-5 text-signal" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        {meta.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{meta.subtitle}</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    {step === 1 && (
                      <>
                        <WizardFieldGroup label="Project name" error={errors.title} required>
                          <Input
                            value={draft.title ?? ""}
                            onChange={(e) => updateDraft({ title: e.target.value })}
                            placeholder="e.g. Metro Line Extension to Whitefield"
                            className="h-12 border-hairline bg-background text-base shadow-sm focus-visible:ring-signal/30"
                            disabled={launching}
                            autoFocus
                          />
                        </WizardFieldGroup>
                        <WizardFieldGroup
                          label="Description"
                          error={errors.description}
                          helper={`${descLen}/30 characters minimum · use at least 5 meaningful words`}
                          required
                        >
                          <Textarea
                            value={draft.description ?? ""}
                            onChange={(e) => updateDraft({ description: e.target.value })}
                            placeholder="Describe scope, beneficiaries, and expected outcomes"
                            className="min-h-[160px] border-hairline bg-background text-base leading-relaxed shadow-sm focus-visible:ring-signal/30"
                            rows={6}
                            disabled={launching}
                          />
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-hairline">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                descLen >= 30 ? "bg-positive" : "bg-signal",
                              )}
                              style={{ width: `${descProgress}%` }}
                            />
                          </div>
                        </WizardFieldGroup>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <WizardFieldGroup label="Location" error={errors.location} required>
                          <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                            <Input
                              value={draft.location ?? ""}
                              onChange={(e) => updateDraft({ location: e.target.value })}
                              placeholder="e.g. Whitefield, Bangalore, Karnataka"
                              className="h-12 border-hairline bg-background pl-10 text-base shadow-sm focus-visible:ring-signal/30"
                              disabled={launching}
                              autoFocus
                            />
                          </div>
                        </WizardFieldGroup>

                        <div
                          className={cn(
                            "rounded-2xl border p-4 transition-colors",
                            location.length >= 2
                              ? "border-signal/25 bg-signal/[0.04]"
                              : "border-hairline bg-background/80",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/10">
                              <MapPin className="h-4 w-4 text-signal" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
                                Geo intelligence preview
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-ink">
                                {geocoding
                                  ? "Finding location on map…"
                                  : enriching
                                    ? "Loading OpenStreetMap context…"
                                    : geoError
                                      ? "Could not load location data — try again"
                                      : previewText}
                              </p>
                              <p className="mt-1 text-[11px] text-ink-muted">
                                Used for population, schools, hospitals, and impact radius
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRefreshLocation}
                              disabled={launching || location.length < 2 || geoLoading}
                              className="shrink-0 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono-data text-[10px] uppercase tracking-wide text-ink-muted transition-colors hover:border-signal/30 hover:text-signal disabled:opacity-50"
                            >
                              {geoLoading ? "Loading…" : "Refresh"}
                            </button>
                          </div>
                          <LocationMapPreview
                            location={location}
                            coords={previewCoords ?? null}
                            onCoordsChange={handleMapCoordsChange}
                          />
                        </div>

                        <WizardFieldGroup label="Category" error={errors.category} required>
                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                                    "group flex flex-col items-start gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-all",
                                    selected
                                      ? "border-signal/50 bg-signal/10 shadow-[0_4px_16px_oklch(0.52_0.22_262/0.12)] ring-1 ring-signal/20"
                                      : "border-hairline bg-background hover:border-signal/25 hover:bg-signal/[0.03]",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                      selected ? "bg-signal text-white" : "bg-hairline/80 text-ink-muted group-hover:text-signal",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
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
                          required
                        >
                          <div className="relative">
                            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                            <Input
                              type="number"
                              value={draft.budget ?? ""}
                              onChange={(e) =>
                                updateDraft({ budget: e.target.value ? Number(e.target.value) : undefined })
                              }
                              placeholder="e.g. 1200"
                              className="h-12 border-hairline bg-background pl-10 text-base shadow-sm focus-visible:ring-signal/30"
                              disabled={launching}
                              autoFocus
                            />
                          </div>
                        </WizardFieldGroup>

                        <WizardFieldGroup label="Timeline" error={errors.timeline} required>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {TIMELINES.map((t) => (
                              <button
                                key={t}
                                type="button"
                                disabled={launching}
                                onClick={() => updateDraft({ timeline: t })}
                                className={cn(
                                  "rounded-xl border px-3 py-3 text-center transition-all",
                                  draft.timeline === t
                                    ? "border-signal bg-signal text-white shadow-[0_4px_16px_oklch(0.52_0.22_262/0.25)]"
                                    : "border-hairline bg-background text-ink-muted hover:border-signal/30 hover:text-ink",
                                )}
                              >
                                <Calendar className="mx-auto h-4 w-4 opacity-80" />
                                <span className="mt-2 block font-mono-data text-[10px] uppercase tracking-wide">
                                  {t}
                                </span>
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
                              : `${selectedStakeholders.length} selected — AI pre-filled; add or remove groups below`
                          }
                          required
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
                      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-elevated">
                        <div className="border-b border-hairline bg-signal/[0.04] px-5 py-4">
                          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-signal">
                            Ready to launch
                          </p>
                          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                            {draft.title || "Untitled project"}
                          </h3>
                        </div>

                        <div className="divide-y divide-hairline">
                          <ReviewSection
                            label="Description"
                            value={draft.description ?? "—"}
                            onEdit={() => setStep(1)}
                            multiline
                          />
                          <ReviewSection
                            label="Location"
                            value={draft.location ?? "—"}
                            onEdit={() => setStep(2)}
                          />
                          <ReviewSection
                            label="Category"
                            value={draft.category ?? "—"}
                            onEdit={() => setStep(2)}
                          />
                          <ReviewSection
                            label="Budget"
                            value={draft.budget ? formatBudgetCrore(draft.budget) : "—"}
                            onEdit={() => setStep(3)}
                          />
                          <ReviewSection
                            label="Timeline"
                            value={draft.timeline ?? "—"}
                            onEdit={() => setStep(3)}
                          />
                          <ReviewSection
                            label="Stakeholders"
                            value={
                              selectedStakeholders.length > 0
                                ? selectedStakeholders.join(", ")
                                : "—"
                            }
                            onEdit={() => setStep(3)}
                            multiline
                          />
                        </div>

                        <div className="border-t border-hairline bg-background/60 px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {["7 AI agents", "OpenStreetMap geo", "Live streaming"].map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-hairline bg-surface px-2.5 py-1 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                            Launching runs OpenStreetMap enrichment, Claude metadata agents, and a live
                            multi-agent simulation — no placeholder data.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {!launching && (
            <footer className="flex items-center justify-between gap-4 border-t border-hairline bg-surface/95 px-4 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
              <button
                type="button"
                onClick={step === 1 ? close : prevStep}
                className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-background px-4 py-2.5 font-mono-data text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-background shadow-sm transition-all hover:bg-signal hover:shadow-[0_4px_20px_oklch(0.52_0.22_262/0.25)]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={launch}
                  className="inline-flex items-center gap-2 rounded-lg bg-signal px-6 py-2.5 text-sm font-medium text-white shadow-[0_4px_20px_oklch(0.52_0.22_262/0.35)] transition-all hover:brightness-110"
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

function ReviewSection({
  label,
  value,
  onEdit,
  multiline,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-signal/[0.02]">
      <div className="min-w-0 flex-1">
        <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">{label}</p>
        <p className={cn("mt-1 text-sm text-ink", multiline && "leading-relaxed")}>{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted opacity-0 transition-all group-hover:border-hairline group-hover:bg-background group-hover:opacity-100 hover:text-signal"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    </div>
  );
}
