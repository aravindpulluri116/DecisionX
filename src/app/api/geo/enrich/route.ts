import { buildLocationIntelligence } from "@/lib/services/geo/context-service";
import { z } from "zod";

const enrichSchema = z.object({
  location: z.string().min(1).max(500),
  coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = enrichSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const intelligence = await buildLocationIntelligence(parsed.data);
    return Response.json(intelligence);
  } catch {
    return Response.json({ error: "Enrichment failed" }, { status: 500 });
  }
}
