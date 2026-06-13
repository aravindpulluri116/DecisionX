import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeRisk } from "./normalize";
import { riskAgentSchema } from "./schemas";

export async function runRiskAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.risk,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.risk}`,
    schema: riskAgentSchema,
  });
  return {
    result: normalizeRisk(output),
    findings: deriveFindings(output.summary, output.riskMatrix.slice(0, 2).map((r) => r.category)),
  };
}
