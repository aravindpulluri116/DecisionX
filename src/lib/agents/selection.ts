import { SPECIALIST_AGENT_IDS } from "@/lib/agents/index";
import type { AgentId } from "@/types/simulation";
import type { ScenarioParams } from "@/types/workspace";

const SPECIALIST_SET = new Set<AgentId>(SPECIALIST_AGENT_IDS);

/** Default council: all six specialists (CDO is always appended at runtime). */
export function defaultSelectedSpecialists(): AgentId[] {
  return [...SPECIALIST_AGENT_IDS];
}

export function normalizeSpecialistSelection(ids: AgentId[] | undefined): AgentId[] {
  if (!ids?.length) return defaultSelectedSpecialists();
  const unique = ids.filter((id) => SPECIALIST_SET.has(id));
  return unique.length > 0 ? unique : defaultSelectedSpecialists();
}

/** Full run order: selected specialists, then Chief Decision Officer. */
export function resolveSimulationAgentOrder(
  params?: Pick<ScenarioParams, "selectedAgents">,
): AgentId[] {
  const specialists = normalizeSpecialistSelection(params?.selectedAgents);
  return [...specialists, "chiefDecisionOfficer"];
}
