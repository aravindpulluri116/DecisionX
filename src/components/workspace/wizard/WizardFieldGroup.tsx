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
};

export function WizardFieldGroup({
  label,
  htmlFor,
  error,
  helper,
  children,
  className,
}: WizardFieldGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted"
      >
        {label}
      </Label>
      {children}
      {helper && !error && (
        <p className="text-[11px] text-ink-muted">{helper}</p>
      )}
      {error && <p className="text-xs text-negative">{error}</p>}
    </div>
  );
}
