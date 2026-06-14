"use client";

import { cn } from "@/lib/utils";

type WorkspaceLoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export function WorkspaceLoadingState({
  message = "Loading workspace…",
  fullScreen = true,
  className,
}: WorkspaceLoadingStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 bg-background",
        fullScreen ? "h-screen" : "h-full min-h-[200px]",
        className,
      )}
    >
      <div className="mesh-bg absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-signal/20 border-t-signal" />
        <div className="absolute inset-0 animate-dx-pulse rounded-full border border-signal/25" />
      </div>
      <p className="relative font-mono-data text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        {message}
      </p>
    </div>
  );
}
