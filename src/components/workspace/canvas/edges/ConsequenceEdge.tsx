"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export const ConsequenceEdge = memo(function ConsequenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: selected ? "var(--signal)" : "var(--ink-muted)",
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: "6 4",
          opacity: 0.7,
        }}
      />
      <circle r="3" fill="var(--signal)">
        <animateMotion dur="3s" repeatCount="indefinite" path={path} />
      </circle>
    </>
  );
});

export const canvasEdgeTypes = {
  consequence: ConsequenceEdge,
};
