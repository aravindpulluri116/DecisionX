"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { LocationIntelligence } from "@/types/geo";

type LocationStoryModeProps = {
  open: boolean;
  intelligence: LocationIntelligence | null;
  onClose: () => void;
};

function buildStorySections(intelligence: LocationIntelligence) {
  const r5 = intelligence.radiusImpacts.find((r) => r.radiusKm === 5);
  const r1 = intelligence.radiusImpacts.find((r) => r.radiusKm === 1);
  const s = intelligence.scores;

  return [
    {
      title: "Population",
      body: `This area shows a population density score of ${s.populationDensity}/100 with an estimated ${r5?.populationEstimate.toLocaleString() ?? "—"} residents within 5km. Urban density registers at ${s.urbanDensity}/100, indicating ${s.urbanDensity > 60 ? "a well-established urban core" : "moderate suburban character"}.`,
    },
    {
      title: "Economy",
      body: `${r5?.businesses ?? 0} businesses mapped within 5km via OpenStreetMap. ${intelligence.nearbyPOIs.some((p) => p.type === "commercial") ? "Commercial corridors are present, supporting local employment and tax base growth." : "Commercial activity appears dispersed — verify land use zoning for economic projections."}`,
    },
    {
      title: "Infrastructure",
      body: `Infrastructure score: ${s.infrastructureScore}/100. Within 1km: ${r1?.transitStops ?? 0} transit stops, ${r1?.schools ?? 0} schools. Within 5km: ${r5?.hospitals ?? 0} hospitals. Accessibility score: ${s.accessibilityScore}/100.`,
    },
    {
      title: "Risks",
      body: `Environmental sensitivity: ${s.environmentalSensitivity}/100. ${s.environmentalSensitivity > 65 ? "Elevated sensitivity — environmental review likely required." : "Moderate environmental constraints expected."} Assumptions: ${intelligence.assumptions.join("; ")}`,
    },
    {
      title: "Growth Potential",
      body: `Combined accessibility (${s.accessibilityScore}) and infrastructure (${s.infrastructureScore}) scores suggest ${(s.accessibilityScore + s.infrastructureScore) / 2 > 60 ? "strong development upside" : "measured growth potential"}. ${intelligence.summary}`,
    },
  ];
}

export function LocationStoryMode({ open, intelligence, onClose }: LocationStoryModeProps) {
  if (!open || !intelligence) return null;

  const sections = buildStorySections(intelligence);

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-end bg-ink/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="flex h-full w-full max-w-md flex-col border-l border-hairline bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div>
            <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              Explain This Area
            </p>
            <h2 className="font-display text-lg font-semibold">{intelligence.address}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {sections.map((sec, i) => (
              <motion.section
                key={sec.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="mb-6 border-b border-hairline pb-6 last:border-0"
              >
                <h3 className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-signal">
                  {i + 1}. {sec.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink">{sec.body}</p>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
