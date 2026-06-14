import { hasAnthropicKey } from "@/lib/config.server";
import {
  mapAiProjectionToAlternative,
  projectAlternativeWithAi,
} from "@/lib/services/projectAlternativeProjection";
import { parseAlternative } from "@/lib/workspace/report-formatters";
import { computeViabilityIndex } from "@/lib/workspace/impact-metrics";
import { projectAlternativeFromReport } from "@/lib/workspace/alternative-projection";
import { z } from "zod";

const bodySchema = z.object({
  projectTitle: z.string().min(1).max(200),
  baselineScores: z.object({
    economic: z.number(),
    social: z.number(),
    environmental: z.number(),
    infrastructure: z.number(),
    politicalRisk: z.number(),
    publicAcceptance: z.number(),
  }),
  baselineParams: z.object({
    budget: z.number(),
    population: z.number(),
    location: z.string(),
    timeline: z.string(),
    projectType: z.string(),
    policyType: z.string(),
  }),
  alternativeRaw: z.string().min(10).max(4000),
  executiveSummary: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { projectTitle, baselineScores, baselineParams, alternativeRaw, executiveSummary } = parsed.data;
  const parsedAlternative = parseAlternative(alternativeRaw);
  const baselineViability = computeViabilityIndex(baselineScores);

  if (!hasAnthropicKey()) {
    const fallback = projectAlternativeFromReport(baselineScores, parsedAlternative);
    return Response.json({ alternative: fallback, source: "heuristic" as const });
  }

  try {
    const ai = await projectAlternativeWithAi({
      projectTitle,
      baselineScores,
      baselineParams,
      baselineViability,
      alternativeRaw,
      parsedAlternative,
      executiveSummary,
    });

    const alternative = mapAiProjectionToAlternative(ai, parsedAlternative, baselineScores);
    return Response.json({ alternative, source: "ai" as const });
  } catch (e) {
    console.error("[api/compare/project-alternative]", e);
    const fallback = projectAlternativeFromReport(baselineScores, parsedAlternative);
    return Response.json({
      alternative: fallback,
      source: "heuristic" as const,
      warning: e instanceof Error ? e.message : "AI projection failed; using estimate",
    });
  }
}
