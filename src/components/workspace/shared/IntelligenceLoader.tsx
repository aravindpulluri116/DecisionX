"use client";

/** Shown while heavy workspace panels load (dynamic import fallback). */
export function IntelligenceLoader() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/92 backdrop-blur-md">
      <div className="relative w-72 overflow-hidden rounded-xl border border-hairline bg-surface p-7 shadow-[0_16px_48px_oklch(0.18_0.045_264/0.1)] glow-signal">
        <div className="absolute inset-x-0 top-0 h-0.5 animate-dx-scan bg-gradient-to-r from-transparent via-signal to-transparent" />
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Intelligence engine
        </p>
        <p className="mt-3 font-display text-lg font-semibold text-ink">Loading…</p>
        <div className="relative mx-auto mt-6 h-10 w-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-signal/20 border-t-signal" />
          <div className="absolute inset-0 animate-dx-pulse rounded-full border border-signal/25" />
        </div>
      </div>
    </div>
  );
}
