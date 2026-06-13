import type { AgentId, AgentResult, DecisionProject } from "@/types/simulation";
import type { CanvasEdge, CanvasNode, NodeIntelligence, ScenarioParams, WorkspaceGraph } from "@/types/workspace";
import { layoutGraph } from "@/lib/workspace/layoutGraph";
import { getFutureShockConsequences } from "@/lib/agents/normalize";
import type { ConsequenceLink } from "@/lib/agents/schemas";

const SPECIALIST_AGENTS: { id: AgentId; nodeType: CanvasNode["type"] }[] = [
  { id: "economic", nodeType: "impact" },
  { id: "social", nodeType: "stakeholder" },
  { id: "environmental", nodeType: "environmental" },
  { id: "stakeholder", nodeType: "stakeholder" },
  { id: "risk", nodeType: "risk" },
];

function mapAgentToEvidence(agentResults: Partial<Record<AgentId, AgentResult>>): string[] {
  const evidence: string[] = [];
  for (const result of Object.values(agentResults)) {
    if (result?.evidence?.length) {
      evidence.push(...result.evidence.slice(0, 2));
    }
  }
  return evidence.slice(0, 6);
}

function consequenceTypeToNodeType(type: ConsequenceLink["type"]): CanvasNode["type"] {
  const map: Record<ConsequenceLink["type"], CanvasNode["type"]> = {
    impact: "impact",
    risk: "risk",
    stakeholder: "stakeholder",
    environmental: "environmental",
    economic: "impact",
    social: "stakeholder",
  };
  return map[type] ?? "impact";
}

function buildRootIntelligence(
  rootId: string,
  project: DecisionProject,
  agentResults: Partial<Record<AgentId, AgentResult>>,
  globalEvidence: string[],
): NodeIntelligence {
  const cdo = agentResults.chiefDecisionOfficer;
  const economic = agentResults.economic;
  return {
    node_id: rootId,
    impact_strength: cdo?.impactScore ?? economic?.impactScore ?? 50,
    confidence: cdo?.confidence ?? economic?.confidence ?? 50,
    stakeholders: project.stakeholders,
    timeline: cdo?.summary
      ? [{ year: "Now", event: cdo.summary.slice(0, 120) }]
      : [{ year: "Y1", event: "Project initiation" }],
    mitigation: cdo?.recommendations ?? economic?.recommendations ?? [],
    evidence: globalEvidence,
    assumptions: cdo?.assumptions,
    uncertainties: cdo?.uncertainties,
  };
}

function buildGraphFromConsequences(
  scenarioId: string,
  project: DecisionProject,
  params: ScenarioParams,
  agentResults: Partial<Record<AgentId, AgentResult>>,
  consequences: ConsequenceLink[],
): WorkspaceGraph | null {
  if (consequences.length < 2) return null;

  const rootId = crypto.randomUUID();
  const labelToId = new Map<string, string>();
  labelToId.set(consequences[0].source, rootId);

  const nodes: CanvasNode[] = [
    {
      id: rootId,
      scenario_id: scenarioId,
      type: "decision",
      label: consequences[0].source || project.title,
      description: project.description || `${project.category} decision in ${params.location}.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: null,
    },
  ];
  const edges: CanvasEdge[] = [];
  const intelligence: Record<string, NodeIntelligence> = {};
  const fsResult = agentResults.futureShock;
  const globalEvidence = mapAgentToEvidence(agentResults);

  for (const link of consequences) {
    if (!labelToId.has(link.source)) {
      const sourceId = crypto.randomUUID();
      labelToId.set(link.source, sourceId);
      nodes.push({
        id: sourceId,
        scenario_id: scenarioId,
        type: "impact",
        label: link.source,
        description: link.source,
        position: { x: 0, y: 0 },
        data: {},
        parent_id: null,
      });
    }
    if (!labelToId.has(link.target)) {
      const targetId = crypto.randomUUID();
      labelToId.set(link.target, targetId);
      nodes.push({
        id: targetId,
        scenario_id: scenarioId,
        type: consequenceTypeToNodeType(link.type),
        label: link.target,
        description: `${link.type} consequence following ${link.source}`,
        position: { x: 0, y: 0 },
        data: {},
        parent_id: labelToId.get(link.source) ?? null,
      });
    }

    const sourceId = labelToId.get(link.source)!;
    const targetId = labelToId.get(link.target)!;
    edges.push({
      id: crypto.randomUUID(),
      scenario_id: scenarioId,
      source: sourceId,
      target: targetId,
      data: { confidence: link.confidence },
    });

    intelligence[targetId] = {
      node_id: targetId,
      impact_strength: link.confidence,
      confidence: link.confidence,
      stakeholders: project.stakeholders.length ? [...project.stakeholders] : [],
      timeline: [{ year: "Projected", event: `${link.source} affects ${link.target}` }],
      mitigation: fsResult?.recommendations.slice(0, 3) ?? [],
      evidence: fsResult?.evidence?.length ? fsResult.evidence : globalEvidence.slice(0, 3),
      assumptions: fsResult?.assumptions,
      uncertainties: fsResult?.uncertainties,
    };
  }

  intelligence[rootId] = buildRootIntelligence(rootId, project, agentResults, globalEvidence);

  const laidOut = layoutGraph(nodes, edges);
  return { nodes: laidOut, edges, intelligence };
}

function buildGraphFromSpecialists(
  scenarioId: string,
  project: DecisionProject,
  params: ScenarioParams,
  agentResults: Partial<Record<AgentId, AgentResult>>,
): WorkspaceGraph {
  const rootId = crypto.randomUUID();
  const globalEvidence = mapAgentToEvidence(agentResults);
  const nodes: CanvasNode[] = [
    {
      id: rootId,
      scenario_id: scenarioId,
      type: "decision",
      label: project.title,
      description: project.description || `${project.category} decision in ${params.location}.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: null,
    },
  ];
  const edges: CanvasEdge[] = [];
  const intelligence: Record<string, NodeIntelligence> = {};

  let prevId = rootId;
  for (const { id: agentId, nodeType } of SPECIALIST_AGENTS) {
    const agentResult = agentResults[agentId];
    if (!agentResult) continue;

    const label =
      agentResult.opportunities[0] ??
      agentResult.risks[0] ??
      agentResult.summary.slice(0, 56);

    const nodeId = crypto.randomUUID();
    nodes.push({
      id: nodeId,
      scenario_id: scenarioId,
      type: nodeType,
      label,
      description: agentResult.summary.slice(0, 160),
      position: { x: 0, y: 0 },
      data: { agentId },
      parent_id: prevId,
    });

    edges.push({
      id: crypto.randomUUID(),
      scenario_id: scenarioId,
      source: prevId,
      target: nodeId,
      data: { confidence: agentResult.confidence },
    });

    intelligence[nodeId] = {
      node_id: nodeId,
      impact_strength: agentResult.impactScore,
      confidence: agentResult.confidence,
      stakeholders: project.stakeholders.length ? [...project.stakeholders] : [],
      timeline: [{ year: "Analysis", event: agentResult.summary.slice(0, 120) }],
      mitigation: agentResult.recommendations.slice(0, 3),
      evidence: agentResult.evidence,
      assumptions: agentResult.assumptions,
      uncertainties: agentResult.uncertainties,
    };

    prevId = nodeId;
  }

  intelligence[rootId] = buildRootIntelligence(rootId, project, agentResults, globalEvidence);

  const laidOut = layoutGraph(nodes, edges);
  return { nodes: laidOut, edges, intelligence };
}

export function assembleGraphFromAgents(
  scenarioId: string,
  project: DecisionProject,
  params: ScenarioParams,
  agentResults: Partial<Record<AgentId, AgentResult>>,
): WorkspaceGraph {
  const consequences = getFutureShockConsequences(agentResults.futureShock);
  if (consequences?.length) {
    const fromConsequences = buildGraphFromConsequences(
      scenarioId,
      project,
      params,
      agentResults,
      consequences,
    );
    if (fromConsequences) return fromConsequences;
  }

  return buildGraphFromSpecialists(scenarioId, project, params, agentResults);
}
