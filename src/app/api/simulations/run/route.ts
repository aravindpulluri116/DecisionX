import { hasAnthropicKey } from "@/lib/config.server";
import type { OrchestratorEvent } from "@/lib/orchestration/events";
import { runSimulationPipeline } from "@/lib/orchestration/runSimulationServer";
import type { SimulationInput } from "@/types/simulation";
import {
  createSimulationRun,
  updateSimulationRun,
  createDecisionReport,
} from "@/lib/workspace/queries";
import { saveSimulation, saveReport } from "@/lib/services/simulationService";
import { z } from "zod";

export const maxDuration = 300;

const simulationInputSchema = z.object({
  project: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: z.string(),
    impact_score: z.number(),
    risk_level: z.string(),
    project_type: z.string(),
    location: z.string(),
    created_at: z.string(),
    description: z.string(),
    category: z.string(),
    stakeholders: z.array(z.string()),
    budget: z.number(),
    timeline: z.string(),
  }),
  params: z.object({
    budget: z.number(),
    population: z.number(),
    location: z.string(),
    timeline: z.string(),
    projectType: z.string(),
    policyType: z.string(),
  }),
  scenarioTitle: z.string().optional(),
});

function sseEncode(event: OrchestratorEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  let input: SimulationInput;

  try {
    const body = await request.json();
    input = simulationInputSchema.parse(body) as SimulationInput;
  } catch {
    return Response.json({ error: "Invalid simulation input" }, { status: 400 });
  }

  if (!hasAnthropicKey()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is required to run simulations." },
      { status: 503 },
    );
  }

  const simulationRunId = await createSimulationRun(input.project.id, "running");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const emit = async (event: OrchestratorEvent) => {
        controller.enqueue(encoder.encode(sseEncode(event)));

        if (event.type === "report:ready") {
          saveReport(event.report);
          await createDecisionReport(simulationRunId, event.report);
        }
        if (event.type === "simulation:complete") {
          saveSimulation(event.simulation);
          await updateSimulationRun(simulationRunId, {
            status: "completed",
            agent_states: event.simulation.agentResults,
            scenario_id: event.simulation.scenarioId,
          });
        }
      };

      try {
        await runSimulationPipeline(input, emit, {
          simulationId: simulationRunId,
          onAgentComplete: async (_simId, agentResults) => {
            await updateSimulationRun(simulationRunId, {
              status: "running",
              agent_states: agentResults,
            });
          },
        });
      } catch (e) {
        console.error("Simulation pipeline error:", e);
        await updateSimulationRun(simulationRunId, { status: "failed" });
        controller.enqueue(
          encoder.encode(
            sseEncode({ type: "log", message: "Simulation failed. Please retry." }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
