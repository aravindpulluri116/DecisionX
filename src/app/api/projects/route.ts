import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateProjectInputQuality } from "@/lib/validation/projectInput";

const createProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  status: z.enum(["active", "review", "draft", "archived"]),
  impact_score: z.number().min(0).max(100),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  project_type: z.string().min(1),
  location: z.string().min(1),
  description: z.string(),
  category: z.string(),
  stakeholders: z.array(z.string()),
  budget: z.number(),
  timeline: z.string(),
});

export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return Response.json(
      {
        error:
          "Server Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (from `supabase status`).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existingById } = await admin
    .from("projects")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (existingById) {
    return Response.json(existingById);
  }

  const { data: existingBySlug } = await admin
    .from("projects")
    .select("*")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existingBySlug) {
    return Response.json(existingBySlug);
  }

  const qualityErrors = validateProjectInputQuality({
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    budget: parsed.data.budget,
    timeline: parsed.data.timeline,
    category: parsed.data.category,
    stakeholders: parsed.data.stakeholders,
  });
  if (Object.keys(qualityErrors).length > 0) {
    return Response.json(
      { error: "Insufficient project input", details: qualityErrors },
      { status: 422 },
    );
  }

  const { data, error } = await admin.from("projects").insert(parsed.data).select().single();

  if (error?.code === "23505") {
    const { data: racedById } = await admin
      .from("projects")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (racedById) return Response.json(racedById);

    const { data: racedBySlug } = await admin
      .from("projects")
      .select("*")
      .eq("slug", parsed.data.slug)
      .maybeSingle();
    if (racedBySlug) return Response.json(racedBySlug);
  }

  if (error) {
    console.error("[api/projects] insert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
