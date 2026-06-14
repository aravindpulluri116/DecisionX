"use client";

import { Zap } from "lucide-react";
import type { EvidencePack } from "@/types/evidence";
import { linkStrengthLabel } from "@/lib/evidence/buildEvidencePack";
import { truncateText } from "@/lib/workspace/impact-metrics";
import { ConfidenceBadge } from "@/components/workspace/evidence/ConfidenceBadge";
import { ReportPanel } from "./ReportPanel";

type ReportConsequencesProps = {
  items: EvidencePack["consequenceExplanations"];
  onSelect: (nodeId: string) => void;
};

export function ReportConsequences({ items, onSelect }: ReportConsequencesProps) {
  if (!items.length) return null;

  return (
    <ReportPanel label="Projected consequences" hint="Tap for agent reasoning">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((c) => (
          <button
            key={c.nodeId}
            type="button"
            onClick={() => onSelect(c.nodeId)}
            className="group flex flex-col rounded-xl border border-hairline bg-background/50 p-3 text-left transition-all hover:border-signal/35 hover:bg-signal/5 hover:shadow-[0_4px_16px_oklch(0.52_0.22_262/0.06)]"
          >
            <div className="flex items-start justify-between gap-2">
              <Zap className="h-4 w-4 shrink-0 text-signal group-hover:scale-110 transition-transform" />
              <ConfidenceBadge level={c.confidenceLevel} compact />
            </div>
            <h3 className="mt-2 text-sm font-semibold leading-snug text-ink">{c.label}</h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-muted">
              {truncateText(c.reason, 90)}
            </p>
            {c.linkStrength && (
              <span className="mt-2 font-mono-data text-[8px] uppercase tracking-wider text-ink-muted/70">
                {linkStrengthLabel(c.linkStrength)}
              </span>
            )}
          </button>
        ))}
      </div>
    </ReportPanel>
  );
}
