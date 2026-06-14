import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import { hasAnthropicKey } from "@/lib/config.server";
import type { AgentContext } from "@/agents/types";
import { assembleGraphFromAgents } from "./graphAssembler";
import { computeImpactFromAgents } from "@/lib/simulation/computeImpact";
import { generateReport } from "@/lib/services/reportService";
import type {
  AgentId,
  AgentResult,
  Simulation,
  SimulationInput,
} from "@/types/simulation";
import type { EventHandler, OrchestratorOptions } from "./events";
import { enrichLocationContext } from "@/lib/enrichment/enrichLocationContext";

async function prepareEnrichedInput(input: SimulationInput, emit: EventHandler): Promise<SimulationInput> {
  await emit({ type: "log", message: "Enriching location context..." });
  const enrichment = await enrichLocationContext(input);
  await emit({ type: "enrichment:ready", intelligence: enrichment });
  await emit({ type: "log", message: "Location intelligence enriched" });
  return {
    ...input,
    project: {
      ...input.project,
      locationIntelligence: enrichment,
      geo: input.project.geo ?? {
        coords: enrichment.coords,
        address: enrichment.address,
      },
    },
  };
}

function buildAgentContext(
  input: SimulationInput,
  priorResults: AgentContext["priorResults"],
  enrichment: AgentContext["enrichment"],
): AgentContext {
  return {
    project: input.project,
    params: input.params,
    priorResults,
    enrichment,
  };
}

async function finalizeSimulation(
  input: SimulationInput,
  simulationId: string,
  tempScenarioId: string,
  agentResults: Partial<Record<AgentId, AgentResult>>,
  emit: EventHandler,
): Promise<Simulation> {
  await emit({ type: "log", message: "Assembling consequence graph..." });
  const graph = assembleGraphFromAgents(tempScenarioId, input.project, input.params, agentResults);
  await emit({ type: "graph:ready", graph });

  const scores = computeImpactFromAgents(agentResults);
  await emit({ type: "scores:ready", scores });

  const simulation: Simulation = {
    id: simulationId,
    projectId: input.project.id,
    status: "completed",
    params: input.params,
    agentResults,
    graph,
    impactScores: scores,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  const report = generateReport(simulation, input.project.title);
  simulation.reportId = report.id;
  await emit({ type: "report:ready", report });
  await emit({ type: "simulation:complete", simulation });
  return simulation;
}

async function runClaudeAgent(
  agentId: AgentId,
  ctx: AgentContext,
  emit: EventHandler,
): Promise<AgentResult | null> {
  const label = AGENT_LABELS[agentId];
  await emit({ type: "agent:status", agentId, status: "running" });
  await emit({ type: "log", message: `${label} engaged` });

  try {
    const { getAgentRunner } = await import("@/lib/agents");
    const runner = getAgentRunner(agentId);
    const { result, findings } = await runner(ctx);
    for (const finding of findings) {
      await emit({ type: "agent:finding", agentId, finding });
    }
    await emit({ type: "agent:complete", agentId, result });
    await emit({ type: "agent:status", agentId, status: "completed" });
    return result;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error(`Agent ${agentId} failed:`, e);
    await emit({ type: "log", message: `${label} failed — continuing with partial analysis` });
    await emit({ type: "agent:status", agentId, status: "failed" });
    return null;
  }
}

export async function runSimulationPipeline(
  input: SimulationInput,
  emit: EventHandler,
  options?: OrchestratorOptions,
): Promise<Simulation> {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is required to run simulations.");
  }

  const simulationId = options?.simulationId ?? crypto.randomUUID();
  const tempScenarioId = crypto.randomUUID();
  const agentResults: Partial<Record<AgentId, AgentResult>> = {};

  const enrichedInput = await prepareEnrichedInput(input, emit);
  const enrichment = enrichedInput.project.locationIntelligence;

  await emit({
    type: "log",
    message: `Initializing multi-agent analysis for ${enrichedInput.project.title}...`,
  });
  await emit({ type: "log", message: "Launching 6 specialist agents in parallel..." });

  const { SPECIALIST_AGENT_IDS } = await import("@/lib/agents");
  const baseCtx = buildAgentContext(enrichedInput, {}, enrichment);

  await Promise.allSettled(
    SPECIALIST_AGENT_IDS.map(async (agentId) => {
      const result = await runClaudeAgent(agentId, baseCtx, emit);
      if (result) {
        agentResults[agentId] = result;
        options?.onAgentComplete?.(simulationId, { ...agentResults });
      }
    }),
  );

  await emit({ type: "log", message: "Specialist phase complete. Chief Decision Officer synthesizing..." });

  const cdoCtx = buildAgentContext(enrichedInput, { ...agentResults }, enrichment);
  const cdoResult = await runClaudeAgent("chiefDecisionOfficer", cdoCtx, emit);
  if (cdoResult) {
    agentResults.chiefDecisionOfficer = cdoResult;
    options?.onAgentComplete?.(simulationId, { ...agentResults });
  }

  return finalizeSimulation(enrichedInput, simulationId, tempScenarioId, agentResults, emit);
}
