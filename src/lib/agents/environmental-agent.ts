import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./llmClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeStandard } from "./normalize";
import { standardAgentSchema } from "./schemas";

export async function runEnvironmentalAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.environmental,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.environmental}`,
    schema: standardAgentSchema,
  });
  return {
    result: normalizeStandard("environmental", output),
    findings: deriveFindings(output.summary, output.opportunities.slice(0, 2)),
  };
}
