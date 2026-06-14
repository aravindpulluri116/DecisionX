import { hasAnthropicKey } from "@/lib/config.server";
import { enrichProjectContext } from "@/lib/services/enrichProjectContext";
import { qualityProjectInputSchema } from "@/lib/validation/projectInput";

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

  const parsed = qualityProjectInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await enrichProjectContext(parsed.data);
    return Response.json(result);
  } catch (e) {
    console.error("Project enrich error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Enrichment failed" },
      { status: 500 },
    );
  }
}
