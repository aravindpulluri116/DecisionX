import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeFutureShock } from "./normalize";
import { futureShockAgentSchema } from "./schemas";

export async function runFutureShockAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.futureShock,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.futureShock}`,
    schema: futureShockAgentSchema,
  });
  return {
    result: normalizeFutureShock(output),
    findings: deriveFindings(
      output.summary,
      output.consequences.slice(0, 3).map((c) => `${c.source} → ${c.target}`),
    ),
  };
}
