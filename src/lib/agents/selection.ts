import { SPECIALIST_AGENT_IDS } from "@/lib/agents/index";
import type { AgentId } from "@/types/simulation";
import type { ScenarioParams } from "@/types/workspace";

const SPECIALIST_SET = new Set<AgentId>(SPECIALIST_AGENT_IDS);

/** Default council when nothing was saved (legacy scenarios only). */
export function defaultSelectedSpecialists(): AgentId[] {
  return [...SPECIALIST_AGENT_IDS];
}

/**
 * Keep only valid specialist ids in canonical council order.
 * Never expands an explicit user selection to the full roster.
 */
export function normalizeSpecialistSelection(ids: AgentId[] | undefined): AgentId[] {
  if (!ids?.length) return [];
  const picked = new Set(ids.filter((id) => SPECIALIST_SET.has(id)));
  if (picked.size === 0) return [];
  return SPECIALIST_AGENT_IDS.filter((id) => picked.has(id));
}

/** Full run order: selected specialists only, then Chief Decision Officer. */
export function resolveSimulationAgentOrder(
  params?: Pick<ScenarioParams, "selectedAgents">,
): AgentId[] {
  const specialists = normalizeSpecialistSelection(params?.selectedAgents);
  if (specialists.length === 0) {
    throw new Error("Select at least one council specialist before running a simulation.");
  }
  return [...specialists, "chiefDecisionOfficer"];
}
