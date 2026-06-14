import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { getServerConfig } from "@/lib/config.server";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const { anthropicApiKey } = getServerConfig();
  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey: anthropicApiKey });
  }
  return client;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export async function callAgent<T>(opts: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxRetries?: number;
  maxTokens?: number;
}): Promise<T> {
  const { system, user, schema, maxRetries = 2, maxTokens = 6000 } = opts;
  const { anthropicModel } = getServerConfig();
  const anthropic = getClient();

  let lastError = "Unknown validation error";
  let repairHint = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userContent =
      attempt === 0
        ? user
        : `${user}\n\nYour previous response failed schema validation: ${lastError}\nFix ONLY the invalid fields and return corrected JSON.${repairHint}`;

    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      lastError = "No text response from model";
      continue;
    }

    try {
      const raw = extractJson(textBlock.text);
      const parsed = JSON.parse(raw);
      const result = schema.safeParse(parsed);
      if (result.success) return result.data;
      lastError = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      repairHint = `\nSchema fields present: ${Object.keys(parsed).join(", ")}. Missing or wrong types: ${lastError}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "JSON parse error";
      repairHint = "\nReturn ONLY a raw JSON object, no markdown fences.";
    }
  }

  throw new Error(`Agent validation failed (${maxRetries + 1} attempts): ${lastError}`);
}

export function deriveFindings(summary: string, extras: string[] = []): string[] {
  const bullets = [summary.slice(0, 120), ...extras].filter(Boolean);
  return bullets.slice(0, 4);
}
