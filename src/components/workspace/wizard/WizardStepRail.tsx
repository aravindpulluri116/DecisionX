"use client";

import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { n: 1, id: "define", label: "Define", hint: "Title & scope" },
  { n: 2, id: "location", label: "Location", hint: "Place & category" },
  { n: 3, id: "parameters", label: "Parameters", hint: "Budget & agents" },
  { n: 4, id: "launch", label: "Launch", hint: "Review & run" },
] as const;

export type WizardStep = 1 | 2 | 3 | 4;

type WizardStepRailProps = {
  current: WizardStep;
  className?: string;
  compact?: boolean;
};

export function WizardStepRail({ current, className, compact }: WizardStepRailProps) {
  const progress = ((current - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          New decision
        </p>
        <span className="rounded-full border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
          {current}/{WIZARD_STEPS.length}
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-gradient-to-r from-signal via-signal to-environmental transition-all duration-500 ease-out"
          style={{ width: `${Math.max(10, progress)}%` }}
        />
      </div>

      <nav
        className={cn(compact ? "mt-4 flex gap-2 overflow-x-auto pb-1" : "mt-8 space-y-0")}
        aria-label="Wizard steps"
      >
        {WIZARD_STEPS.map((step, index) => {
          const done = step.n < current;
          const active = step.n === current;
          return (
            <div key={step.id} className={cn("relative", !compact && index < WIZARD_STEPS.length - 1 && "pb-6")}>
              {!compact && index < WIZARD_STEPS.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[1.35rem] top-9 h-[calc(100%-1.5rem)] w-px",
                    done ? "bg-signal/40" : "bg-hairline",
                  )}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all",
                  compact && "min-w-[140px] shrink-0",
                  active && "bg-signal/8 ring-1 ring-signal/15",
                  done && !active && "opacity-80",
                )}
              >
                <span
                  className={cn(
                    "relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono-data text-[10px] font-semibold transition-colors",
                    active
                      ? "bg-signal text-white shadow-[0_2px_12px_oklch(0.52_0.22_262/0.35)]"
                      : done
                        ? "bg-ink text-background"
                        : "border border-hairline bg-surface text-ink-muted",
                  )}
                >
                  {done && !active ? "✓" : String(step.n).padStart(2, "0")}
                </span>
                <div className={cn("min-w-0 pt-0.5", compact && !active && "hidden sm:block")}>
                  <p
                    className={cn(
                      "font-display text-sm font-semibold leading-tight",
                      active ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  {!compact && <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{step.hint}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
