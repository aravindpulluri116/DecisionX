"use client";

import { ShieldCheck } from "lucide-react";
import type { EvidencePack } from "@/types/evidence";
import { ConfidenceBadge, ConfidenceMeter } from "./ConfidenceBadge";
import { CONFIDENCE_DESCRIPTIONS } from "@/lib/evidence/confidence";
import { ScrollArea } from "@/components/ui/scroll-area";

type TrustPanelProps = {
  pack: EvidencePack;
  onSelectImpact?: (metric: EvidencePack["impactExplanations"][0]["metric"]) => void;
  onSelectAgent?: (agentId: EvidencePack["agentTransparency"][0]["agentId"]) => void;
};

export function TrustPanel({ pack, onSelectImpact, onSelectAgent }: TrustPanelProps) {
  const { trustSummary, agentTransparency, impactExplanations } = pack;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-hairline bg-background/60 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              Prediction reliability
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{trustSummary.predictionReliability}</p>
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">
              {CONFIDENCE_DESCRIPTIONS[trustSummary.overallConfidenceLevel]}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ConfidenceMeter
            score={trustSummary.overallConfidence}
            level={trustSummary.overallConfidenceLevel}
            label="Overall confidence"
          />
        </div>
        <p className="mt-3 rounded-lg border border-warning/20 bg-warning/5 px-2.5 py-2 text-[10px] leading-snug text-ink-muted">
          {trustSummary.disclaimer}
        </p>
      </section>

      <section>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Evidence sources
        </p>
        <ul className="space-y-1">
          {trustSummary.evidenceSources.map((source) => (
            <li
              key={source}
              className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-[11px] text-ink"
            >
              {source}
            </li>
          ))}
        </ul>
      </section>

      {trustSummary.assumptions.length > 0 && (
        <section>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Key assumptions
          </p>
          <ul className="space-y-1">
            {trustSummary.assumptions.slice(0, 5).map((a) => (
              <li key={a} className="text-[11px] leading-snug text-ink-muted">
                · {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Agent transparency ({agentTransparency.length})
        </p>
        <ScrollArea className="max-h-48">
          <div className="space-y-1.5 pr-2">
            {agentTransparency.map((agent) => (
              <button
                key={agent.agentId}
                type="button"
                onClick={() => onSelectAgent?.(agent.agentId)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-surface px-2.5 py-2 text-left transition-colors hover:border-signal/30 hover:bg-signal/5"
              >
                <span className="truncate text-[11px] font-medium text-ink">{agent.label}</span>
                <ConfidenceBadge level={agent.confidenceLevel} score={agent.confidence} compact />
              </button>
            ))}
          </div>
        </ScrollArea>
      </section>

      <section>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Impact scores — tap to inspect
        </p>
        <div className="space-y-1">
          {impactExplanations.map((exp) => (
            <button
              key={exp.metric}
              type="button"
              onClick={() => onSelectImpact?.(exp.metric)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-hairline px-2.5 py-2 text-left transition-colors hover:border-signal/30 hover:bg-signal/5"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-ink">{exp.label}</p>
                <p className="truncate text-[10px] text-ink-muted">{exp.evidence[0]?.title ?? exp.reasoning.slice(0, 48)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono-data text-sm tabular-nums text-signal">{exp.score}</p>
                <ConfidenceBadge level={exp.confidenceLevel} compact />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
