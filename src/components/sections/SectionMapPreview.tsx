"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SectionLabel } from "@/components/site/SectionLabel";

type LayerKey = "population" | "environment" | "impact";

const layerMeta: Record<LayerKey, { label: string; color: string; opacity: number }> = {
  population: { label: "Population density", color: "#0F172A", opacity: 0.45 },
  environment: { label: "Environmental risk", color: "#15803D", opacity: 0.4 },
  impact: { label: "Impact zones", color: "#2563EB", opacity: 0.5 },
};

// Generated mock polygons around a fictional metro corridor (Mumbai-ish coords for visual interest)
function mockFeatures(layer: LayerKey) {
  const center: [number, number] = [72.88, 19.07];
  const features = [];
  const count = layer === "impact" ? 6 : 10;
  for (let i = 0; i < count; i++) {
    const lng = center[0] + (Math.sin(i * 1.3 + (layer === "population" ? 0 : 1.7)) * 0.12);
    const lat = center[1] + (Math.cos(i * 0.9 + (layer === "environment" ? 1.1 : 0)) * 0.09);
    const r = 0.012 + (i % 4) * 0.008;
    const pts: [number, number][] = [];
    const sides = 6;
    for (let s = 0; s <= sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      pts.push([lng + Math.cos(a) * r, lat + Math.sin(a) * r * 0.7]);
    }
    features.push({
      type: "Feature" as const,
      properties: { weight: 0.3 + (i % 5) * 0.15 },
      geometry: { type: "Polygon" as const, coordinates: [pts] },
    });
  }
  return { type: "FeatureCollection" as const, features };
}

export function SectionMapPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [active, setActive] = useState<Record<LayerKey, boolean>>({
    population: true,
    environment: false,
    impact: true,
  });

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#F8FAFC" } },
        ],
      },
      center: [72.88, 19.07],
      zoom: 10.2,
      attributionControl: false,
      interactive: true,
    });
    mapRef.current = map;

    map.on("load", () => {
      (["population", "environment", "impact"] as LayerKey[]).forEach((k) => {
        const meta = layerMeta[k];
        map.addSource(k, { type: "geojson", data: mockFeatures(k) });
        map.addLayer({
          id: `${k}-fill`,
          type: "fill",
          source: k,
          paint: {
            "fill-color": meta.color,
            "fill-opacity": ["*", ["get", "weight"], meta.opacity],
          },
        });
        map.addLayer({
          id: `${k}-line`,
          type: "line",
          source: k,
          paint: { "line-color": meta.color, "line-width": 1, "line-opacity": 0.7 },
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      const t = setTimeout(() => applyVisibility(), 400);
      return () => clearTimeout(t);
    }
    applyVisibility();

    function applyVisibility() {
      const m = mapRef.current;
      if (!m) return;
      (Object.keys(active) as LayerKey[]).forEach((k) => {
        const vis = active[k] ? "visible" : "none";
        if (m.getLayer(`${k}-fill`)) m.setLayoutProperty(`${k}-fill`, "visibility", vis);
        if (m.getLayer(`${k}-line`)) m.setLayoutProperty(`${k}-line`, "visibility", vis);
      });
    }
  }, [active]);

  return (
    <section className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-28">
        <div className="max-w-2xl">
          <SectionLabel index="06" title="Geospatial intelligence" />
          <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
            Map the impact.<br />
            <span className="text-ink-muted">Down to the district.</span>
          </h2>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline lg:grid-cols-[260px_1fr]">
          <div className="bg-surface p-6">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              ◣ active layers
            </div>
            <div className="mt-4 space-y-3">
              {(Object.keys(layerMeta) as LayerKey[]).map((k) => (
                <label
                  key={k}
                  className="flex cursor-pointer items-center justify-between border border-hairline px-3 py-2.5 transition-colors hover:border-ink"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5"
                      style={{ backgroundColor: layerMeta[k].color }}
                    />
                    <span className="text-sm">{layerMeta[k].label}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={active[k]}
                    onChange={(e) =>
                      setActive((a) => ({ ...a, [k]: e.target.checked }))
                    }
                    className="accent-signal"
                  />
                </label>
              ))}
            </div>
            <div className="mt-8 border-t border-hairline pt-4">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                viewport
              </div>
              <div className="mt-2 font-mono-data text-[11px] text-ink">
                19.07°N · 72.88°E<br />
                Z 10.2 · METRO-CORRIDOR-07
              </div>
            </div>
          </div>
          <div className="relative h-[520px] bg-background">
            <div ref={ref} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-between font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              <span>◢ geospatial intelligence · live</span>
              <span>{Object.values(active).filter(Boolean).length} layers visible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}