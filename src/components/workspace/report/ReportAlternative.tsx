"use client";

import { ArrowRightLeft, Sparkles, TrendingUp } from "lucide-react";
import type { ParsedAlternative } from "@/lib/workspace/report-formatters";
import { ReportPanel } from "./ReportPanel";

type ReportAlternativeProps = {
  alternative: ParsedAlternative;
};

export function ReportAlternative({ alternative }: ReportAlternativeProps) {
  return (
    <ReportPanel label="Plan B" hint="AI-suggested variant">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-signal/25 bg-signal/10">
          <ArrowRightLeft className="h-5 w-5 text-signal" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-ink">{alternative.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {alternative.budget && (
              <StatChip icon={Sparkles} label={alternative.budget} />
            )}
            {alternative.timeline && <StatChip label={alternative.timeline} />}
            {alternative.viabilityDelta && (
              <StatChip
                icon={TrendingUp}
                label={`${alternative.viabilityDelta.includes("+") ? alternative.viabilityDelta : `+${alternative.viabilityDelta}`} viability`}
                accent
              />
            )}
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {alternative.bullets.slice(0, 4).map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-hairline bg-background/50 px-3 py-2 text-xs leading-snug text-ink-muted"
              >
                <span className="font-mono-data text-[10px] font-bold text-signal">{i + 1}</span>
                <span className="line-clamp-2">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ReportPanel>
  );
}

function StatChip({
  label,
  icon: Icon,
  accent,
}: {
  label: string;
  icon?: typeof Sparkles;
  accent?: boolean;
}) {
  return (
    <span
      className={
        accent
          ? "inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-[11px] font-medium text-positive"
          : "inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-medium text-ink"
      }
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}
