import { hasAnthropicKey } from "@/lib/config.server";
import { enrichProjectContext } from "@/lib/services/enrichProjectContext";
import { qualityProjectInputSchema } from "@/lib/validation/projectInput";
import type { LocationIntelligence } from "@/types/geo";
import { z } from "zod";

export const maxDuration = 120;

const enrichBodySchema = qualityProjectInputSchema.and(
  z.object({
    coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
    locationIntelligence: z.unknown().optional(),
  }),
);

export async function POST(request: Request) {
  if (!hasAnthropicKey()) {
    return Response.json({ error: "ANTHROPIC_API_KEY is required." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = enrichBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { coords, locationIntelligence, ...rest } = parsed.data;

  try {
    const result = await enrichProjectContext({
      ...rest,
      coords,
      locationIntelligence: locationIntelligence as LocationIntelligence | undefined,
    });
    return Response.json(result);
  } catch (e) {
    console.error("Project enrich error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Enrichment failed" },
      { status: 500 },
    );
  }
}
