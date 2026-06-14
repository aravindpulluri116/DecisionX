"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WizardFieldGroupProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: ReactNode;
  children: ReactNode;
  className?: string;
  required?: boolean;
};

export function WizardFieldGroup({
  label,
  htmlFor,
  error,
  helper,
  children,
  className,
  required,
}: WizardFieldGroupProps) {
  return (
    <div
      className={cn(
        "space-y-2.5 rounded-xl border border-hairline bg-surface/60 p-4 transition-colors",
        error && "border-negative/30 bg-negative/[0.02]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={htmlFor}
          className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted"
        >
          {label}
          {required && <span className="ml-1 text-signal">*</span>}
        </Label>
      </div>
      {children}
      {helper && !error && <p className="text-[11px] leading-relaxed text-ink-muted">{helper}</p>}
      {error && (
        <p className="rounded-md bg-negative/8 px-2.5 py-1.5 text-xs text-negative">{error}</p>
      )}
    </div>
  );
}
