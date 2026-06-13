"use client";

import { motion } from "framer-motion";
import type { CityEvolutionState } from "@/types/timemachine";

type CityEvolutionViewProps = {
  cityState: CityEvolutionState | null;
  calendarYear?: number;
};

export function CityEvolutionView({ cityState, calendarYear }: CityEvolutionViewProps) {
  if (!cityState) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-ink-muted">
        City evolution loads after simulation
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#0A0F1A] p-6">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-white/50">
        City evolution {calendarYear ? `· ${calendarYear}` : ""}
      </p>
      <div className="mt-8 grid grid-cols-5 gap-3 items-end h-48">
        {cityState.zoneHeatmap.map((zone, i) => (
          <motion.div
            key={zone.zoneId}
            layout
            initial={{ height: 0 }}
            animate={{
              height: `${40 + cityState.buildingScale * 80 * zone.supportWeight}px`,
            }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-t-sm bg-signal/80"
            style={{ opacity: 0.35 + zone.supportWeight * 0.65 }}
            title={zone.zoneId}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 font-mono-data text-[10px] text-white/60">
        <div>Buildings {(cityState.buildingScale * 100).toFixed(0)}%</div>
        <div>Transit {(cityState.transitCoverage * 100).toFixed(0)}%</div>
        <div>Density {(cityState.populationDensity * 100).toFixed(0)}%</div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-signal/30"
        animate={{ scaleX: cityState.transitCoverage }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}
