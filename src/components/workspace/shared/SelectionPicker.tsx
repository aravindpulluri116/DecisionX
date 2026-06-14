"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectionPickerItem = {
  id: string;
  label: string;
  initials: string;
  description: string;
  color: string;
  aiSuggested?: boolean;
};

type AiInsightBannerProps = {
  loading?: boolean;
  loadingLabel?: string;
  title?: string;
  rationale?: string | null;
  variant?: "light" | "dark";
};

export function AiInsightBanner({
  loading,
  loadingLabel = "AI analyzing…",
  title = "AI suggested for this project",
  rationale,
  variant = "light",
}: AiInsightBannerProps) {
  if (!loading && !rationale) return null;

  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3",
        variant === "dark" ? "border-signal/30 bg-signal/10" : "border-signal/25 bg-signal/[0.04]",
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles
          className={cn("h-3.5 w-3.5 text-signal", loading && "animate-pulse")}
        />
        <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-signal">
          {loading ? loadingLabel : title}
        </p>
      </div>
      {loading ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-xl bg-hairline/80" />
          ))}
        </div>
      ) : (
        rationale && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{rationale}</p>
        )
      )}
    </div>
  );
}

type SelectionPickerGridProps = {
  items: SelectionPickerItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
  minSelected?: number;
  columns?: 2 | 3;
};

export function SelectionPickerGrid({
  items,
  selectedIds,
  onToggle,
  disabled,
  minSelected = 1,
  columns = 3,
}: SelectionPickerGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {items.map((item) => {
        const isOn = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(item.id)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-all",
              isOn
                ? "border-signal/40 bg-signal/[0.06] shadow-sm ring-1 ring-signal/15"
                : "border-hairline bg-background opacity-60 hover:border-signal/20 hover:opacity-90",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono-data text-[10px] font-bold text-white"
                style={{
                  backgroundColor: isOn ? item.color : "oklch(0.48 0.028 258 / 0.35)",
                }}
              >
                {item.initials}
              </span>
              <span className="flex items-center gap-1.5">
                {item.aiSuggested && (
                  <span className="rounded bg-signal/12 px-1.5 py-0.5 font-mono-data text-[8px] uppercase tracking-wider text-signal">
                    AI
                  </span>
                )}
                {isOn && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </span>
            </span>
            <span className="font-mono-data text-[9px] uppercase tracking-[0.16em] text-ink-muted">
              {item.label}
            </span>
            <span className="text-[11px] leading-snug text-ink">{item.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SelectionPickerFootnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-hairline bg-background/60 px-3 py-2 text-xs leading-relaxed text-ink-muted">
      {children}
    </p>
  );
}

export function createToggleHandler(
  selectedIds: string[],
  onChange: (ids: string[]) => void,
  minSelected = 1,
) {
  return (id: string) => {
    const isOn = selectedIds.includes(id);
    if (isOn && selectedIds.length <= minSelected) return;
    onChange(isOn ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };
}
