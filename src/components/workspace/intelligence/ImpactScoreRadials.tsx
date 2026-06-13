"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { ImpactScores } from "@/types/workspace";

const METRICS: { key: keyof ImpactScores; label: string; color: string }[] = [
  { key: "economic", label: "Economic", color: "var(--signal)" },
  { key: "social", label: "Social", color: "var(--positive)" },
  { key: "environmental", label: "Environmental", color: "var(--environmental)" },
  { key: "infrastructure", label: "Infrastructure", color: "var(--ink)" },
  { key: "politicalRisk", label: "Political Risk", color: "var(--negative)" },
  { key: "publicAcceptance", label: "Public Acceptance", color: "var(--warning)" },
];

type ImpactScoreRadialsProps = {
  scores: ImpactScores | null;
  geoEvidence?: Partial<Record<keyof ImpactScores, string[]>>;
};

function RadialCell({
  label,
  value,
  color,
  index,
  evidence,
}: {
  label: string;
  value: number;
  color: string;
  index: number;
  evidence?: string[];
}) {
  const data = [{ name: label, value, fill: color }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex flex-col border border-hairline bg-surface p-3"
    >
      <div className="font-mono-data text-[9px] uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </div>
      <div className="relative h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            barSize={8}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: "var(--hairline)" }} dataKey="value" cornerRadius={2} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-ink">
          {value}
        </div>
      </div>
      {evidence && evidence.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-[10px] leading-snug text-ink-muted">
          {evidence.slice(0, 2).map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export function ImpactScoreRadials({ scores, geoEvidence }: ImpactScoreRadialsProps) {
  if (!scores) {
    return (
      <div className="border border-hairline bg-surface p-6 text-center text-sm text-ink-muted">
        Impact scores available when a simulation is active.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline">
      {METRICS.map((m, i) => (
        <RadialCell
          key={m.key}
          label={m.label}
          value={scores[m.key]}
          color={m.color}
          index={i}
          evidence={geoEvidence?.[m.key]}
        />
      ))}
    </div>
  );
}
