"use client";

import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/simulation";
import type { ConfidenceBasis } from "@/lib/trust/deriveConfidence";
import { CONFIDENCE_LABELS, CONFIDENCE_STYLES } from "@/lib/evidence/confidence";
import { AGENT_AGREEMENT_LABELS, DATA_AVAILABILITY_LABELS } from "@/lib/trust/labels";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
  compact?: boolean;
  className?: string;
};

export function ConfidenceBadge({ level, compact, className }: ConfidenceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono-data uppercase tracking-wide",
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]",
        CONFIDENCE_STYLES[level].badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", CONFIDENCE_STYLES[level].dot)} />
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}

type ConfidenceBasisPanelProps = {
  level: ConfidenceLevel;
  basis: ConfidenceBasis;
  label?: string;
};

export function ConfidenceBasisPanel({ level, basis, label = "Confidence basis" }: ConfidenceBasisPanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">{label}</span>
        <ConfidenceBadge level={level} compact />
      </div>
      <ul className="space-y-1 rounded-lg border border-hairline bg-background/60 px-3 py-2 text-[11px] text-ink-muted">
        <li>· Data: {DATA_AVAILABILITY_LABELS[basis.dataAvailability]}</li>
        <li>· Agents: {AGENT_AGREEMENT_LABELS[basis.agentAgreement]}</li>
        <li>· Evidence signals: {basis.evidenceCount}</li>
        <li>· Known unknowns: {basis.unknownCount}</li>
      </ul>
    </div>
  );
}

/** @deprecated Use ConfidenceBasisPanel — kept for gradual migration */
export function ConfidenceMeter({ level, basis }: { level: ConfidenceLevel; basis: ConfidenceBasis; label?: string }) {
  return <ConfidenceBasisPanel level={level} basis={basis} />;
}
