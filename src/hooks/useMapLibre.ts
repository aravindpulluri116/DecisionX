"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl, { type Map as MLMap, type GeoJSONSource } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { getGeoConfig } from "@/lib/services/geo/geo-service";

type UseMapLibreOptions = {
  center: [number, number];
  zoom?: number;
  styleUrl?: string;
};

export function useMapLibre(containerRef: React.RefObject<HTMLDivElement | null>, options: UseMapLibreOptions) {
  const mapRef = useRef<MLMap | null>(null);
  const { mapStyle } = getGeoConfig();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: options.styleUrl ?? mapStyle,
      center: options.center,
      zoom: options.zoom ?? 11,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, options.center, options.zoom, options.styleUrl, mapStyle]);

  const addGeoJsonLayer = useCallback(
    (sourceId: string, data: FeatureCollection, fillColor: string, opacity = 0.4) => {
      const map = mapRef.current;
      if (!map) return;

      const apply = () => {
        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as GeoJSONSource).setData(data);
          return;
        }
        map.addSource(sourceId, { type: "geojson", data });
        map.addLayer({
          id: `${sourceId}-fill`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": fillColor,
            "fill-opacity": opacity,
          },
        });
        map.addLayer({
          id: `${sourceId}-line`,
          type: "line",
          source: sourceId,
          paint: { "line-color": fillColor, "line-width": 1.5, "line-opacity": 0.6 },
        });
      };

      if (map.isStyleLoaded()) apply();
      else map.once("load", apply);
    },
    [],
  );

  const setLayerOpacity = useCallback((sourceId: string, visible: boolean) => {
    const map = mapRef.current;
    if (!map?.getLayer(`${sourceId}-fill`)) return;
    map.setLayoutProperty(`${sourceId}-fill`, "visibility", visible ? "visible" : "none");
    map.setLayoutProperty(`${sourceId}-line`, "visibility", visible ? "visible" : "none");
  }, []);

  const flyTo = useCallback((center: [number, number], zoom = 12) => {
    mapRef.current?.flyTo({ center, zoom, duration: 800 });
  }, []);

  return { mapRef, addGeoJsonLayer, setLayerOpacity, flyTo };
}
