"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangle, GitBranch, Leaf, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type CanvasNodeData = {
  label: string;
  description?: string | null;
  collapsed?: boolean;
  hasChildren?: boolean;
};

const NODE_META = {
  decision: {
    icon: Target,
    tone: "signal" as const,
    chip: "Decision",
    shape: "rounded-md",
  },
  impact: {
    icon: GitBranch,
    tone: "positive" as const,
    chip: "Impact",
    shape: "rounded-lg",
  },
  risk: {
    icon: AlertTriangle,
    tone: "negative" as const,
    chip: "Risk",
    shape: "rounded-lg",
  },
  stakeholder: {
    icon: Users,
    tone: "warning" as const,
    chip: "Stakeholder",
    shape: "rounded-full",
  },
  environmental: {
    icon: Leaf,
    tone: "environmental" as const,
    chip: "Environment",
    shape: "rounded-lg",
  },
};

const toneClasses = {
  signal: "border-signal/40 bg-signal/6 shadow-[inset_3px_0_0_0_var(--signal)]",
  positive: "border-positive/35 bg-positive/6 shadow-[inset_3px_0_0_0_var(--positive)]",
  negative: "border-negative/40 bg-negative/6 shadow-[inset_3px_0_0_0_var(--negative)]",
  warning: "border-warning/35 bg-warning/6 shadow-[inset_3px_0_0_0_var(--warning)]",
  environmental: "border-environmental/35 bg-environmental/6 shadow-[inset_3px_0_0_0_var(--environmental)]",
};

const chipClasses = {
  signal: "bg-signal/12 text-signal",
  positive: "bg-positive/12 text-positive",
  negative: "bg-negative/12 text-negative",
  warning: "bg-warning/12 text-warning",
  environmental: "bg-environmental/12 text-environmental",
};

function BaseNode({
  type,
  data,
  selected,
}: {
  type: keyof typeof NODE_META;
  data: CanvasNodeData;
  selected?: boolean;
}) {
  const meta = NODE_META[type];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "relative min-w-[148px] max-w-[180px] border px-3 py-2.5 transition-all duration-200",
        meta.shape,
        toneClasses[meta.tone],
        selected && "ring-2 ring-signal/60 ring-offset-2 ring-offset-background scale-[1.02]",
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-ink-muted/80" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-signal" />

      {data.hasChildren && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-hairline bg-surface text-[8px] font-medium text-ink-muted">
          {data.collapsed ? "+" : "−"}
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3 w-3 shrink-0", chipClasses[meta.tone])} />
        <span className={cn("rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide", chipClasses[meta.tone])}>
          {meta.chip}
        </span>
      </div>

      <div className="mt-1.5 font-display text-[13px] font-semibold leading-snug text-ink line-clamp-2">
        {data.label}
      </div>

      {selected && data.description && (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-ink-muted">{data.description}</p>
      )}
    </div>
  );
}

export const DecisionNode = memo(function DecisionNode(props: NodeProps) {
  const data = props.data as CanvasNodeData;
  return <BaseNode type="decision" data={data} selected={props.selected} />;
});

export const ImpactNode = memo(function ImpactNode(props: NodeProps) {
  const data = props.data as CanvasNodeData;
  return <BaseNode type="impact" data={data} selected={props.selected} />;
});

export const RiskNode = memo(function RiskNode(props: NodeProps) {
  const data = props.data as CanvasNodeData;
  return <BaseNode type="risk" data={data} selected={props.selected} />;
});

export const StakeholderNode = memo(function StakeholderNode(props: NodeProps) {
  const data = props.data as CanvasNodeData;
  return <BaseNode type="stakeholder" data={data} selected={props.selected} />;
});

export const EnvironmentalNode = memo(function EnvironmentalNode(props: NodeProps) {
  const data = props.data as CanvasNodeData;
  return <BaseNode type="environmental" data={data} selected={props.selected} />;
});

export const canvasNodeTypes = {
  decision: DecisionNode,
  impact: ImpactNode,
  risk: RiskNode,
  stakeholder: StakeholderNode,
  environmental: EnvironmentalNode,
};

export const CANVAS_LEGEND = Object.entries(NODE_META).map(([type, m]) => ({
  type,
  label: m.chip,
  tone: m.tone,
}));
