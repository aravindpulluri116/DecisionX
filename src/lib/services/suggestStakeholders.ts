import { z } from "zod";
import { callAgent } from "@/lib/agents/llmClient";
import { STAKEHOLDER_OPTIONS } from "@/lib/constants/stakeholders";
import type { ProjectCategory } from "@/types/simulation";

const stakeholderEnum = z.enum(
  STAKEHOLDER_OPTIONS as unknown as [typeof STAKEHOLDER_OPTIONS[number], ...typeof STAKEHOLDER_OPTIONS[number][]],
);

export const suggestStakeholdersSchema = z.object({
  stakeholders: z.array(stakeholderEnum).min(2).max(6),
  rationale: z.string().min(10).max(280),
});

export type SuggestStakeholdersResult = z.infer<typeof suggestStakeholdersSchema>;

export type SuggestStakeholdersInput = {
  title: string;
  description: string;
  location: string;
  category: ProjectCategory;
  budget?: number;
  timeline?: string;
};

export async function suggestStakeholders(input: SuggestStakeholdersInput): Promise<SuggestStakeholdersResult> {
  const system = `You identify stakeholder groups affected by a real-world decision project for DecisionX.

Pick ONLY from this exact list (use exact spelling):
${STAKEHOLDER_OPTIONS.map((s) => `- ${s}`).join("\n")}

Rules:
- Choose 2–6 groups most directly affected by THIS specific project (title, description, location, category).
- Prefer groups who win, lose, or must approve — not generic "everyone".
- Do not invent labels outside the list.
- rationale: one short sentence explaining why these groups matter for this project.`;

  const user = `
PROJECT:
  title: ${input.title}
  description: ${input.description}
  location: ${input.location}
  category: ${input.category}
  budget: ${input.budget != null ? `${input.budget} ₹ crore` : "not specified"}
  timeline: ${input.timeline ?? "not specified"}

Respond with JSON:
{"stakeholders":["Citizens",...],"rationale":"string"}
`.trim();

  return callAgent({
    system,
    user,
    schema: suggestStakeholdersSchema,
    maxTokens: 800,
  });
}

/** Keep only valid option labels; dedupe preserving order. */
export function normalizeStakeholderSelection(values: string[]): string[] {
  const allowed = new Set<string>(STAKEHOLDER_OPTIONS);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const trimmed = v.trim();
    if (!allowed.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
