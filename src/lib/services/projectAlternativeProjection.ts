import { z } from "zod";
import { callAgent } from "@/lib/agents/llmClient";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import {
  parseBudgetCroreFromText,
  parseViabilityDelta,
  type ProjectedAlternative,
} from "@/lib/workspace/alternative-projection";
import type { ParsedAlternative } from "@/lib/workspace/report-formatters";
import type { ImpactScores, ScenarioParams } from "@/types/workspace";

const impactScoresSchema = z.object({
  economic: z.number().min(0).max(100),
  social: z.number().min(0).max(100),
  environmental: z.number().min(0).max(100),
  infrastructure: z.number().min(0).max(100),
  politicalRisk: z.number().min(0).max(100),
  publicAcceptance: z.number().min(0).max(100),
});

export const alternativeProjectionSchema = z.object({
  name: z.string().min(3).max(120),
  budgetCrore: z.number().min(0).max(100_000).nullable().optional(),
  timeline: z.string().min(2).max(40).optional(),
  impactScores: impactScoresSchema,
  bullets: z.array(z.string().min(8).max(220)).min(2).max(5),
  tradeoffSummary: z.string().min(20).max(420),
  recommendedOverCurrent: z.boolean(),
});

export type AlternativeProjectionResult = z.infer<typeof alternativeProjectionSchema>;

export type ProjectAlternativeProjectionInput = {
  projectTitle: string;
  baselineScores: ImpactScores;
  baselineParams: ScenarioParams;
  baselineViability: number;
  alternativeRaw: string;
  parsedAlternative: ParsedAlternative;
  executiveSummary?: string;
};

export async function projectAlternativeWithAi(
  input: ProjectAlternativeProjectionInput,
): Promise<AlternativeProjectionResult> {
  const system = `You are a decision analyst for DecisionX. Given a simulated baseline plan and a CDO-recommended alternative, project how the alternative would likely score on each impact dimension (0–100 integers).

STRICT RULES:
1. politicalRisk: higher raw score = MORE political risk (worse). Other metrics: higher = better.
2. Scores must be plausible deltas from the baseline — not random. Reference the alternative description.
3. bullets: 2–4 concise tradeoffs (what improves, what might regress) specific to this project.
4. tradeoffSummary: one sentence verdict comparing alternative vs baseline.
5. recommendedOverCurrent: true only if projected overall viability clearly beats baseline.
6. Do NOT claim certainty — this is a directional projection, not a full simulation.
7. Return ONLY valid JSON matching the schema.`;

  const user = `
PROJECT: ${input.projectTitle}

BASELINE (simulated):
  viability index: ${input.baselineViability}
  budget: ₹${input.baselineParams.budget} crore
  timeline: ${input.baselineParams.timeline}
  location: ${input.baselineParams.location}
  scores: ${JSON.stringify(input.baselineScores)}

CDO ALTERNATIVE (from executive report):
${input.alternativeRaw}

PARSED HINTS:
  name: ${input.parsedAlternative.name}
  budget hint: ${input.parsedAlternative.budget ?? "unknown"}
  timeline hint: ${input.parsedAlternative.timeline ?? "unknown"}
  viability delta hint: ${input.parsedAlternative.viabilityDelta ?? "none"}

${input.executiveSummary ? `EXECUTIVE CONTEXT:\n${input.executiveSummary.slice(0, 500)}` : ""}

Respond with JSON:
{"name":"string","budgetCrore":number|null,"timeline":"string","impactScores":{"economic":0-100,"social":0-100,"environmental":0-100,"infrastructure":0-100,"politicalRisk":0-100,"publicAcceptance":0-100},"bullets":["string"],"tradeoffSummary":"string","recommendedOverCurrent":boolean}
`.trim();

  return callAgent({
    system,
    user,
    schema: alternativeProjectionSchema,
    maxTokens: 1200,
  });
}

export function mapAiProjectionToAlternative(
  ai: AlternativeProjectionResult,
  parsed: ParsedAlternative,
  baselineScores: ImpactScores,
): ProjectedAlternative {
  const scores = ai.impactScores;
  const viability = computeViabilityIndex(scores);
  const baselineViability = computeViabilityIndex(baselineScores);

  return {
    name: ai.name || parsed.name,
    budgetLabel: ai.budgetCrore != null ? `₹${ai.budgetCrore} Cr` : parsed.budget,
    timeline: ai.timeline ?? parsed.timeline,
    bullets: ai.bullets.length > 0 ? ai.bullets : parsed.bullets,
    scores,
    viability,
    viabilityDelta: viability - baselineViability,
    budgetCrore: ai.budgetCrore ?? parseBudgetCroreFromText(parsed.budget),
    isProjected: true,
    source: "ai",
    tradeoffSummary: ai.tradeoffSummary,
    recommendedOverCurrent: ai.recommendedOverCurrent,
  };
}

/** Build request fingerprint for react-query cache keys */
export function alternativeProjectionCacheKey(
  projectId: string,
  scenarioId: string,
  alternativeRaw: string,
): string {
  return `${projectId}:${scenarioId}:${alternativeRaw.slice(0, 120)}`;
}

export { parseViabilityDelta };
