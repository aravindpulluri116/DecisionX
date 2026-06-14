"use client";

import { useQuery } from "@tanstack/react-query";
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";

export function useGeoEnrichmentPreview(location: string, coords?: GeoCoordinates, enabled = true) {
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
    enabled: enabled && Boolean(location.trim()),
    staleTime: 60_000,
  });
}
