"use client";

import { ShieldCheck } from "lucide-react";
import type { EvidencePack } from "@/types/evidence";
import { ConfidenceBadge } from "@/components/workspace/evidence/ConfidenceBadge";
import { AGENT_AGREEMENT_LABELS, DATA_AVAILABILITY_LABELS } from "@/lib/trust/labels";

type ReportTrustStripProps = {
  trustSummary: EvidencePack["trustSummary"];
};

export function ReportTrustStrip({ trustSummary }: ReportTrustStripProps) {
  const { confidenceBasis } = trustSummary;

  return (
    <div className="rounded-xl border border-signal/20 bg-surface px-4 py-3">
      <div className="flex flex-wrap items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs leading-snug text-ink-muted">{trustSummary.predictionReliability}</p>
          <p className="font-mono-data text-[10px] text-ink-muted/80">
            {DATA_AVAILABILITY_LABELS[confidenceBasis.dataAvailability]} ·{" "}
            {AGENT_AGREEMENT_LABELS[confidenceBasis.agentAgreement]} · {confidenceBasis.evidenceCount}{" "}
            evidence signals · {confidenceBasis.unknownCount} known unknowns
          </p>
        </div>
        <ConfidenceBadge level={trustSummary.overallConfidenceLevel} compact />
      </div>
    </div>
  );
}
