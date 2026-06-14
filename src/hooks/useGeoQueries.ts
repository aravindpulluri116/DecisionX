"use client";

import { useQuery } from "@tanstack/react-query";
import type { GeoCoordinates, LocationIntelligence } from "@/types/geo";

export function useGeoEnrichmentPreview(location: string, coords?: GeoCoordinates, enabled = false) {
  return useQuery({
    queryKey: ["geo-enrich-preview", location, coords?.lat, coords?.lng],
    queryFn: async () => {
      const res = await fetch("/api/geo/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, coords }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err.error === "string" ? err.error : "Enrichment failed");
      }
      return (await res.json()) as LocationIntelligence;
    },
    enabled: enabled && location.trim().length >= 2,
    staleTime: 60_000,
    retry: 1,
  });
}
