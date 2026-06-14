import { z } from "zod";
import { callAgent } from "@/lib/agents/claudeClient";
import { STAKEHOLDER_OPTIONS } from "@/lib/constants/stakeholders";
import { normalizeStakeholderSelection } from "@/lib/services/suggestStakeholders";
import type { ProjectCategory } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";

const CATEGORIES = [
  "Transportation",
  "Urban Development",
  "Environment",
  "Education",
  "Healthcare",
  "Economic Policy",
] as const;

const stakeholderEnum = z.enum(
  STAKEHOLDER_OPTIONS as unknown as [typeof STAKEHOLDER_OPTIONS[number], ...typeof STAKEHOLDER_OPTIONS[number][]],
);

export const projectMetadataSchema = z.object({
  category: z.enum(CATEGORIES),
  stakeholders: z.array(stakeholderEnum).min(2).max(8),  projectType: z.string().min(2).max(80),
  policyType: z.string().min(2).max(80),
  populationEstimateM: z.number().positive().max(500),
  populationRationale: z.string().min(10),
});

const populationOnlySchema = z.object({
  projectType: z.string().min(2).max(80),
  policyType: z.string().min(2).max(80),
  populationEstimateM: z.number().positive().max(500),
  populationRationale: z.string().min(10),
});

export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;

type InferMetadataInput = {
  title: string;
  description: string;
  location: string;
  budgetCr: number;
  timeline: string;
  locationIntelligence: LocationIntelligence | null;
  webContext: string | null;
  category?: ProjectCategory;
  stakeholders?: string[];
};

function geoBlock(intel: LocationIntelligence | null): string {
  if (!intel) return "LOCATION DATA: unavailable — estimate population from web context and project scope.";
  if (intel.unavailable) {
    return "LOCATION DATA: OpenStreetMap lookup failed — estimate population from web context and project scope.";
  }
  const r5 = intel.radiusImpacts.find((r) => r.radiusKm === 5);
  return `
LOCATION DATA (OpenStreetMap):
  summary: ${intel.summary}
  coords: ${intel.coords.lat}, ${intel.coords.lng}
  schools_5km: ${r5?.schools ?? "unknown"}
  hospitals_5km: ${r5?.hospitals ?? "unknown"}
  population_est_5km: ${r5?.populationEstimate ?? "unknown"}
  scores: ${JSON.stringify(intel.scores)}
  assumptions: ${JSON.stringify(intel.assumptions)}`.trim();
}

export async function inferProjectMetadata(input: InferMetadataInput): Promise<ProjectMetadata> {
  if (input.category && input.stakeholders?.length) {
    const pop = await inferPopulationMetadata(input);
    return {
      category: input.category,
      stakeholders: normalizeStakeholderSelection(input.stakeholders) as ProjectMetadata["stakeholders"],
      projectType: pop.projectType,
      policyType: pop.policyType,
      populationEstimateM: pop.populationEstimateM,
      populationRationale: pop.populationRationale,
    };
  }

  const system = `You infer structured project metadata for DecisionX decision intelligence.
Use ONLY the provided project fields, geo data, and web context.
- populationEstimateM = affected population in millions relevant to this decision (not global city pop unless project is city-wide).
- Prefer OSM radius population when available; otherwise use web context; if uncertain, estimate conservatively and explain in populationRationale.
- stakeholders: pick 2–8 groups ONLY from: ${STAKEHOLDER_OPTIONS.join(", ")}.
- budget is in ₹ crore (Cr).
Return ONLY valid JSON matching the schema.`;

  const user = `
PROJECT:
  title: ${input.title}
  description: ${input.description}
  location: ${input.location}
  budget: ${input.budgetCr} ₹ crore
  timeline: ${input.timeline}

${geoBlock(input.locationIntelligence)}

WEB CONTEXT:
${input.webContext ?? "none"}

Respond with JSON:
{"category":"Transportation|Urban Development|Environment|Education|Healthcare|Economic Policy","stakeholders":["string",...],"projectType":"string","policyType":"string","populationEstimateM":number,"populationRationale":"string"}
`.trim();

  return callAgent({
    system,
    user,
    schema: projectMetadataSchema,
  });
}

async function inferPopulationMetadata(input: InferMetadataInput) {
  const system = `You estimate affected population and project classification for DecisionX.
Use ONLY provided fields and geo/web context. populationEstimateM = people affected in millions.
Return ONLY valid JSON.`;

  const user = `
PROJECT:
  title: ${input.title}
  description: ${input.description}
  location: ${input.location}
  category: ${input.category}
  stakeholders: ${input.stakeholders?.join(", ")}
  budget: ${input.budgetCr} ₹ crore
  timeline: ${input.timeline}

${geoBlock(input.locationIntelligence)}

WEB CONTEXT:
${input.webContext ?? "none"}

Respond with JSON:
{"projectType":"string","policyType":"string","populationEstimateM":number,"populationRationale":"string"}
`.trim();

  return callAgent({
    system,
    user,
    schema: populationOnlySchema,
  });
}

export type { ProjectCategory };
