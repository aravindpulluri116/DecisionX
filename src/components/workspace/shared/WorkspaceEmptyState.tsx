"use client";

import { motion } from "framer-motion";

type WorkspaceEmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function WorkspaceEmptyState({
  title = "No simulation selected",
  description = "Select a saved simulation from the navigator, or build a new scenario to visualize consequence chains.",
  actionLabel = "Build scenario",
  onAction,
}: WorkspaceEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <svg
          viewBox="0 0 200 120"
          className="mx-auto mb-8 h-24 w-40 text-ink-muted/40"
          aria-hidden
        >
          <circle cx="30" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="90" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="170" cy="60" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M42 60 L88 35 M42 60 L88 85 M112 35 L158 55 M112 85 L158 65"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          ◢ decision canvas / idle
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="mt-6 inline-flex items-center gap-2 border border-signal bg-signal px-5 py-2.5 font-mono-data text-[11px] uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
          >
            {actionLabel}
            <span aria-hidden>→</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
