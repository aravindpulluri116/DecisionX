import { AGENT_LABELS } from "@/agents";
import type { AgentId, AgentRunState, AgentStatus } from "@/types/simulation";

type InitAgentRunsOptions = {
  agentIds?: AgentId[];
  stakeholders?: string[];
};

export function initAgentRuns(options: InitAgentRunsOptions): AgentRunState[] {
  const ids = options.agentIds;
  if (!ids?.length) {
    throw new Error("initAgentRuns requires agentIds from the selected council.");
  }
  const stakeholders = options?.stakeholders?.filter(Boolean) ?? [];

  return ids.map((id) => ({
    id,
    label:
      id === "stakeholder" && stakeholders.length > 0
        ? `Stakeholder · ${stakeholders.slice(0, 4).join(", ")}${stakeholders.length > 4 ? "…" : ""}`
        : AGENT_LABELS[id],
    status: "queued" as AgentStatus,
    findings: [],
  }));
}
