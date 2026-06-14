"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkspaceEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tags?: string[];
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function WorkspaceEmptyState({
  icon: Icon,
  title,
  description,
  tags,
  action,
  footer,
  className,
}: WorkspaceEmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mesh-bg absolute inset-0 opacity-50" />
      <div className="relative max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-signal/10">
          <Icon className="h-7 w-7 text-signal" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{description}</p>

        {tags && tags.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-hairline bg-surface/80 px-3 py-1 font-mono-data text-[9px] uppercase tracking-[0.15em] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {action && <div className="mt-8">{action}</div>}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
