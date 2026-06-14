import type { AgentContext } from "@/agents/types";
import { callAgent, deriveFindings } from "./claudeClient";
import { AGENT_JSON_SCHEMAS, AGENT_SYSTEM_PROMPTS, buildProjectContext } from "./prompts";
import { normalizeStakeholder } from "./normalize";
import { stakeholderAgentSchema } from "./schemas";
import { SENTIMENT_LABELS, SUPPORT_TREND_LABELS } from "@/lib/trust/labels";
import type { StakeholderSentiment, SupportTrend } from "@/types/simulation";

export async function runStakeholderAgent(ctx: AgentContext) {
  const output = await callAgent({
    system: AGENT_SYSTEM_PROMPTS.stakeholder,
    user: `${buildProjectContext(ctx)}\n\nRespond with JSON matching:\n${AGENT_JSON_SCHEMAS.stakeholder}`,
    schema: stakeholderAgentSchema,
  });
  const trendLabel = SUPPORT_TREND_LABELS[output.supportTrend as SupportTrend] ?? output.supportTrend;
  const groupLines = output.groupSentiments
    .slice(0, 2)
    .map((g) => `${g.group}: ${SENTIMENT_LABELS[g.sentiment as StakeholderSentiment] ?? g.sentiment}`);
  return {
    result: normalizeStakeholder(output),
    findings: deriveFindings(output.summary, [`Support trend: ${trendLabel}`, ...groupLines]),
  };
}
