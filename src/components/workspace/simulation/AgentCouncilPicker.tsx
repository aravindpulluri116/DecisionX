"use client";

import { CouncilPicker } from "@/components/workspace/simulation/CouncilPicker";
import type { AgentId } from "@/types/simulation";

type Props = {
  value: AgentId[];
  onChange: (ids: AgentId[]) => void;
  disabled?: boolean;
  className?: string;
};

/** Agents-only council picker (e.g. scenario re-runs). */
export function AgentCouncilPicker({ value, onChange, disabled, className }: Props) {
  return (
    <CouncilPicker
      agents={value}
      onAgentsChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}
