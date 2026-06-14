import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import { IMPACT_AGENT_WEIGHTS } from "@/lib/simulation/computeImpact";
import { buildScoreEvidence, formatSourceLine } from "@/lib/geo/scoreEvidence";
import { IMPACT_METRICS, metricDisplayValue } from "@/lib/workspace/impact-metrics";
import { deriveConfidence, predictionReliabilityFromLevel } from "@/lib/trust/deriveConfidence";
import { AI_SPONSOR_NAME } from "@/lib/brand";
import type { AgentId, AgentResult, Simulation } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import type { ImpactScores, NodeIntelligence, WorkspaceGraph } from "@/types/workspace";
import type {
  AgentTransparency,
  ConsequenceExplanation,
  Evidence,
  EvidencePack,
  ImpactExplanation,
  ReasoningStep,
  TrustSummary,
} from "@/types/evidence";

function toEvidence(text: string, source: string, confidenceLevel: Evidence["confidenceLevel"], title?: string): Evidence {
  const trimmed = text.trim();
  return {
    title: title ?? trimmed.slice(0, 60) + (trimmed.length > 60 ? "…" : ""),
    description: trimmed,
    source,
    confidenceLevel,
  };
}

function mergeUnique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function buildImpactReasoning(
  metricKey: keyof ImpactScores,
  score: number,
  agents: AgentId[],
  agentResults: Partial<Record<AgentId, AgentResult>>,
): string {
  const summaries = agents
    .map((id) => agentResults[id]?.summary)
    .filter(Boolean)
    .slice(0, 2);
  const metric = IMPACT_METRICS.find((m) => m.key === metricKey);
  const label = metric?.label ?? metricKey;
  if (summaries.length === 0) {
    return `${label} projection rated ${score} — awaiting agent analysis.`;
  }
  return `${label} projection rated ${score}, synthesized from ${agents.map((id) => AGENT_LABELS[id]).join(" and ")}. ${summaries[0]!.slice(0, 200)}`;
}

function buildImpactExplanations(
  scores: ImpactScores,
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
): ImpactExplanation[] {
  const geoEvidence = buildScoreEvidence(locationIntelligence, scores);

  return IMPACT_METRICS.map((metric) => {
    const agents = IMPACT_AGENT_WEIGHTS[metric.key];
    const displayScore = metricDisplayValue(scores, metric);

    const assumptions: string[] = [];
    const uncertainties: string[] = [];
    const evidenceTexts: string[] = [];

    for (const agentId of agents) {
      const result = agentResults[agentId];
      if (!result) continue;
      evidenceTexts.push(...result.evidence);
      assumptions.push(...result.assumptions);
      uncertainties.push(...result.uncertainties);
    }

    const derived = deriveConfidence({
      agentResults,
      locationIntelligence,
      contributingAgentIds: agents.filter((id) => agentResults[id]),
      extraEvidenceCount: (geoEvidence[metric.key] ?? []).length,
      extraUncertainties: uncertainties,
    });

    const agentEvidence = agents
      .flatMap((agentId) => {
        const result = agentResults[agentId];
        if (!result) return [];
        return result.evidence.map((e, i) =>
          toEvidence(e, `${AGENT_LABELS[agentId]} · evidence ${i + 1}`, derived.level),
        );
      })
      .slice(0, 6);

    const geoItems = (geoEvidence[metric.key] ?? []).map((g) =>
      toEvidence(
        g,
        locationIntelligence?.unavailable
          ? "AI inference"
          : formatSourceLine(locationIntelligence) || "OpenStreetMap",
        derived.level,
      ),
    );

    return {
      metric: metric.key,
      label: metric.label,
      score: displayScore,
      reasoning: buildImpactReasoning(metric.key, displayScore, agents, agentResults),
      evidence: [...agentEvidence, ...geoItems].slice(0, 8),
      assumptions: mergeUnique(assumptions).slice(0, 6),
      uncertainties: mergeUnique(uncertainties).slice(0, 6),
      confidenceLevel: derived.level,
      confidenceBasis: derived.basis,
      contributingAgents: agents.filter((id) => agentResults[id]),
    };
  });
}

function linkStrengthLabel(strength?: string): string {
  switch (strength) {
    case "direct":
      return "Direct link";
    case "speculative":
      return "Speculative link";
    default:
      return "Indirect link";
  }
}

function buildConsequenceExplanations(
  graph: WorkspaceGraph | undefined,
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
): ConsequenceExplanation[] {
  if (!graph?.nodes.length) return [];

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const parentLabels = new Map<string, string>();

  for (const node of graph.nodes) {
    if (node.parent_id) {
      const parent = nodeById.get(node.parent_id);
      if (parent) parentLabels.set(node.id, parent.label);
    }
  }

  for (const edge of graph.edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (source && target && !parentLabels.has(target.id)) {
      parentLabels.set(target.id, source.label);
    }
  }

  const fs = agentResults.futureShock;

  return graph.nodes
    .filter((n) => n.type !== "decision")
    .map((node) => {
      const intel: NodeIntelligence | undefined = graph.intelligence[node.id];
      const causedBy = intel?.causedBy ?? parentLabels.get(node.id) ?? null;
      const reason =
        intel?.reason ??
        intel?.timeline?.[0]?.event ??
        node.description ??
        `Projected ${node.type} outcome linked to upstream decision factors.`;

      const linkStrength =
        (intel as { linkStrength?: "direct" | "indirect" | "speculative" })?.linkStrength ??
        (typeof edgeDataLinkStrength(graph, node.id) === "string"
          ? edgeDataLinkStrength(graph, node.id)
          : "indirect");

      const derived = deriveConfidence({
        agentResults,
        locationIntelligence,
        contributingAgentIds: fs ? ["futureShock"] : [],
        extraEvidenceCount: intel?.evidence?.length ?? 0,
        extraUncertainties: intel?.uncertainties ?? [],
      });

      const evidence: Evidence[] = (intel?.evidence ?? []).map((e, i) =>
        toEvidence(e, "Future Shock Agent · consequence chain", derived.level, `Signal ${i + 1}`),
      );

      return {
        nodeId: node.id,
        label: node.label,
        reason,
        causedBy,
        linkStrength,
        confidenceLevel: derived.level,
        confidenceBasis: derived.basis,
        evidence,
        assumptions: intel?.assumptions ?? [],
        uncertainties: intel?.uncertainties ?? [],
      };
    });
}

function edgeDataLinkStrength(
  graph: WorkspaceGraph,
  nodeId: string,
): "direct" | "indirect" | "speculative" | undefined {
  const edge = graph.edges.find((e) => e.target === nodeId);
  const data = edge?.data as { linkStrength?: string } | undefined;
  if (data?.linkStrength === "direct" || data?.linkStrength === "indirect" || data?.linkStrength === "speculative") {
    return data.linkStrength;
  }
  return undefined;
}

function buildReasoningChain(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
): ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  let order = 0;

  for (const agentId of AGENT_ORDER) {
    const result = agentResults[agentId];
    if (!result) continue;
    const derived = deriveConfidence({
      agentResults,
      locationIntelligence,
      contributingAgentIds: [agentId],
    });
    steps.push({
      id: `step-${agentId}`,
      order: order++,
      agentId,
      title: AGENT_LABELS[agentId],
      summary: result.summary,
      evidence: result.evidence
        .slice(0, 5)
        .map((e, i) => toEvidence(e, `${AGENT_LABELS[agentId]} · evidence ${i + 1}`, derived.level)),
      assumptions: result.assumptions.slice(0, 4),
      uncertainties: result.uncertainties.slice(0, 4),
      confidenceLevel: derived.level,
      confidenceBasis: derived.basis,
    });
  }

  return steps;
}

function buildAgentTransparency(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
): AgentTransparency[] {
  return AGENT_ORDER.filter((id) => agentResults[id]).map((agentId) => {
    const result = agentResults[agentId]!;
    const derived = deriveConfidence({
      agentResults,
      locationIntelligence,
      contributingAgentIds: [agentId],
    });
    return {
      agentId,
      label: AGENT_LABELS[agentId],
      findings: [result.summary, ...result.opportunities.slice(0, 2), ...result.risks.slice(0, 2)],
      evidence: result.evidence.map((e, i) =>
        toEvidence(e, `${AGENT_LABELS[agentId]} · evidence ${i + 1}`, derived.level),
      ),
      assumptions: result.assumptions,
      uncertainties: result.uncertainties,
      confidenceLevel: derived.level,
      confidenceBasis: derived.basis,
      impactScore: result.impactScore,
    };
  });
}

function buildTrustSummary(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
): TrustSummary {
  const derived = deriveConfidence({ agentResults, locationIntelligence });
  const agents = Object.values(agentResults).filter(Boolean) as AgentResult[];

  const sources = mergeUnique([
    ...agents.flatMap((r) => (r.evidence.length ? [`${AI_SPONSOR_NAME} specialist agents`] : [])),
    locationIntelligence?.unavailable ? "AI location inference" : formatSourceLine(locationIntelligence),
    ...(locationIntelligence?.sources?.map((s) => s.label) ?? []),
  ]);

  return {
    overallConfidenceLevel: derived.level,
    confidenceBasis: derived.basis,
    predictionReliability: predictionReliabilityFromLevel(derived.level),
    evidenceSources: sources.filter(Boolean),
    assumptions: mergeUnique([
      ...agents.flatMap((r) => r.assumptions),
      ...(locationIntelligence?.assumptions ?? []),
    ]).slice(0, 10),
    uncertainties: mergeUnique(agents.flatMap((r) => r.uncertainties)).slice(0, 10),
    agentCount: agents.length,
    disclaimer:
      "All projections are AI-generated estimates, not verified measurements. Inspect assumptions and known unknowns before acting.",
  };
}

export function buildEvidencePack(opts: {
  scores: ImpactScores | null | undefined;
  agentResults: Partial<Record<AgentId, AgentResult>>;
  graph?: WorkspaceGraph;
  locationIntelligence?: LocationIntelligence | null;
}): EvidencePack | null {
  const { scores, agentResults, graph, locationIntelligence } = opts;
  if (!scores || Object.keys(agentResults).length === 0) return null;

  const impactExplanations = buildImpactExplanations(scores, agentResults, locationIntelligence);
  const consequenceExplanations = buildConsequenceExplanations(graph, agentResults, locationIntelligence);
  const reasoningChain = buildReasoningChain(agentResults, locationIntelligence);
  const agentTransparency = buildAgentTransparency(agentResults, locationIntelligence);
  const trustSummary = buildTrustSummary(agentResults, locationIntelligence);

  return {
    impactExplanations,
    consequenceExplanations,
    reasoningChain,
    agentTransparency,
    trustSummary,
  };
}

export function buildEvidencePackFromSimulation(
  simulation: Simulation | null | undefined,
  locationIntelligence?: LocationIntelligence | null,
): EvidencePack | null {
  if (!simulation) return null;
  return buildEvidencePack({
    scores: simulation.impactScores,
    agentResults: simulation.agentResults,
    graph: simulation.graph,
    locationIntelligence,
  });
}

export { linkStrengthLabel };
