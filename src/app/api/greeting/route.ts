import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerConfig } from "@/lib/config.server";

const greetingSchema = z.object({
  name: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = greetingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const config = getServerConfig();

  return NextResponse.json({
    greeting: `Hello, ${parsed.data.name}!`,
    mode: config.nodeEnv ?? "unknown",
  });
}
