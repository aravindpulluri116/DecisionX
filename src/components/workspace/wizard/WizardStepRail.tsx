"use client";

import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { n: 1, id: "define", label: "Define", hint: "Title & scope" },
  { n: 2, id: "location", label: "Location", hint: "Place & category" },
  { n: 3, id: "parameters", label: "Parameters", hint: "Budget & AI stakeholders" },
  { n: 4, id: "launch", label: "Launch", hint: "Review & run" },
] as const;

export type WizardStep = 1 | 2 | 3 | 4;

type WizardStepRailProps = {
  current: WizardStep;
  className?: string;
};

export function WizardStepRail({ current, className }: WizardStepRailProps) {
  const progress = ((current - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        New decision
      </p>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-gradient-to-r from-signal to-environmental transition-all duration-500 ease-out"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>

      <nav className="mt-8 space-y-1" aria-label="Wizard steps">
        {WIZARD_STEPS.map((step) => {
          const done = step.n < current;
          const active = step.n === current;
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                active && "bg-signal/8",
                done && !active && "opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono-data text-[10px] font-medium",
                  active
                    ? "bg-signal text-white"
                    : done
                      ? "bg-ink text-surface"
                      : "border border-hairline bg-background text-ink-muted",
                )}
              >
                {done && !active ? "✓" : String(step.n).padStart(2, "0")}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "font-display text-sm font-semibold",
                    active ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-ink-muted">{step.hint}</p>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
