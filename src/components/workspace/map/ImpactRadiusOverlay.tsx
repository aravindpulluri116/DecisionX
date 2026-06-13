"use client";

import type { LocationIntelligence, RadiusKm } from "@/types/geo";
import { cn } from "@/lib/utils";

type ImpactRadiusOverlayProps = {
  intelligence: LocationIntelligence;
  selectedRadiusKm: RadiusKm;
  onSelectRadius: (km: RadiusKm) => void;
};

export function ImpactRadiusOverlay({
  intelligence,
  selectedRadiusKm,
  onSelectRadius,
}: ImpactRadiusOverlayProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-px border border-hairline bg-surface/95 backdrop-blur-sm">
      {intelligence.radiusImpacts.map((r) => (
        <button
          key={r.radiusKm}
          type="button"
          onClick={() => onSelectRadius(r.radiusKm)}
          className={cn(
            "px-3 py-2 text-left transition-colors",
            selectedRadiusKm === r.radiusKm ? "bg-signal/10" : "hover:bg-background",
          )}
        >
          <p className="font-mono-data text-[9px] uppercase tracking-[0.12em] text-ink-muted">
            {r.radiusKm} km
          </p>
          <p className="font-mono-data text-[10px] text-ink">
            {r.schools} schools · {r.hospitals} hosp
          </p>
          <p className="font-mono-data text-[10px] text-ink-muted">
            ~{(r.populationEstimate / 1000).toFixed(0)}k pop
          </p>
        </button>
      ))}
    </div>
  );
}
