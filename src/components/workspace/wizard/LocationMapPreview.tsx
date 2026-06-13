"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildRadiusCircles } from "@/lib/services/geo/geo-service";
import { getGeoConfig } from "@/lib/services/geo/geo-service";
import type { GeoCoordinates } from "@/types/geo";

type LocationMapPreviewProps = {
  location: string;
  coords: GeoCoordinates | null;
  onCoordsChange: (coords: GeoCoordinates) => void;
  onGeocode?: () => void;
};

export function LocationMapPreview({ location, coords, onCoordsChange, onGeocode }: LocationMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { mapStyle } = getGeoConfig();

  const defaultCenter = useMemo<[number, number]>(
    () => (coords ? [coords.lng, coords.lat] : [78.4867, 17.385]),
    [coords],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: defaultCenter,
      zoom: 10,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("click", (e) => {
      onCoordsChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [defaultCenter, mapStyle, onCoordsChange]);

  const updateOverlays = useCallback(() => {
    const map = mapRef.current;
    if (!map || !coords) return;

    map.flyTo({ center: [coords.lng, coords.lat], zoom: 11, duration: 600 });

    const radii = buildRadiusCircles(coords);
    const pin: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [coords.lng, coords.lat] },
        },
      ],
    };

    const apply = () => {
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
        paint: { "circle-radius": 8, "circle-color": "#EA580C", "circle-stroke-width": 2, "circle-stroke-color": "#fff" },
      });
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [coords]);

  useEffect(() => {
    updateOverlays();
  }, [updateOverlays]);

  return (
    <div className="space-y-2">
      <div className="relative h-48 border border-hairline">
        <div ref={containerRef} className="absolute inset-0" />
        <p className="pointer-events-none absolute bottom-2 left-2 font-mono-data text-[9px] uppercase text-ink-muted">
          Click map to set pin
        </p>
      </div>
      {coords && (
        <p className="font-mono-data text-[10px] text-ink-muted">
          {coords.lat.toFixed(4)}° · {coords.lng.toFixed(4)}° · {location}
        </p>
      )}
      {onGeocode && (
        <button
          type="button"
          onClick={onGeocode}
          className="font-mono-data text-[10px] uppercase text-signal hover:underline"
        >
          Refresh geocode
        </button>
      )}
    </div>
  );
}
