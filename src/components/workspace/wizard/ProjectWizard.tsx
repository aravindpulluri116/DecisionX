"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWizardStore } from "@/stores/wizard-store";
import { useStartSimulation } from "@/hooks/useStartSimulation";
import { useGeoEnrichmentPreview } from "@/hooks/useGeoQueries";
import { createProject } from "@/lib/services/projectService";
import { LocationMapPreview } from "./LocationMapPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBudgetCrore } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import type { GeoCoordinates } from "@/types/geo";
import type { ProjectCategory, StakeholderGroup } from "@/types/simulation";

const CATEGORIES: ProjectCategory[] = [
  "Transportation",
  "Urban Development",
  "Environment",
  "Education",
  "Healthcare",
  "Economic Policy",
];

const STAKEHOLDERS: StakeholderGroup[] = [
  "Citizens",
  "Businesses",
  "Government",
  "Students",
  "Environmental Groups",
];

const TIMELINES = ["2 years", "5 years", "10 years", "15 years"];

export function ProjectWizard() {
  const open = useWorkspaceStore((s) => s.wizardOpen);
  const setWizardOpen = useWorkspaceStore((s) => s.setWizardOpen);
  const { step, draft, errors, setStep, updateDraft, setCategory, toggleStakeholder, validateStep, reset } =
    useWizardStore();
  const startSimulation = useStartSimulation();
  const router = useRouter();
  const [mapCoords, setMapCoords] = useState<GeoCoordinates | null>(null);

  const location = draft.location ?? "Hyderabad";
  const { data: previewIntel, refetch: refetchGeo } = useGeoEnrichmentPreview(location, mapCoords ?? undefined);

  const handleLocationBlur = useCallback(async () => {
    await refetchGeo();
  }, [refetchGeo]);

  const handleGeocode = useCallback(async () => {
    const result = await refetchGeo();
    if (result.data?.coords) {
      setMapCoords(result.data.coords);
      updateDraft({
        geo: {
          coords: result.data.coords,
          address: result.data.address,
        },
      });
    }
  }, [refetchGeo, updateDraft]);

  if (!open) return null;

  const next = () => {
    if (validateStep(step)) setStep((step + 1) as 1 | 2 | 3 | 4);
  };
  const back = () => setStep((step - 1) as 1 | 2 | 3 | 4);

  const launch = async () => {
    if (!validateStep(3)) return;
    const project = await createProject({
      ...draft,
      geo: draft.geo ?? (mapCoords ? { coords: mapCoords, address: location } : undefined),
    });
    reset();
    setMapCoords(null);
    setWizardOpen(false);
    await startSimulation({
      project,
      scenarioTitle: `${project.title} — Initial Analysis`,
      navigateOnComplete: true,
    });
    router.push(`/workspace/${project.slug}`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-hairline bg-surface shadow-2xl"
      >
        <div className="border-b border-hairline px-6 py-4">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            New decision · step {step} of 4
          </p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn("h-1 flex-1", s <= step ? "bg-signal" : "bg-hairline")}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="font-display text-xl font-bold">Project Details</h2>
                <div>
                  <Label className="font-mono-data text-[10px] uppercase">Project Name</Label>
                  <Input value={draft.title ?? ""} onChange={(e) => updateDraft({ title: e.target.value })} className="mt-1" />
                  {errors.title && <p className="mt-1 text-xs text-negative">{errors.title}</p>}
                </div>
                <div>
                  <Label className="font-mono-data text-[10px] uppercase">Description</Label>
                  <Textarea value={draft.description ?? ""} onChange={(e) => updateDraft({ description: e.target.value })} className="mt-1" rows={3} />
                  {errors.description && <p className="mt-1 text-xs text-negative">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono-data text-[10px] uppercase">Location</Label>
                    <Input
                      value={draft.location ?? ""}
                      onChange={(e) => updateDraft({ location: e.target.value })}
                      onBlur={handleLocationBlur}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-mono-data text-[10px] uppercase">Budget (₹ crore)</Label>
                    <Input type="number" value={draft.budget ?? 800} onChange={(e) => updateDraft({ budget: Number(e.target.value) })} className="mt-1" />
                  </div>
                </div>
                <LocationMapPreview
                  location={location}
                  coords={mapCoords ?? draft.geo?.coords ?? previewIntel?.coords ?? null}
                  onCoordsChange={(coords) => {
                    setMapCoords(coords);
                    updateDraft({ geo: { coords, address: location } });
                  }}
                  onGeocode={handleGeocode}
                />
                {previewIntel && (
                  <p className="font-mono-data text-[10px] text-ink-muted">
                    {previewIntel.radiusImpacts.find((r) => r.radiusKm === 5)?.schools ?? 0} schools ·{" "}
                    {previewIntel.radiusImpacts.find((r) => r.radiusKm === 5)?.hospitals ?? 0} hospitals within 5km
                  </p>
                )}
                <div>
                  <Label className="font-mono-data text-[10px] uppercase">Timeline</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TIMELINES.map((t) => (
                      <button key={t} onClick={() => updateDraft({ timeline: t })} className={cn("border px-3 py-1.5 font-mono-data text-[10px] uppercase", draft.timeline === t ? "border-signal bg-signal/10 text-signal" : "border-hairline")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-bold">Project Category</h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setCategory(c)} className={cn("border p-3 text-left text-sm transition-colors", draft.category === c ? "border-signal bg-signal/10" : "border-hairline hover:bg-background")}>
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-bold">Stakeholders</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {STAKEHOLDERS.map((s) => (
                    <button key={s} onClick={() => toggleStakeholder(s)} className={cn("border px-3 py-2 font-mono-data text-[10px] uppercase", draft.stakeholders?.includes(s) ? "border-signal bg-signal text-white" : "border-hairline")}>
                      {s}
                    </button>
                  ))}
                </div>
                {errors.stakeholders && <p className="mt-2 text-xs text-negative">{errors.stakeholders}</p>}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <h2 className="font-display text-xl font-bold">Review & Launch</h2>
                <div className="border border-hairline bg-background p-4 text-sm space-y-2">
                  <p><span className="text-ink-muted">Name:</span> {draft.title}</p>
                  <p><span className="text-ink-muted">Category:</span> {draft.category}</p>
                  <p><span className="text-ink-muted">Location:</span> {draft.location}</p>
                  <p><span className="text-ink-muted">Budget:</span> {formatBudgetCrore(draft.budget ?? 800)}</p>
                  <p><span className="text-ink-muted">Timeline:</span> {draft.timeline}</p>
                  <p><span className="text-ink-muted">Stakeholders:</span> {draft.stakeholders?.join(", ")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between border-t border-hairline px-6 py-4">
          <button onClick={() => { reset(); setWizardOpen(false); }} className="font-mono-data text-[10px] uppercase text-ink-muted hover:text-ink">
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={back} className="border border-hairline px-4 py-2 font-mono-data text-[10px] uppercase">
                Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={next} className="border border-signal bg-signal px-4 py-2 font-mono-data text-[10px] uppercase text-white">
                Continue →
              </button>
            ) : (
              <button onClick={launch} className="border border-signal bg-signal px-4 py-2 font-mono-data text-[10px] uppercase text-white">
                Launch Simulation →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
