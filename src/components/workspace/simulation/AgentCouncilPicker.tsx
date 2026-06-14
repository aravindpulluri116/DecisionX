"use client";

import { Check } from "lucide-react";
import { SPECIALIST_AGENTS } from "@/lib/marketing/agents";
import { defaultSelectedSpecialists } from "@/lib/agents/selection";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/types/simulation";

type Props = {
  value: AgentId[];
  onChange: (ids: AgentId[]) => void;
  disabled?: boolean;
  className?: string;
};

export function AgentCouncilPicker({ value, onChange, disabled, className }: Props) {
  const selected = value.length > 0 ? value : defaultSelectedSpecialists();

  const toggle = (id: AgentId) => {
    if (disabled) return;
    const isOn = selected.includes(id);
    if (isOn && selected.length <= 1) return;
    onChange(isOn ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SPECIALIST_AGENTS.map((agent) => {
          const isOn = selected.includes(agent.id);
          return (
            <button
              key={agent.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(agent.id)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-all",
                isOn
                  ? "border-signal/40 bg-signal/[0.06] shadow-sm ring-1 ring-signal/15"
                  : "border-hairline bg-background opacity-55 hover:opacity-80",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                  style={{ backgroundColor: isOn ? agent.color : "oklch(0.48 0.028 258 / 0.35)" }}
                >
                  {agent.shortLabel.slice(0, 2).toUpperCase()}
                </span>
                {isOn && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
                {agent.shortLabel}
              </span>
              <span className="text-[11px] leading-snug text-ink">{agent.tagline}</span>
            </button>
          );
        })}
      </div>
      <p className="rounded-lg border border-dashed border-hairline bg-background/60 px-3 py-2 text-xs text-ink-muted">
        Chief Decision Officer always convenes after your selected specialists finish — the council
        animation shows only the agents you pick here.
      </p>
    </div>
  );
}
