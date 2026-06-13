import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeCdo } from "./normalize";
import { cdoAgentSchema } from "./schemas";

export async function runChiefDecisionOfficer(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.chiefDecisionOfficer,
    user: `${buildProjectContext(ctx, true)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.chiefDecisionOfficer}`,
    schema: cdoAgentSchema,
  });
  return {
    result: normalizeCdo(output),
    findings: deriveFindings(output.executiveSummary, [
      `Viability score: ${output.viabilityScore}`,
      ...output.keyRisks.slice(0, 1),
    ]),
  };
}
