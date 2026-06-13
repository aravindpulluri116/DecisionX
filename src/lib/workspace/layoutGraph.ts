import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { CanvasNode, CanvasEdge, NodeType, WorkspaceGraph } from "@/types/workspace";
import type { ScenarioParams } from "@/types/workspace";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;

export function layoutGraph(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 120 });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });
}

export function toFlowNodes(
  nodes: CanvasNode[],
  hiddenIds: Set<string>,
  collapsedIds?: Set<string>,
): Node[] {
  return nodes
    .filter((n) => !hiddenIds.has(n.id))
    .map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: n.label,
        description: n.description,
        collapsed: collapsedIds?.has(n.id) ?? false,
        hasChildren: nodes.some((c) => c.parent_id === n.id),
      },
    }));
}

export function toFlowEdges(edges: CanvasEdge[], hiddenIds: Set<string>): Edge[] {
  return edges
    .filter((e) => !hiddenIds.has(e.source) && !hiddenIds.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "consequence",
    }));
}

export function getHiddenNodeIds(
  nodes: CanvasNode[],
  collapsedIds: Set<string>,
): Set<string> {
  const hidden = new Set<string>();

  function hideDescendants(parentId: string) {
    for (const node of nodes) {
      if (node.parent_id === parentId) {
        hidden.add(node.id);
        hideDescendants(node.id);
      }
    }
  }

  for (const id of collapsedIds) {
    hideDescendants(id);
  }

  return hidden;
}

export function generateGraphFromParams(
  scenarioId: string,
  decisionLabel: string,
  params: ScenarioParams,
): WorkspaceGraph {
  const rootId = crypto.randomUUID();
  const impact1 = crypto.randomUUID();
  const impact2 = crypto.randomUUID();
  const risk1 = crypto.randomUUID();
  const stakeholder1 = crypto.randomUUID();
  const env1 = crypto.randomUUID();

  const budgetFactor = params.budget / 1000;

  const nodes: CanvasNode[] = [
    {
      id: rootId,
      scenario_id: scenarioId,
      type: "decision",
      label: decisionLabel,
      description: `${params.projectType} decision in ${params.location} over ${params.timeline}.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: null,
    },
    {
      id: impact1,
      scenario_id: scenarioId,
      type: "impact",
      label: "Economic Lift",
      description: `Projected GDP impact of ₹${Math.round(budgetFactor * 1800).toLocaleString("en-IN")} Cr over timeline.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: rootId,
    },
    {
      id: impact2,
      scenario_id: scenarioId,
      type: "impact",
      label: "Service Access",
      description: `${Math.round(params.population * 0.3)}M residents gain improved access.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: rootId,
    },
    {
      id: stakeholder1,
      scenario_id: scenarioId,
      type: "stakeholder",
      label: "Affected Communities",
      description: "Primary stakeholder groups identified via cohort analysis.",
      position: { x: 0, y: 0 },
      data: {},
      parent_id: impact2,
    },
    {
      id: env1,
      scenario_id: scenarioId,
      type: "environmental",
      label: "Environmental Delta",
      description: `Net environmental score shifts by ${Math.round(budgetFactor * 5)} points.`,
      position: { x: 0, y: 0 },
      data: {},
      parent_id: impact1,
    },
    {
      id: risk1,
      scenario_id: scenarioId,
      type: "risk",
      label: "Implementation Risk",
      description: "Budget overrun and timeline slip probability assessed.",
      position: { x: 0, y: 0 },
      data: {},
      parent_id: impact1,
    },
  ];

  const edges: CanvasEdge[] = [
    { id: crypto.randomUUID(), scenario_id: scenarioId, source: rootId, target: impact1, data: {} },
    { id: crypto.randomUUID(), scenario_id: scenarioId, source: rootId, target: impact2, data: {} },
    {
      id: crypto.randomUUID(),
      scenario_id: scenarioId,
      source: impact2,
      target: stakeholder1,
      data: {},
    },
    { id: crypto.randomUUID(), scenario_id: scenarioId, source: impact1, target: env1, data: {} },
    { id: crypto.randomUUID(), scenario_id: scenarioId, source: impact1, target: risk1, data: {} },
  ];

  const laidOut = layoutGraph(nodes, edges);

  const intelligence: WorkspaceGraph["intelligence"] = {};
  const typeStrength: Record<NodeType, number> = {
    decision: 90,
    impact: 75,
    risk: 55,
    stakeholder: 65,
    environmental: 70,
  };

  for (const node of laidOut) {
    intelligence[node.id] = {
      node_id: node.id,
      impact_strength: typeStrength[node.type] + Math.round(budgetFactor * 3),
      confidence: Math.min(95, 70 + Math.round(params.population * 5)),
      stakeholders: ["Government", "Citizens", "Private sector"],
      timeline: [
        { year: "Y1", event: "Planning & approval" },
        { year: "Y3", event: "Primary effects visible" },
        { year: "Y5", event: "Full impact assessment" },
      ],
      mitigation: ["Phased implementation", "Continuous monitoring", "Stakeholder feedback loops"],
      evidence: ["Simulation model output", "Category baseline data", "Agent cross-validation"],
    };
  }

  return { nodes: laidOut, edges, intelligence };
}
