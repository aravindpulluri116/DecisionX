import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeStandard } from "./normalize";
import { standardAgentSchema } from "./schemas";

export async function runEconomicAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.economic,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.economic}`,
    schema: standardAgentSchema,
  });
  return {
    result: normalizeStandard("economic", output),
    findings: deriveFindings(output.summary, output.opportunities.slice(0, 2)),
  };
}
