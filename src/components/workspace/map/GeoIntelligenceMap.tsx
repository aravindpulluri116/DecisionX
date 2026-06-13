"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapLibre } from "@/hooks/useMapLibre";
import { buildRadiusCircles } from "@/lib/services/geo/geo-service";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { MapLayerControls, LAYER_META } from "./MapLayerControls";
import { ImpactRadiusOverlay } from "./ImpactRadiusOverlay";
import { LocationStoryMode } from "./LocationStoryMode";

export function GeoIntelligenceMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const locationIntelligence = useWorkspaceStore((s) => s.locationIntelligence);
  const activeGeoLayers = useWorkspaceStore((s) => s.activeGeoLayers);
  const selectedRadiusKm = useWorkspaceStore((s) => s.selectedRadiusKm);
  const storyModeOpen = useWorkspaceStore((s) => s.storyModeOpen);
  const toggleGeoLayer = useWorkspaceStore((s) => s.toggleGeoLayer);
  const setSelectedRadiusKm = useWorkspaceStore((s) => s.setSelectedRadiusKm);
  const setStoryModeOpen = useWorkspaceStore((s) => s.setStoryModeOpen);

  const center: [number, number] = locationIntelligence
    ? [locationIntelligence.coords.lng, locationIntelligence.coords.lat]
    : [78.4867, 17.385];

  const { addGeoJsonLayer, setLayerOpacity, flyTo } = useMapLibre(containerRef, {
    center,
    zoom: 11,
  });

  useEffect(() => {
    if (!locationIntelligence) return;
    flyTo([locationIntelligence.coords.lng, locationIntelligence.coords.lat], 11);
  }, [locationIntelligence, flyTo]);

  useEffect(() => {
    if (!locationIntelligence) return;

    const radii = buildRadiusCircles(locationIntelligence.coords);
    addGeoJsonLayer("radius-rings", radii, "#2563EB", 0.08);

    locationIntelligence.layers.forEach((layer) => {
      const color = LAYER_META[layer.key]?.color ?? layer.color;
      addGeoJsonLayer(`geo-${layer.key}`, layer.data, color, 0.35);
    });

    const pin: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [locationIntelligence.coords.lng, locationIntelligence.coords.lat],
          },
        },
      ],
    };
    addGeoJsonLayer("project-pin", pin, "#EA580C", 1);
  }, [locationIntelligence, addGeoJsonLayer]);

  useEffect(() => {
    if (!locationIntelligence) return;
    locationIntelligence.layers.forEach((layer) => {
      setLayerOpacity(`geo-${layer.key}`, activeGeoLayers.has(layer.key));
    });
    setLayerOpacity("radius-rings", activeGeoLayers.has("impact"));
  }, [activeGeoLayers, locationIntelligence, setLayerOpacity]);

  return (
    <div className="relative h-full w-full bg-background">
      <div ref={containerRef} className="absolute inset-0" />

      {!locationIntelligence && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="max-w-sm text-center text-sm text-ink-muted">
            Run a simulation or set a project location to load geospatial intelligence layers.
          </p>
        </div>
      )}

      {locationIntelligence && (
        <>
          <MapLayerControls activeLayers={activeGeoLayers} onToggle={toggleGeoLayer} />
          <ImpactRadiusOverlay
            intelligence={locationIntelligence}
            selectedRadiusKm={selectedRadiusKm}
            onSelectRadius={setSelectedRadiusKm}
          />
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => setStoryModeOpen(true)}
              className="border border-signal bg-surface px-3 py-2 font-mono-data text-[10px] uppercase tracking-[0.12em] text-signal hover:bg-signal/10"
            >
              Explain This Area
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-4 bottom-16 flex justify-between font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            <span>◢ impact map · osm</span>
            <span>{activeGeoLayers.size} layers visible</span>
          </div>
        </>
      )}

      <LocationStoryMode
        open={storyModeOpen}
        intelligence={locationIntelligence}
        onClose={() => setStoryModeOpen(false)}
      />
    </div>
  );
}
