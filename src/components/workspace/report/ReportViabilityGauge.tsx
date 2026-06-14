"use client";

import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { getDecisionVerdict, TONE_STYLES } from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";

type ReportViabilityGaugeProps = {
  score: number;
  className?: string;
};

export function ReportViabilityGauge({ score, className }: ReportViabilityGaugeProps) {
  const verdict = getDecisionVerdict(score);
  const styles = TONE_STYLES[verdict.tone];
  const fill =
    verdict.tone === "positive"
      ? "var(--positive)"
      : verdict.tone === "warning"
        ? "var(--warning)"
        : verdict.tone === "negative"
          ? "var(--negative)"
          : "var(--signal)";

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[200px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={[{ v: score, fill }]}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="v" background={{ fill: "var(--hairline)" }} cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl font-bold tabular-nums md:text-5xl", styles.text)}>
          {score}
        </span>
        <span className="mt-0.5 font-mono-data text-[9px] uppercase tracking-[0.2em] text-ink-muted">
          Viability
        </span>
      </div>
    </div>
  );
}
