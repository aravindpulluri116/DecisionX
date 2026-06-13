import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import type { AgentRunState, AgentStatus } from "@/types/simulation";

export function initAgentRuns(): AgentRunState[] {
  return AGENT_ORDER.map((id) => ({
    id,
    label: AGENT_LABELS[id],
    status: "queued" as AgentStatus,
    findings: [],
  }));
}
