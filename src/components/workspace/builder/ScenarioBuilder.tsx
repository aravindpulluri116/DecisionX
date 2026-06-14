"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useStartSimulation } from "@/hooks/useStartSimulation";
import { useGeoEnrichmentPreview } from "@/hooks/useGeoQueries";
import { toDecisionProject } from "@/lib/services/projectService";
import type { Project, ScenarioParams } from "@/types/workspace";
import { BUDGET_UNIT_SHORT } from "@/lib/format/currency";

type ScenarioBuilderProps = {
  project: Project;
  onScenarioCreated: (scenarioId: string) => void;
};

function PremiumSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3 rounded-xl border border-hairline bg-background p-4 shadow-sm">
      <div className="flex items-end justify-between">
        <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
          {label}
        </Label>
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="font-display text-2xl font-bold tabular-nums text-ink"
        >
          {value}
          <span className="ml-1 text-sm font-normal text-ink-muted">{unit}</span>
        </motion.span>
      </div>
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-y-0 left-0 rounded-lg bg-signal/20 transition-all" style={{ width: `${pct}%` }} />
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="relative"
        />
      </div>
    </div>
  );
}

export function ScenarioBuilder({ project, onScenarioCreated }: ScenarioBuilderProps) {
  const builderOpen = useWorkspaceStore((s) => s.builderOpen);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const startSimulation = useStartSimulation();

  const [title, setTitle] = useState(`${project.title} — Simulation`);
  const [budget, setBudget] = useState(800);
  const [population, setPopulation] = useState(2.4);
  const [location, setLocation] = useState(project.location);
  const [timeline, setTimeline] = useState("10 years");
  const [projectType, setProjectType] = useState(project.project_type);
  const [policyType, setPolicyType] = useState("Infrastructure");

  const { data: locationPreview } = useGeoEnrichmentPreview(location);

  const handleSave = async () => {
    const params: ScenarioParams = {
      budget,
      population,
      location,
      timeline,
      projectType,
      policyType,
    };

    setBuilderOpen(false);

    const decisionProject = toDecisionProject(project);
    decisionProject.budget = budget;
    decisionProject.location = location;
    decisionProject.timeline = timeline;
    if (locationPreview?.coords) {
      decisionProject.geo = {
        coords: locationPreview.coords,
        address: locationPreview.address,
      };
    }

    await startSimulation({
      project: decisionProject,
      params,
      scenarioTitle: title,
      navigateOnComplete: false,
    });

    const scenario = useWorkspaceStore.getState().selectedScenario;
    if (scenario) onScenarioCreated(scenario.id);
  };

  return (
    <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
      <SheetContent side="left" className="w-full overflow-y-auto border-hairline bg-surface/95 sm:max-w-lg">
        <div className="border-b border-hairline bg-signal/[0.03] pb-4">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-signal">
            Scenario builder
          </p>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-hairline">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-signal to-environmental" />
          </div>
        </div>
        <SheetHeader className="pt-4">
          <SheetTitle className="font-display text-xl">New simulation</SheetTitle>
          <SheetDescription className="text-ink-muted">
            Configure parameters for {project.title}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em]">
              Simulation name
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <PremiumSlider
            label="Budget"
            value={budget}
            min={100}
            max={3000}
            step={50}
            unit={BUDGET_UNIT_SHORT}
            onChange={setBudget}
          />
          <PremiumSlider
            label="Population"
            value={population}
            min={0.5}
            max={5}
            step={0.1}
            unit="M"
            onChange={setPopulation}
          />

          <div className="space-y-2">
            <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em]">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Hyderabad", "Telangana", "Bangalore", "Mumbai"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {locationPreview && (
              <div className="rounded-lg border border-hairline bg-background/80 px-3 py-2 font-mono-data text-[10px] text-ink-muted">
                {locationPreview.scores.infrastructureScore}/100 infrastructure ·{" "}
                {locationPreview.radiusImpacts.find((r) => r.radiusKm === 5)?.schools ?? 0} schools (5km)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em]">
              Timeline
            </Label>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2 years", "5 years", "10 years", "15 years"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em]">
              Project Type
            </Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Infrastructure", "Land Use", "Transit Policy", "Aviation"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono-data text-[10px] uppercase tracking-[0.15em]">
              Policy Type
            </Label>
            <Select value={policyType} onValueChange={setPolicyType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Transit", "Industrial", "Pricing", "Roads", "Aviation"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSave}
            className="mt-4 w-full rounded-lg border border-signal bg-signal py-3 font-mono-data text-[11px] uppercase tracking-[0.15em] text-white shadow-[0_4px_20px_oklch(0.52_0.22_262/0.3)] transition-all hover:brightness-110"
          >
            Run Analysis →
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
