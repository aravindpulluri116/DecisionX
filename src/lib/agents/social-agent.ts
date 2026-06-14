import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./llmClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeStandard } from "./normalize";
import { standardAgentSchema } from "./schemas";

export async function runSocialAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.social,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.social}`,
    schema: standardAgentSchema,
  });
  return {
    result: normalizeStandard("social", output),
    findings: deriveFindings(output.summary, output.risks.slice(0, 2)),
  };
}
