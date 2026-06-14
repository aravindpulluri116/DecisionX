"use client";

import { ShieldCheck } from "lucide-react";
import type { EvidencePack } from "@/types/evidence";
import { ConfidenceBadge } from "@/components/workspace/evidence/ConfidenceBadge";
import { AGENT_AGREEMENT_LABELS, DATA_AVAILABILITY_LABELS } from "@/lib/trust/labels";
import { cn } from "@/lib/utils";

type ReportTrustStripProps = {
  trustSummary: EvidencePack["trustSummary"];
  compact?: boolean;
};

export function ReportTrustStrip({ trustSummary, compact }: ReportTrustStripProps) {
  const { confidenceBasis } = trustSummary;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-signal" />
        <ConfidenceBadge level={trustSummary.overallConfidenceLevel} compact />
        <span className="rounded-full border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide text-ink-muted">
          {DATA_AVAILABILITY_LABELS[confidenceBasis.dataAvailability]}
        </span>
        <span className="rounded-full border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide text-ink-muted">
          {AGENT_AGREEMENT_LABELS[confidenceBasis.agentAgreement]}
        </span>
        <span className="rounded-full border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide text-ink-muted">
          {confidenceBasis.evidenceCount} signals
        </span>
        {confidenceBasis.unknownCount > 0 && (
          <span className="rounded-full border border-warning/30 bg-warning/8 px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide text-warning">
            {confidenceBasis.unknownCount} unknowns
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-signal/20 bg-surface px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs leading-snug text-ink-muted">{trustSummary.predictionReliability}</p>
          <div className="flex flex-wrap gap-2">
            <TrustPill>{DATA_AVAILABILITY_LABELS[confidenceBasis.dataAvailability]}</TrustPill>
            <TrustPill>{AGENT_AGREEMENT_LABELS[confidenceBasis.agentAgreement]}</TrustPill>
            <TrustPill>{confidenceBasis.evidenceCount} evidence signals</TrustPill>
            {confidenceBasis.unknownCount > 0 && (
              <TrustPill className="border-warning/30 bg-warning/8 text-warning">
                {confidenceBasis.unknownCount} unknowns
              </TrustPill>
            )}
          </div>
        </div>
        <ConfidenceBadge level={trustSummary.overallConfidenceLevel} compact />
      </div>
    </div>
  );
}

function TrustPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border border-hairline bg-background px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-wide text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
