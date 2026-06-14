"use client";

import { cn } from "@/lib/utils";

type ReportPanelProps = {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function ReportPanel({ label, hint, className, children }: ReportPanelProps) {
  return (
    <div className={cn("bg-surface p-4 md:p-5", className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            ◣ {label}
          </p>
          {hint && <p className="mt-0.5 text-[10px] text-ink-muted/70">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
