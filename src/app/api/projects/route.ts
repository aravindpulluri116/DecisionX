import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { withTimeout } from "@/lib/supabase/with-timeout";
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

  const existingById = await withTimeout(
    admin.from("projects").select("*").eq("id", parsed.data.id).maybeSingle(),
    12_000,
  );

  if (existingById.data) {
    return Response.json(existingById.data);
  }

  const existingBySlug = await withTimeout(
    admin.from("projects").select("*").eq("slug", parsed.data.slug).maybeSingle(),
    12_000,
  );

  if (existingBySlug.data) {
    return Response.json(existingBySlug.data);
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

  let insertResult: { data: unknown; error: { code?: string; message: string } | null };
  try {
    insertResult = await withTimeout(
      admin.from("projects").insert(parsed.data).select().single(),
      15_000,
    );
  } catch {
    return Response.json(
      { error: "Database connection timed out. Check Supabase URL and network." },
      { status: 504 },
    );
  }

  const { data, error } = insertResult;

  if (error?.code === "23505") {
    const racedById = await withTimeout(
      admin.from("projects").select("*").eq("id", parsed.data.id).maybeSingle(),
      12_000,
    );
    if (racedById.data) return Response.json(racedById.data);

    const racedBySlug = await withTimeout(
      admin.from("projects").select("*").eq("slug", parsed.data.slug).maybeSingle(),
      12_000,
    );
    if (racedBySlug.data) return Response.json(racedBySlug.data);
  }

  if (error) {
    console.error("[api/projects] insert error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
