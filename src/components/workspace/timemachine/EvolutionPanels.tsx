"use client";

import { motion } from "framer-motion";
import type { SentimentSnapshot } from "@/types/timemachine";

export function SocialEvolutionPanel({ sentiment }: { sentiment: SentimentSnapshot | null }) {
  if (!sentiment) return null;

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">Social evolution</p>
      <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
        {sentiment.cohorts.slice(0, 6).map((c) => (
          <div key={c.profile}>
            <div className="flex justify-between text-xs">
              <span>{c.profile}</span>
              <span className="font-mono-data text-positive">{c.supportPct}%</span>
            </div>
            <motion.div
              className="mt-1 h-1 bg-hairline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-positive"
                animate={{ width: `${c.supportPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EconomicEvolutionPanel({
  economic,
}: {
  economic: { businessActivity: number; employment: number; investment: number; taxRevenue: number } | null;
}) {
  if (!economic) return null;
  const items = [
    ["Business", economic.businessActivity],
    ["Employment", economic.employment],
    ["Investment", economic.investment],
    ["Tax revenue", economic.taxRevenue],
  ] as const;

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">Economic evolution</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {items.map(([label, v]) => (
          <div key={label} className="border border-hairline p-2">
            <p className="text-[10px] text-ink-muted">{label}</p>
            <motion.p
              key={v}
              className="font-display text-xl font-bold"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {v}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentalEvolutionPanel({
  environmental,
}: {
  environmental: {
    carbonImpact: number;
    landUsage: number;
    greenSpaces: number;
    pollution: number;
  } | null;
}) {
  if (!environmental) return null;
  const items = [
    ["Carbon", environmental.carbonImpact],
    ["Land use", environmental.landUsage],
    ["Green space", environmental.greenSpaces],
    ["Pollution", environmental.pollution],
  ] as const;

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">Environmental evolution</p>
      <div className="mt-2 space-y-2">
        {items.map(([label, v]) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-ink-muted">{label}</span>
            <div className="h-1.5 flex-1 bg-hairline">
              <motion.div className="h-full bg-environmental" animate={{ width: `${v}%` }} />
            </div>
            <span className="font-mono-data w-8">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
