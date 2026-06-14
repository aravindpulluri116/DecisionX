import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import type { AgentRunState, AgentStatus } from "@/types/simulation";

type InitAgentRunsOptions = {
  stakeholders?: string[];
};

export function initAgentRuns(options?: InitAgentRunsOptions): AgentRunState[] {
  const stakeholders = options?.stakeholders?.filter(Boolean) ?? [];

  return AGENT_ORDER.map((id) => ({
    id,
    label:
      id === "stakeholder" && stakeholders.length > 0
        ? `Stakeholder · ${stakeholders.slice(0, 4).join(", ")}${stakeholders.length > 4 ? "…" : ""}`
        : AGENT_LABELS[id],
    status: "queued" as AgentStatus,
    findings: [],
  }));
}
