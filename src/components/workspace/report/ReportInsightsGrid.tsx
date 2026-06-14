"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, GitBranch } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { severityTone } from "@/lib/workspace/report-formatters";
import { truncateText } from "@/lib/workspace/impact-metrics";
import type { ParsedRisk } from "@/lib/workspace/report-formatters";
import type { StakeholderTrustView } from "@/lib/trust/stakeholderSentiment";
import type { StakeholderSentiment } from "@/types/simulation";
import { sentimentLabel } from "@/lib/trust/stakeholderSentiment";
import { ReportPanel } from "./ReportPanel";

type ReportInsightsGridProps = {
  stakeholderView: StakeholderTrustView | null;
  stakeholderSummary: string;
  risks: ParsedRisk[];
  consequenceSteps: string[];
};

const SENTIMENT_BAR: Record<StakeholderSentiment, { v: number; fill: string }> = {
  strong_support: { v: 92, fill: "var(--positive)" },
  moderate_support: { v: 74, fill: "var(--positive)" },
  mixed_sentiment: { v: 52, fill: "var(--warning)" },
  concerned: { v: 42, fill: "var(--warning)" },
  moderate_opposition: { v: 28, fill: "var(--negative)" },
  strong_opposition: { v: 12, fill: "var(--negative)" },
};

const SENTIMENT_CHIP: Record<string, string> = {
  strong_support: "text-positive bg-positive/10 border-positive/25",
  moderate_support: "text-positive/90 bg-positive/5 border-positive/20",
  mixed_sentiment: "text-warning bg-warning/10 border-warning/25",
  moderate_opposition: "text-negative/90 bg-negative/5 border-negative/20",
  strong_opposition: "text-negative bg-negative/10 border-negative/25",
  concerned: "text-warning bg-warning/8 border-warning/20",
};

export function ReportInsightsGrid({
  stakeholderView,
  stakeholderSummary,
  risks,
  consequenceSteps,
}: ReportInsightsGridProps) {
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

  const chartData =
    stakeholderView?.groups.slice(0, 6).map((g) => ({
      name: g.group.length > 14 ? `${g.group.slice(0, 12)}…` : g.group,
      fullName: g.group,
      v: SENTIMENT_BAR[g.sentiment]?.v ?? 50,
      fill: SENTIMENT_BAR[g.sentiment]?.fill ?? "var(--signal)",
      sentiment: g.sentiment,
    })) ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-hairline shadow-sm">
      <div className="grid gap-px bg-hairline lg:grid-cols-12">
        <ReportPanel
          label="Stakeholders"
          hint={stakeholderView ? stakeholderView.supportTrendLabel : "Qualitative estimate"}
          className="lg:col-span-5"
        >
          {stakeholderView && chartData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <Bar dataKey="v" radius={[2, 2, 0, 0]} maxBarSize={32}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {stakeholderView.groups.slice(0, 4).map((g) => (
                  <li
                    key={g.group}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      SENTIMENT_CHIP[g.sentiment] ?? SENTIMENT_CHIP.mixed_sentiment,
                    )}
                    title={g.group}
                  >
                    {g.group.split(" ")[0]} · {sentimentLabel(g.sentiment)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm leading-snug text-ink-muted">{truncateText(stakeholderSummary, 120)}</p>
          )}
        </ReportPanel>

        <ReportPanel label="Risk radar" hint="Tap to expand" className="lg:col-span-3">
          <ul className="space-y-1.5">
            {risks.slice(0, 4).map((risk, i) => {
              const tone = severityTone(risk.severity);
              const toneClass =
                tone === "negative"
                  ? "border-negative/40 bg-negative/10 text-negative"
                  : tone === "warning"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-signal/40 bg-signal/10 text-signal";
              const open = expandedRisk === i;
              return (
                <li key={`${risk.category}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedRisk(open ? null : i)}
                    className={cn(
                      "w-full rounded-lg border border-hairline px-2.5 py-2 text-left transition-colors hover:border-signal/25",
                      open && "border-signal/30 bg-signal/5",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-negative" />
                      <span className={cn("rounded px-1 py-0.5 text-[8px] font-bold uppercase", toneClass)}>
                        {risk.severity.slice(0, 4)}
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium text-ink">{risk.category}</span>
                    </div>
                    {open && (
                      <p className="mt-1.5 text-[11px] leading-snug text-ink-muted">{risk.description}</p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </ReportPanel>

        <ReportPanel label="Consequence chain" className="lg:col-span-4">
          <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
            {consequenceSteps.slice(0, 5).map((step, i) => (
              <div key={i} className="flex min-w-[100px] max-w-[140px] shrink-0 items-center gap-1">
                <div className="flex h-full flex-1 flex-col rounded-lg border border-signal/25 bg-signal/5 p-2">
                  <span className="font-mono-data text-[8px] uppercase tracking-wider text-signal">
                    Step {i + 1}
                  </span>
                  <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-ink">
                    {truncateText(step, 72)}
                  </p>
                </div>
                {i < consequenceSteps.length - 1 && i < 4 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-ink-muted/40" aria-hidden />
                )}
              </div>
            ))}
          </div>
          {consequenceSteps.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <GitBranch className="h-4 w-4" />
              No cascade modeled yet
            </div>
          )}
        </ReportPanel>
      </div>
    </div>
  );
}
