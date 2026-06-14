import type { AgentRunState } from "@/types/simulation";

export type ConsensusLabel = "ANALYZING..." | "PROCEED" | "PROCEED WITH MITIGATION" | "RECONSIDER";

export function computeConfidence(agentRuns: AgentRunState[]): number {
  if (agentRuns.length === 0) return 0;
  const completed = agentRuns.filter((a) => a.status === "completed" && a.result?.confidence != null);
  if (completed.length === 0) {
    return Math.round(
      (agentRuns.filter((a) => a.status === "completed").length / agentRuns.length) * 42,
    );
  }
  const avg =
    completed.reduce((sum, a) => sum + (a.result?.confidence ?? 0), 0) / agentRuns.length;
  const progress = completed.length / agentRuns.length;
  return Math.min(100, Math.round(avg * progress + progress * 12));
}

export function computeConsensusLabel(agentRuns: AgentRunState[]): ConsensusLabel {
  const pending = agentRuns.some((a) => a.status === "queued" || a.status === "running");
  if (pending) return "ANALYZING...";

  const cdo = agentRuns.find((a) => a.id === "chiefDecisionOfficer");
  const text = [
    cdo?.result?.summary ?? "",
    ...(cdo?.result?.recommendations ?? []),
  ]
    .join(" ")
    .toUpperCase();

  if (text.includes("RECONSIDER") || text.includes("OPPOSE") || text.includes("REJECT")) {
    return "RECONSIDER";
  }
  if (text.includes("MITIGATION") || text.includes("CONDITION")) {
    return "PROCEED WITH MITIGATION";
  }
  if (text.includes("PROCEED") || text.includes("APPROVE")) {
    return "PROCEED";
  }

  const failed = agentRuns.filter((a) => a.status === "failed").length;
  if (failed >= 2) return "RECONSIDER";

  const mitigateSignals = agentRuns.filter(
    (a) =>
      a.result?.risks?.length &&
      (a.result?.confidence ?? 100) < 65 &&
      a.id !== "chiefDecisionOfficer",
  ).length;

  if (mitigateSignals >= 2) return "PROCEED WITH MITIGATION";
  return "PROCEED";
}

export function affinityStrength(a: AgentRunState, b: AgentRunState): number {
  if (a.status === "failed" || b.status === "failed") return 0.15;
  if (a.status !== "completed" || b.status !== "completed") return 0.08;
  const ca = a.result?.confidence ?? 50;
  const cb = b.result?.confidence ?? 50;
  const scoreGap = Math.abs(ca - cb);
  return Math.max(0.2, 0.85 - scoreGap / 120);
}

export function orderedAgentRuns(agentRuns: AgentRunState[]): AgentRunState[] {
  return agentRuns;
}

export function activeAgentId(
  agentRuns: AgentRunState[],
  selectedId: string | null,
): string | null {
  if (selectedId) return selectedId;
  const running = agentRuns.find((a) => a.status === "running");
  return running?.id ?? null;
}
