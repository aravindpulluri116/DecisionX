"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { ArrowRightLeft, Crown, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { formatBudgetCrore } from "@/lib/format/currency";
import {
  buildMetricComparisons,
  summarizeTradeoffs,
  type ProjectedAlternative,
} from "@/lib/workspace/alternative-projection";
import { getProjectViability } from "@/lib/scoring/viability";
import { getDecisionVerdict } from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";
import type { ImpactScores, Scenario } from "@/types/workspace";
import { ReportPanel } from "../report/ReportPanel";

type ComparePlanBProps = {
  scenario: Scenario & { impact_scores: ImpactScores };
  alternative: ProjectedAlternative;
  projectionSource?: "ai" | "heuristic";
  isRefining?: boolean;
  onSimulateAlternative: () => void;
};

export function ComparePlanB({
  scenario,
  alternative,
  projectionSource,
  isRefining,
  onSimulateAlternative,
}: ComparePlanBProps) {
  const currentViability = getProjectViability(scenario.impact_scores) ?? 0;
  const comparisons = buildMetricComparisons(scenario.impact_scores, alternative.scores);
  const { alternativeWins, currentWins } = summarizeTradeoffs(comparisons);

  const alternativeLeads = alternative.viability > currentViability;
  const tied = alternative.viability === currentViability;

  const chartData = comparisons.map((c) => ({
    name: c.label.split(" ")[0],
    current: c.current,
    alternative: c.alternative,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
          alternativeLeads
            ? "border-positive/35 bg-positive/8"
            : tied
              ? "border-signal/25 bg-signal/5"
              : "border-warning/30 bg-warning/8",
        )}
      >
        <div className="flex items-center gap-2">
          <Crown
            className={cn(
              "h-5 w-5",
              alternativeLeads ? "text-positive" : tied ? "text-signal" : "text-warning",
            )}
          />
          <p className="text-sm font-medium text-ink">
            {alternative.tradeoffSummary ??
              (alternativeLeads
                ? `Plan B leads by ${alternative.viability - currentViability} viability points`
                : tied
                  ? "Current plan and Plan B tie on projected viability"
                  : `Current plan leads — Plan B projects ${currentViability - alternative.viability} points lower`)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isRefining && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/30 bg-signal/10 px-2.5 py-0.5 font-mono-data text-[9px] uppercase tracking-wider text-signal">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
              Claude refining…
            </span>
          )}
          <span className="rounded-full border border-hairline bg-surface px-2.5 py-0.5 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
            {projectionSource === "ai"
              ? "Claude projection"
              : isRefining
                ? "Quick estimate · refining"
                : "Quick estimate"}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-hairline shadow-sm">
        <div className="grid gap-px bg-hairline lg:grid-cols-2">
          <CompareSideCard
            label="Current plan"
            sublabel="Simulated"
            title={scenario.title}
            budget={scenario.params.budget}
            timeline={scenario.params.timeline}
            viability={currentViability}
            accent="signal"
            highlighted={!alternativeLeads && !tied}
          />
          <CompareSideCard
            label="Recommended Plan B"
            sublabel="CDO alternative"
            title={alternative.name}
            budget={alternative.budgetCrore ?? scenario.params.budget}
            budgetLabel={alternative.budgetLabel}
            timeline={alternative.timeline ?? scenario.params.timeline}
            viability={alternative.viability}
            accent="environmental"
            highlighted={alternativeLeads}
            highlightLabel={
              alternative.recommendedOverCurrent === false ? "Consider" : "Recommended"
            }
            projected
          />
        </div>
      </div>

      <ReportPanel label="Impact comparison" hint="Simulated vs projected">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={2}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 100]} hide />
              <ReferenceLine y={50} stroke="var(--hairline)" strokeDasharray="3 3" />
              <Bar dataKey="current" name="Current" fill="var(--signal)" radius={[2, 2, 0, 0]} maxBarSize={14} />
              <Bar dataKey="alternative" name="Plan B" fill="var(--environmental)" radius={[2, 2, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-signal" /> Current (simulated)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-environmental" /> Plan B (projected)
          </span>
        </div>
      </ReportPanel>

      <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
        <ReportPanel label="Plan B advantages" hint={`${alternativeWins.length} metrics`}>
          {alternativeWins.length === 0 ? (
            <p className="text-xs text-ink-muted">No clear metric advantages projected.</p>
          ) : (
            <ul className="space-y-2">
              {alternativeWins.slice(0, 4).map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-2 rounded-lg bg-positive/5 px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-xs text-ink">
                    <TrendingUp className="h-3 w-3 text-positive" />
                    {c.label}
                  </span>
                  <span className="font-display text-sm font-bold tabular-nums text-positive">+{c.delta}</span>
                </li>
              ))}
            </ul>
          )}
        </ReportPanel>

        <ReportPanel label="Current plan keeps edge" hint={`${currentWins.length} metrics`}>
          {currentWins.length === 0 ? (
            <p className="text-xs text-ink-muted">Plan B matches or beats on all dimensions.</p>
          ) : (
            <ul className="space-y-2">
              {currentWins.slice(0, 4).map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-2 rounded-lg bg-signal/5 px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-xs text-ink">
                    <TrendingDown className="h-3 w-3 text-signal" />
                    {c.label}
                  </span>
                  <span className="font-display text-sm font-bold tabular-nums text-signal">
                    {Math.abs(c.delta)} pt lead
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ReportPanel>
      </div>

      {alternative.bullets.length > 0 && (
        <ReportPanel
          label="Why Plan B"
          hint={projectionSource === "ai" ? "Claude analysis" : "From CDO synthesis"}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {alternative.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-hairline bg-background/50 px-3 py-2 text-xs leading-snug text-ink-muted"
              >
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-environmental" />
                {bullet}
              </li>
            ))}
          </ul>
        </ReportPanel>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSimulateAlternative}
          className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white shadow-[0_2px_12px_oklch(0.52_0.22_262/0.3)] hover:brightness-110"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Simulate Plan B
        </button>
        <p className="text-xs text-ink-muted">
          Creates a scenario from this alternative for a full multi-agent run.
        </p>
      </div>
    </motion.div>
  );
}

function CompareSideCard({
  label,
  sublabel,
  title,
  budget,
  budgetLabel,
  timeline,
  viability,
  accent,
  highlighted,
  highlightLabel = "Recommended",
  projected,
}: {
  label: string;
  sublabel: string;
  title: string;
  budget: number;
  budgetLabel?: string;
  timeline: string;
  viability: number;
  accent: "signal" | "environmental";
  highlighted?: boolean;
  highlightLabel?: string;
  projected?: boolean;
}) {
  const verdict = getDecisionVerdict(viability);
  const accentBorder = accent === "signal" ? "border-signal/30" : "border-environmental/30";

  return (
    <div className={cn("bg-surface p-5", highlighted && "ring-1 ring-inset ring-positive/25")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          <p
            className={cn(
              "mt-0.5 text-[10px] font-medium uppercase",
              accent === "signal" ? "text-signal" : "text-environmental",
            )}
          >
            {sublabel}
          </p>
        </div>
        {highlighted && (
          <span className="rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 font-mono-data text-[8px] uppercase tracking-wider text-positive">
            {highlightLabel}
          </span>
        )}
        {projected && !highlighted && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono-data text-[8px] uppercase tracking-wider",
              accentBorder,
              "text-ink-muted",
            )}
          >
            Projected
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full border border-hairline bg-background px-2.5 py-0.5 text-[11px] font-medium text-ink">
          {budgetLabel ?? formatBudgetCrore(budget, { compact: true })}
        </span>
        <span className="rounded-full border border-hairline bg-background px-2.5 py-0.5 text-[11px] font-medium text-ink">
          {timeline}
        </span>
      </div>
      <div className="mt-4">
        <DecisionVerdictBanner score={viability} compact />
      </div>
      <p className="mt-2 font-mono-data text-[9px] uppercase tracking-wider text-ink-muted">{verdict.label}</p>
    </div>
  );
}
