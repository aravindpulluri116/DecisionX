import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeStakeholder } from "./normalize";
import { stakeholderAgentSchema } from "./schemas";

export async function runStakeholderAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.stakeholder,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.stakeholder}`,
    schema: stakeholderAgentSchema,
  });
  return {
    result: normalizeStakeholder(output),
    findings: deriveFindings(output.summary, [
      `Support: ${output.supportScore}% | Opposition: ${output.oppositionScore}%`,
      ...output.affectedGroups.slice(0, 2),
    ]),
  };
}
