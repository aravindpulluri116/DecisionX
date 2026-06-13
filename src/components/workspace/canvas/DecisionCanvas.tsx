"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node as FlowNode,
  type OnNodeDrag,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { fetchWorkspaceGraph, persistNodePosition } from "@/lib/workspace/queries";
import { toFlowNodes, toFlowEdges, getHiddenNodeIds } from "@/lib/workspace/layoutGraph";
import { canvasNodeTypes } from "./nodes/CanvasNodes";
import { canvasEdgeTypes } from "./edges/ConsequenceEdge";
import { CanvasOverlayBar } from "./CanvasOverlayBar";
import { WorkspaceEmptyState } from "../shared/WorkspaceEmptyState";

type DecisionCanvasProps = {
  scenarioId: string | null;
  projectTitle: string;
};

export function DecisionCanvas({ scenarioId, projectTitle }: DecisionCanvasProps) {
  const setSelectedNodeId = useWorkspaceStore((s) => s.setSelectedNodeId);
  const setNodeIntelligence = useWorkspaceStore((s) => s.setNodeIntelligence);
  const setDrawerOpen = useWorkspaceStore((s) => s.setDrawerOpen);
  const setBuilderOpen = useWorkspaceStore((s) => s.setBuilderOpen);
  const collapsedNodeIds = useWorkspaceStore((s) => s.collapsedNodeIds);
  const toggleNodeCollapsed = useWorkspaceStore((s) => s.toggleNodeCollapsed);

  const { data: graph, isLoading } = useQuery({
    queryKey: ["workspace-graph", scenarioId],
    queryFn: async () => {
      if (!scenarioId) return null;
      return fetchWorkspaceGraph(scenarioId);
    },
    enabled: Boolean(scenarioId),
  });

  const hiddenIds = useMemo(
    () => (graph ? getHiddenNodeIds(graph.nodes, collapsedNodeIds) : new Set<string>()),
    [graph, collapsedNodeIds],
  );

  const initialNodes = useMemo(
    () => (graph ? toFlowNodes(graph.nodes, hiddenIds, collapsedNodeIds) : []),
    [graph, hiddenIds, collapsedNodeIds],
  );
  const initialEdges = useMemo(
    () => (graph ? toFlowEdges(graph.edges, hiddenIds) : []),
    [graph, hiddenIds],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      setSelectedNodeId(node.id);
      const intel = graph?.intelligence[node.id] ?? null;
      setNodeIntelligence(intel);
      setDrawerOpen(true);
    },
    [graph, setSelectedNodeId, setNodeIntelligence, setDrawerOpen],
  );

  const onNodeDragStop: OnNodeDrag = useCallback((_, node) => {
    persistNodePosition(node.id, node.position);
  }, []);

  if (!scenarioId) {
    return <WorkspaceEmptyState onAction={() => setBuilderOpen(true)} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-signal border-t-transparent" />
        <p className="text-sm text-ink-muted">Loading consequence graph…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <CanvasOverlayBar nodeCount={nodes.length} edgeCount={edges.length} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={(_, node) => toggleNodeCollapsed(node.id)}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.25}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="var(--grid-line)" />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!m-4 !overflow-hidden !rounded-lg !border-hairline !bg-surface/95 !shadow-sm [&>button]:!border-0 [&>button]:!border-b [&>button]:!border-hairline [&>button]:!bg-transparent [&>button:last-child]:!border-b-0 [&>button:hover]:!bg-background"
        />
        <MiniMap
          position="bottom-right"
          className="!m-4 !overflow-hidden !rounded-lg !border-hairline !bg-surface/95 !shadow-sm"
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              decision: "var(--signal)",
              impact: "var(--positive)",
              risk: "var(--negative)",
              stakeholder: "var(--warning)",
              environmental: "var(--environmental)",
            };
            return colors[n.type ?? "decision"] ?? "var(--ink-muted)";
          }}
          maskColor="rgba(248,250,252,0.75)"
        />
      </ReactFlow>
    </div>
  );
}
