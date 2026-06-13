import type { ImpactScores } from "@/types/workspace";
import type { LocationIntelligence } from "@/types/geo";

export type ScoreEvidenceMap = {
  economic: string[];
  social: string[];
  environmental: string[];
  infrastructure: string[];
  politicalRisk: string[];
  publicAcceptance: string[];
};

export function buildScoreEvidence(
  intelligence: LocationIntelligence | null | undefined,
  scores?: ImpactScores,
): ScoreEvidenceMap {
  const empty: ScoreEvidenceMap = {
    economic: [],
    social: [],
    environmental: [],
    infrastructure: [],
    politicalRisk: [],
    publicAcceptance: [],
  };
  if (!intelligence) return empty;

  const r5 = intelligence.radiusImpacts.find((r) => r.radiusKm === 5);
  const r1 = intelligence.radiusImpacts.find((r) => r.radiusKm === 1);
  const s = intelligence.scores;

  return {
    economic: [
      `Population density score: ${s.populationDensity}/100`,
      r5 ? `${r5.businesses} businesses within 5km (OSM)` : "Commercial activity in corridor",
      intelligence.nearbyPOIs.some((p) => p.type === "commercial")
        ? "Commercial corridor nearby"
        : "Urban economic zone identified",
    ],
    social: [
      r5 ? `${r5.populationEstimate.toLocaleString()} people est. within 5km` : "Regional population base",
      r5 ? `${r5.schools} schools within 5km` : "Education facilities in area",
      `Urban density score: ${s.urbanDensity}/100`,
    ],
    environmental: [
      `Environmental sensitivity: ${s.environmentalSensitivity}/100`,
      `${intelligence.layers.filter((l) => l.key === "environment").length > 0 ? "Green/water zones mapped" : "Environmental baseline assessed"}`,
      intelligence.summary,
    ],
    infrastructure: [
      `Infrastructure score: ${s.infrastructureScore}/100`,
      r1 ? `${r1.transitStops} transit stops within 1km` : "Transit access evaluated",
      r5 ? `${r5.hospitals} hospitals within 5km` : "Healthcare access mapped",
    ],
    politicalRisk: [
      `${intelligence.nearbyPOIs.filter((p) => p.type === "government").length} government facilities nearby`,
      "Stakeholder density from urban analysis",
    ],
    publicAcceptance: [
      `Accessibility score: ${s.accessibilityScore}/100`,
      intelligence.nearbyPOIs.filter((p) => p.type === "transit").length
        ? "Strong transit access supports public acceptance"
        : "Public mobility access evaluated",
    ],
  };
}

export function formatSourceLine(intelligence: LocationIntelligence | null | undefined): string {
  if (!intelligence?.sources?.length) return "DecisionX Analysis";
  return intelligence.sources.map((s) => s.label).join(" · ");
}
