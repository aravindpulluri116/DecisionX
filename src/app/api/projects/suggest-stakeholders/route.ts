import { hasAnthropicKey } from "@/lib/config.server";
import { suggestStakeholders } from "@/lib/services/suggestStakeholders";
import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/lib/validation/projectInput";

const bodySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(30).max(4000),
  location: z.string().min(3).max(200),
  category: z.enum(PROJECT_CATEGORIES),
  budget: z.number().positive().optional(),
  timeline: z.string().optional(),
});

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await suggestStakeholders(parsed.data);
    return Response.json(result);
  } catch (e) {
    console.error("Suggest stakeholders error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Suggestion failed" },
      { status: 500 },
    );
  }
}
