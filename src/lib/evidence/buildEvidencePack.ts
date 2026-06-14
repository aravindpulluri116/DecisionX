import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import { IMPACT_AGENT_WEIGHTS } from "@/lib/simulation/computeImpact";
import { buildScoreEvidence, formatSourceLine } from "@/lib/geo/scoreEvidence";
import { IMPACT_METRICS, metricDisplayValue } from "@/lib/workspace/impact-metrics";
import {
  confidenceLevelFromScore,
  predictionReliabilityLabel,
} from "@/lib/evidence/confidence";
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

function toEvidence(
  text: string,
  source: string,
  confidence: number,
  title?: string,
): Evidence {
  const trimmed = text.trim();
  return {
    title: title ?? trimmed.slice(0, 60) + (trimmed.length > 60 ? "…" : ""),
    description: trimmed,
    source,
    confidence,
  };
}

function agentEvidenceItems(result: AgentResult, agentId: AgentId): Evidence[] {
  const label = AGENT_LABELS[agentId];
  return result.evidence.map((e, i) =>
    toEvidence(e, `${label} · evidence ${i + 1}`, result.confidence),
  );
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
    return `${label} score of ${score} — awaiting agent analysis.`;
  }
  return `${label} impact rated ${score}/100, synthesized from ${agents.map((id) => AGENT_LABELS[id]).join(" and ")}. ${summaries[0]!.slice(0, 200)}`;
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

    const agentEvidence: Evidence[] = [];
    const assumptions: string[] = [];
    const uncertainties: string[] = [];
    let confidenceSum = 0;
    let confidenceCount = 0;

    for (const agentId of agents) {
      const result = agentResults[agentId];
      if (!result) continue;
      agentEvidence.push(...agentEvidenceItems(result, agentId));
      assumptions.push(...result.assumptions);
      uncertainties.push(...result.uncertainties);
      confidenceSum += result.confidence;
      confidenceCount++;
    }

    const geoItems = (geoEvidence[metric.key] ?? []).map((g) =>
      toEvidence(
        g,
        locationIntelligence?.unavailable
          ? "AI inference"
          : formatSourceLine(locationIntelligence) || "OpenStreetMap",
        locationIntelligence?.unavailable ? 45 : 72,
      ),
    );

    const evidence = [...agentEvidence, ...geoItems].slice(0, 8);
    const confidence =
      confidenceCount > 0
        ? Math.round(confidenceSum / confidenceCount)
        : evidence.length > 0
          ? Math.round(evidence.reduce((a, e) => a + e.confidence, 0) / evidence.length)
          : 0;

    return {
      metric: metric.key,
      label: metric.label,
      score: displayScore,
      reasoning: buildImpactReasoning(metric.key, displayScore, agents, agentResults),
      evidence,
      assumptions: mergeUnique(assumptions).slice(0, 6),
      uncertainties: mergeUnique(uncertainties).slice(0, 6),
      confidence,
      confidenceLevel: confidenceLevelFromScore(confidence),
      contributingAgents: agents.filter((id) => agentResults[id]),
    };
  });
}

function buildConsequenceExplanations(
  graph: WorkspaceGraph | undefined,
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

      const edgeConf = graph.edges.find((e) => e.target === node.id);
      const confidence =
        intel?.confidence ??
        (typeof edgeConf?.data?.confidence === "number" ? edgeConf.data.confidence : 50);

      const evidence: Evidence[] = (intel?.evidence ?? []).map((e, i) =>
        toEvidence(e, "Future Shock Agent · consequence chain", confidence, `Signal ${i + 1}`),
      );

      return {
        nodeId: node.id,
        label: node.label,
        reason,
        causedBy,
        confidence,
        evidence,
        assumptions: intel?.assumptions ?? [],
        uncertainties: intel?.uncertainties ?? [],
      };
    });
}

function buildReasoningChain(
  agentResults: Partial<Record<AgentId, AgentResult>>,
): ReasoningStep[] {
  const steps: ReasoningStep[] = [];
  let order = 0;

  for (const agentId of AGENT_ORDER) {
    const result = agentResults[agentId];
    if (!result) continue;
    steps.push({
      id: `step-${agentId}`,
      order: order++,
      agentId,
      title: AGENT_LABELS[agentId],
      summary: result.summary,
      evidence: agentEvidenceItems(result, agentId).slice(0, 5),
      assumptions: result.assumptions.slice(0, 4),
      uncertainties: result.uncertainties.slice(0, 4),
      confidence: result.confidence,
      confidenceLevel: result.confidenceLevel,
    });
  }

  return steps;
}

function buildAgentTransparency(
  agentResults: Partial<Record<AgentId, AgentResult>>,
): AgentTransparency[] {
  return AGENT_ORDER.filter((id) => agentResults[id]).map((agentId) => {
    const result = agentResults[agentId]!;
    return {
      agentId,
      label: AGENT_LABELS[agentId],
      findings: [result.summary, ...result.opportunities.slice(0, 2), ...result.risks.slice(0, 2)],
      evidence: agentEvidenceItems(result, agentId),
      assumptions: result.assumptions,
      uncertainties: result.uncertainties,
      confidence: result.confidence,
      confidenceLevel: result.confidenceLevel,
      impactScore: result.impactScore,
    };
  });
}

function buildTrustSummary(
  agentResults: Partial<Record<AgentId, AgentResult>>,
  locationIntelligence: LocationIntelligence | null | undefined,
  impactExplanations: ImpactExplanation[],
): TrustSummary {
  const agents = Object.values(agentResults).filter(Boolean) as AgentResult[];
  const overallConfidence =
    agents.length > 0
      ? Math.round(agents.reduce((a, r) => a + r.confidence, 0) / agents.length)
      : 0;
  const level = confidenceLevelFromScore(overallConfidence);

  const sources = mergeUnique([
    ...agents.flatMap((r) => r.evidence.map(() => "Claude specialist agents")),
    locationIntelligence?.unavailable ? "AI location inference" : formatSourceLine(locationIntelligence),
    ...(locationIntelligence?.sources?.map((s) => s.label) ?? []),
  ]);

  const assumptions = mergeUnique([
    ...agents.flatMap((r) => r.assumptions),
    ...(locationIntelligence?.assumptions ?? []),
  ]).slice(0, 10);

  const uncertainties = mergeUnique(agents.flatMap((r) => r.uncertainties)).slice(0, 10);

  return {
    overallConfidence,
    overallConfidenceLevel: level,
    predictionReliability: predictionReliabilityLabel(level),
    evidenceSources: sources.filter(Boolean),
    assumptions,
    uncertainties,
    agentCount: agents.length,
    disclaimer:
      "All scores are AI-generated projections, not verified facts. Inspect evidence and assumptions before acting.",
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
  const consequenceExplanations = buildConsequenceExplanations(graph);
  const reasoningChain = buildReasoningChain(agentResults);
  const agentTransparency = buildAgentTransparency(agentResults);
  const trustSummary = buildTrustSummary(agentResults, locationIntelligence, impactExplanations);

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
