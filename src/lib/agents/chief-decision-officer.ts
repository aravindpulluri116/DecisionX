import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeCdo } from "./normalize";
import { cdoAgentSchema } from "./schemas";
import { getDecisionVerdict } from "@/lib/scoring/viability";

export async function runChiefDecisionOfficer(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.chiefDecisionOfficer,
    user: `${buildProjectContext(ctx, true)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.chiefDecisionOfficer}`,
    schema: cdoAgentSchema,
  });
  const index = ctx.platformViabilityIndex;
  const verdict = index != null ? getDecisionVerdict(index) : null;
  return {
    result: normalizeCdo(output, index),
    findings: deriveFindings(output.executiveSummary, [
      index != null ? `Platform viability: ${index} — ${verdict?.label ?? "Review"}` : "Executive synthesis complete",
      ...output.keyRisks.slice(0, 1),
    ]),
  };
}
