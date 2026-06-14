"use client";

import { SPECIALIST_AGENTS } from "@/lib/marketing/agents";
import {
  SelectionPickerFootnote,
  SelectionPickerGrid,
  type SelectionPickerItem,
} from "@/components/workspace/shared/SelectionPicker";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/types/simulation";

type CouncilPickerProps = {
  agents: AgentId[];
  onAgentsChange: (ids: AgentId[]) => void;
  disabled?: boolean;
  className?: string;
};

export function CouncilPicker({ agents, onAgentsChange, disabled, className }: CouncilPickerProps) {
  const agentItems: SelectionPickerItem[] = SPECIALIST_AGENTS.map((agent) => ({
    id: agent.id,
    label: agent.shortLabel,
    initials: agent.shortLabel.slice(0, 2).toUpperCase(),
    description: agent.tagline,
    color: agent.color,
  }));

  const toggleAgent = (id: AgentId) => {
    if (disabled) return;
    const isOn = agents.includes(id);
    if (isOn && agents.length <= 1) return;
    onAgentsChange(isOn ? agents.filter((x) => x !== id) : [...agents, id]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SelectionPickerGrid
        items={agentItems}
        selectedIds={agents}
        onToggle={(id) => toggleAgent(id as AgentId)}
        disabled={disabled}
        minSelected={1}
        columns={3}
      />
      <SelectionPickerFootnote>
        Pick which agents run this simulation. Chief Decision Officer always synthesizes after
        your selection — the live animation shows only the agents you choose.
      </SelectionPickerFootnote>
    </div>
  );
}
