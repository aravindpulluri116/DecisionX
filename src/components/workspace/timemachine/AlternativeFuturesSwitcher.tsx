"use client";

import { motion } from "framer-motion";
import type { FutureBranch } from "@/types/timemachine";
import { cn } from "@/lib/utils";

const BRANCHES: { id: FutureBranch; label: string }[] = [
  { id: "bestCase", label: "Best Case" },
  { id: "expectedCase", label: "Expected" },
  { id: "worstCase", label: "Worst Case" },
];

type AlternativeFuturesSwitcherProps = {
  active: FutureBranch;
  onChange: (b: FutureBranch) => void;
};

export function AlternativeFuturesSwitcher({ active, onChange }: AlternativeFuturesSwitcherProps) {
  return (
    <div className="flex gap-px border border-hairline bg-hairline">
      {BRANCHES.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(b.id)}
          className={cn(
            "px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.12em] transition-colors",
            active === b.id ? "bg-signal text-white" : "bg-surface text-ink-muted hover:text-ink",
          )}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
