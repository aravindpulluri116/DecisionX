"use client";

import { useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildRadiusCircles } from "@/lib/services/geo/geo-service";
import type { GeoCoordinates } from "@/types/geo";

const DEFAULT_CENTER: [number, number] = [78.4867, 17.385];
const MAP_STYLE =
  process.env.NEXT_PUBLIC_OPENFREEMAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

type LocationMapPreviewProps = {
  location: string;
  coords: GeoCoordinates | null;
  onCoordsChange: (coords: GeoCoordinates) => void;
};

export function LocationMapPreview({ location, coords, onCoordsChange }: LocationMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onCoordsChangeRef = useRef(onCoordsChange);
  onCoordsChangeRef.current = onCoordsChange;

  // Init map once — avoid re-mounting when coords or callbacks change
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: 5,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("click", (e) => {
      onCoordsChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    map.on("load", () => {
      map.resize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const applyOverlays = useCallback((map: maplibregl.Map, center: GeoCoordinates) => {
    const radii = buildRadiusCircles(center);
    const pin: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [center.lng, center.lat] },
        },
      ],
    };

    if (map.getSource("wizard-radii")) {
      (map.getSource("wizard-radii") as maplibregl.GeoJSONSource).setData(radii);
      (map.getSource("wizard-pin") as maplibregl.GeoJSONSource).setData(pin);
      return;
    }

    map.addSource("wizard-radii", { type: "geojson", data: radii });
    map.addLayer({
      id: "wizard-radii-fill",
      type: "fill",
      source: "wizard-radii",
      paint: { "fill-color": "#2563EB", "fill-opacity": 0.06 },
    });
    map.addLayer({
      id: "wizard-radii-line",
      type: "line",
      source: "wizard-radii",
      paint: { "line-color": "#2563EB", "line-width": 1, "line-opacity": 0.4 },
    });
    map.addSource("wizard-pin", { type: "geojson", data: pin });
    map.addLayer({
      id: "wizard-pin-circle",
      type: "circle",
      source: "wizard-pin",
      paint: {
        "circle-radius": 8,
        "circle-color": "#EA580C",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;

    const center: [number, number] = [coords.lng, coords.lat];
    const run = () => {
      map.flyTo({ center, zoom: 11, duration: 600 });
      applyOverlays(map, coords);
      map.resize();
    };

    if (map.isStyleLoaded()) run();
    else map.once("load", run);
  }, [coords, applyOverlays]);

  return (
    <div className="space-y-2">
      <div className="relative h-48 overflow-hidden rounded-lg border border-hairline bg-[#e8e4df]">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        <p className="pointer-events-none absolute bottom-2 left-2 font-mono-data text-[9px] uppercase text-ink-muted">
          Click map to set pin
        </p>
      </div>
      {coords && (
        <p className="font-mono-data text-[10px] text-ink-muted">
          {coords.lat.toFixed(4)}° · {coords.lng.toFixed(4)}° · {location}
        </p>
      )}
    </div>
  );
}
