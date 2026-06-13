"use client";

import { motion } from "framer-motion";
import type { LocationIntelligence } from "@/types/geo";
import { SourceAttributionCards } from "./SourceAttributionCards";

const SCORE_LABELS: { key: keyof LocationIntelligence["scores"]; label: string }[] = [
  { key: "populationDensity", label: "Population Density" },
  { key: "urbanDensity", label: "Urban Density" },
  { key: "environmentalSensitivity", label: "Environmental Sensitivity" },
  { key: "accessibilityScore", label: "Accessibility" },
  { key: "infrastructureScore", label: "Infrastructure" },
];

type LocationIntelligencePanelProps = {
  intelligence: LocationIntelligence | null;
};

export function LocationIntelligencePanel({ intelligence }: LocationIntelligencePanelProps) {
  if (!intelligence) {
    return (
      <div className="p-4 text-sm text-ink-muted">
        Location intelligence loads after geocoding or simulation enrichment.
      </div>
    );
  }

  const r5 = intelligence.radiusImpacts.find((r) => r.radiusKm === 5);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-4 py-3">
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          ◢ location intelligence
        </p>
        <p className="mt-2 text-sm text-ink">{intelligence.summary}</p>
        <p className="mt-1 font-mono-data text-[10px] text-ink-muted">
          {intelligence.coords.lat.toFixed(4)}° · {intelligence.coords.lng.toFixed(4)}°
          {intelligence.fromMock ? " · mock fallback" : ""}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section className="space-y-3">
          <h3 className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
            Area Scores
          </h3>
          {SCORE_LABELS.map(({ key, label }, i) => (
            <div key={key}>
              <div className="flex justify-between text-xs">
                <span>{label}</span>
                <span className="font-mono-data">{intelligence.scores[key]}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden bg-hairline">
                <motion.div
                  className="h-full bg-signal"
                  initial={{ width: 0 }}
                  animate={{ width: `${intelligence.scores[key]}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                />
              </div>
            </div>
          ))}
        </section>

        {r5 && (
          <section>
            <h3 className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
              5 km Radius Impact
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono-data text-[11px]">
              <div className="border border-hairline p-2">Schools: {r5.schools}</div>
              <div className="border border-hairline p-2">Hospitals: {r5.hospitals}</div>
              <div className="border border-hairline p-2">Businesses: {r5.businesses}</div>
              <div className="border border-hairline p-2">Transit: {r5.transitStops}</div>
            </div>
          </section>
        )}

        <section>
          <h3 className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
            Nearby Services
          </h3>
          <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-sm">
            {intelligence.nearbyPOIs.slice(0, 8).map((poi) => (
              <li key={`${poi.name}-${poi.distanceM}`} className="flex justify-between gap-2">
                <span className="truncate">{poi.name}</span>
                <span className="shrink-0 font-mono-data text-[10px] text-ink-muted">
                  {(poi.distanceM / 1000).toFixed(1)}km
                </span>
              </li>
            ))}
          </ul>
        </section>

        <SourceAttributionCards sources={intelligence.sources} />
      </div>
    </div>
  );
}
