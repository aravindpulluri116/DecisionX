"use client";

import type { GeoLayerKey } from "@/types/geo";

const LAYER_META: Record<GeoLayerKey, { label: string; color: string }> = {
  population: { label: "Population", color: "#0F172A" },
  transportation: { label: "Transportation", color: "#475569" },
  economic: { label: "Economic", color: "#2563EB" },
  environment: { label: "Environment", color: "#15803D" },
  services: { label: "Public Services", color: "#7C3AED" },
  risk: { label: "Risk Zones", color: "#DC2626" },
  impact: { label: "Impact Heat", color: "#EA580C" },
};

type MapLayerControlsProps = {
  activeLayers: Set<GeoLayerKey>;
  onToggle: (layer: GeoLayerKey) => void;
};

export function MapLayerControls({ activeLayers, onToggle }: MapLayerControlsProps) {
  return (
    <div className="absolute left-4 top-4 z-10 w-52 border border-hairline bg-surface/95 p-3 backdrop-blur-sm">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
        ◣ layers
      </p>
      <div className="mt-3 space-y-2">
        {(Object.keys(LAYER_META) as GeoLayerKey[]).map((key) => {
          const meta = LAYER_META[key];
          const active = activeLayers.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className="flex w-full items-center justify-between border border-hairline px-2.5 py-2 text-left transition-colors hover:border-signal"
            >
              <span className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2" style={{ backgroundColor: meta.color, opacity: active ? 1 : 0.3 }} />
                {meta.label}
              </span>
              <span className="font-mono-data text-[9px] uppercase text-ink-muted">
                {active ? "on" : "off"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { LAYER_META };
