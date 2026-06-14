"use client";

import { SPECIALIST_AGENTS } from "@/lib/marketing/agents";
import { STAKEHOLDER_OPTIONS } from "@/lib/constants/stakeholders";
import { STAKEHOLDER_VISUALS } from "@/lib/constants/stakeholder-visuals";
import {
  AiInsightBanner,
  SelectionPickerFootnote,
  SelectionPickerGrid,
  createToggleHandler,
  type SelectionPickerItem,
} from "@/components/workspace/shared/SelectionPicker";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/types/simulation";

type CouncilPickerProps = {
  agents: AgentId[];
  onAgentsChange: (ids: AgentId[]) => void;
  stakeholders?: string[];
  onStakeholdersChange?: (groups: string[]) => void;
  disabled?: boolean;
  className?: string;
  variant?: "light" | "dark";
  aiSuggested?: string[];
  aiRationale?: string | null;
  loading?: boolean;
  onUserEdit?: () => void;
};

export function CouncilPicker({
  agents,
  onAgentsChange,
  stakeholders = [],
  onStakeholdersChange,
  disabled,
  className,
  variant = "light",
  aiSuggested = [],
  aiRationale,
  loading,
  onUserEdit,
}: CouncilPickerProps) {
  const showGroups = Boolean(onStakeholdersChange);
  const aiSet = new Set(aiSuggested);
  const selectedGroups = stakeholders.filter((s) =>
    STAKEHOLDER_OPTIONS.includes(s as (typeof STAKEHOLDER_OPTIONS)[number]),
  );
  const stakeholderAgentOn = agents.includes("stakeholder");

  const agentItems: SelectionPickerItem[] = SPECIALIST_AGENTS.map((agent) => ({
    id: agent.id,
    label: agent.shortLabel,
    initials: agent.shortLabel.slice(0, 2).toUpperCase(),
    description: agent.tagline,
    color: agent.color,
  }));

  const groupItems: SelectionPickerItem[] = STAKEHOLDER_OPTIONS.map((name) => {
    const visual = STAKEHOLDER_VISUALS[name];
    return {
      id: name,
      label: name,
      initials: visual.initials,
      description: visual.tagline,
      color: visual.color,
      aiSuggested: aiSet.has(name),
    };
  });

  const toggleAgent = (id: AgentId) => {
    if (disabled || loading) return;
    const isOn = agents.includes(id);
    if (isOn && agents.length <= 1) return;
    onAgentsChange(isOn ? agents.filter((x) => x !== id) : [...agents, id]);
  };

  const toggleGroup = (id: string) => {
    if (disabled || loading) return;
    onUserEdit?.();
    createToggleHandler(selectedGroups, onStakeholdersChange!, 1)(id);
  };

  return (
    <div className={cn("space-y-4", variant === "dark" && "text-white", className)}>
      {showGroups && (
        <AiInsightBanner
          loading={loading}
          loadingLabel="AI is assembling your council…"
          title="AI suggested for this project"
          rationale={aiRationale}
          variant={variant}
        />
      )}

      {!loading && (
        <>
          <div className="space-y-2">
            <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Analysis specialists
            </p>
            <SelectionPickerGrid
              items={agentItems}
              selectedIds={agents}
              onToggle={(id) => toggleAgent(id as AgentId)}
              disabled={disabled}
              minSelected={1}
              columns={3}
            />
          </div>

          {showGroups && (
            <div
              className={cn(
                "space-y-2 rounded-xl border px-3 py-3 transition-colors",
                stakeholderAgentOn
                  ? "border-signal/25 bg-signal/[0.03]"
                  : "border-hairline bg-background/50 opacity-80",
              )}
            >
              <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                Affected groups
                {!stakeholderAgentOn && (
                  <span className="ml-2 normal-case tracking-normal text-ink-muted/70">
                    — enable Stakeholder specialist to analyze these
                  </span>
                )}
              </p>
              <SelectionPickerGrid
                items={groupItems}
                selectedIds={selectedGroups}
                onToggle={toggleGroup}
                disabled={disabled}
                minSelected={1}
                columns={3}
              />
            </div>
          )}

          <SelectionPickerFootnote>
            {showGroups
              ? "One council: pick who analyzes and who is affected. Chief Decision Officer always synthesizes after your selected specialists finish."
              : "Chief Decision Officer always convenes after your selected specialists finish — the live animation shows only the agents you pick."}
          </SelectionPickerFootnote>
        </>
      )}
    </div>
  );
}
