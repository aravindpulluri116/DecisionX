"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";
import { fetchLocationIntelligence } from "@/lib/workspace/queries";

export function useLocationIntelligence(projectId: string | undefined) {
  return useQuery({
    queryKey: ["location-intelligence", projectId],
    queryFn: () => (projectId ? fetchLocationIntelligence(projectId) : null),
    enabled: Boolean(projectId),
  });
}

export function useGeoEnrichmentPreview(location: string, coords?: GeoCoordinates) {
  return useQuery({
    queryKey: ["geo-enrich-preview", location, coords?.lat, coords?.lng],
    queryFn: async () => {
      const res = await fetch("/api/geo/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, coords }),
      });
      if (!res.ok) throw new Error("Enrichment failed");
      return (await res.json()) as LocationIntelligence;
    },
    enabled: Boolean(location),
    staleTime: 60_000,
  });
}

export function useGeoLayers(intelligence: LocationIntelligence | null | undefined) {
  return useMemo(() => intelligence?.layers ?? [], [intelligence]);
}
