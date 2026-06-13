import dagre from "@dagrejs/dagre";
import type { CanvasNode, CanvasEdge } from "@/types/workspace";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;

/** Dagre layout for persisted graph data (no UI canvas). */
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
