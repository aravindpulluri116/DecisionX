import type { AgentRunState } from "@/types/simulation";

export const AGENT_TRANSCRIPT_DWELL_MS = 3000;

export function isAgentShowable(run: AgentRunState): boolean {
  return (
    run.status === "running" ||
    run.status === "completed" ||
    run.status === "failed" ||
    run.findings.length > 0
  );
}

export function findNextShowableIndex(runs: AgentRunState[], from: number): number | null {
  for (let i = from + 1; i < runs.length; i++) {
    if (isAgentShowable(runs[i])) return i;
  }
  return null;
}

/** Primary live text for the transcript card — always from agent run state. */
export function getAgentTranscriptContent(run: AgentRunState): {
  quote: string | null;
  summary: string | null;
  risk: string | null;
  opportunity: string | null;
  impactScore: number | null;
  mode: "waiting" | "streaming" | "complete" | "failed";
} {
  if (run.status === "failed") {
    return {
      quote: null,
      summary: null,
      risk: null,
      opportunity: null,
      impactScore: null,
      mode: "failed",
    };
  }

  const latestFinding = run.findings[run.findings.length - 1] ?? null;
  const result = run.result;

  if (run.status === "completed" && result) {
    return {
      quote: latestFinding,
      summary: result.summary,
      risk: result.risks[0] ?? null,
      opportunity: result.opportunities[0] ?? null,
      impactScore: result.impactScore,
      mode: "complete",
    };
  }

  if (run.status === "running") {
    return {
      quote: latestFinding,
      summary: null,
      risk: null,
      opportunity: null,
      impactScore: null,
      mode: latestFinding ? "streaming" : "waiting",
    };
  }

  if (latestFinding) {
    return {
      quote: latestFinding,
      summary: null,
      risk: null,
      opportunity: null,
      impactScore: null,
      mode: "streaming",
    };
  }

  return {
    quote: null,
    summary: null,
    risk: null,
    opportunity: null,
    impactScore: null,
    mode: "waiting",
  };
}

/** Bump when agent output changes — used to reset dwell timer on new findings. */
export function agentTranscriptRevision(run: AgentRunState | undefined): string {
  if (!run) return "";
  return [
    run.id,
    run.status,
    run.findings.length,
    run.findings[run.findings.length - 1]?.slice(0, 80) ?? "",
    run.result?.summary?.slice(0, 80) ?? "",
    run.result?.impactScore ?? "",
  ].join("|");
}
