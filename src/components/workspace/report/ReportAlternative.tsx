"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { ParsedAlternative } from "@/lib/workspace/report-formatters";

type ReportAlternativeProps = {
  alternative: ParsedAlternative;
};

export function ReportAlternative({ alternative }: ReportAlternativeProps) {
  return (
    <section className="rounded-xl border border-signal/25 bg-gradient-to-br from-signal/8 to-surface p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-signal" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Suggested alternative</h2>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold text-ink">{alternative.name}</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {alternative.budget && (
          <span className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-medium text-ink">
            {alternative.budget}
          </span>
        )}
        {alternative.timeline && (
          <span className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-medium text-ink">
            {alternative.timeline}
          </span>
        )}
        {alternative.viabilityDelta && (
          <span className="rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-[11px] font-medium text-positive">
            {alternative.viabilityDelta.includes("+") ? alternative.viabilityDelta : `+${alternative.viabilityDelta}`}{" "}
            viability
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {alternative.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-snug text-ink-muted">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-signal" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
