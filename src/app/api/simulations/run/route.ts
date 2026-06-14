import { hasAiProviderKey, getAiProviderNotConfiguredError } from "@/lib/config.server";
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
import { validateProjectInputQuality } from "@/lib/validation/projectInput";

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
    // Pass geo + location intelligence through so agents get real geo context
    geo: z.object({
      coords: z.object({ lat: z.number(), lng: z.number() }),
      address: z.string(),
    }).optional(),
    locationIntelligence: z.unknown().optional(),
  }),
  params: z.object({
    budget: z.number(),
    population: z.number(),
    location: z.string(),
    timeline: z.string(),
    projectType: z.string(),
    policyType: z.string(),
    selectedAgents: z
      .array(
        z.enum([
          "economic",
          "social",
          "environmental",
          "stakeholder",
          "risk",
          "futureShock",
          "chiefDecisionOfficer",
        ]),
      )
      .optional(),
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

  if (!hasAiProviderKey()) {
    return Response.json(
      { error: getAiProviderNotConfiguredError() },
      { status: 503 },
    );
  }

  const qualityErrors = validateProjectInputQuality({
    title: input.project.title,
    description: input.project.description,
    location: input.project.location,
    budget: input.project.budget,
    timeline: input.project.timeline,
    category: input.project.category,
    stakeholders: input.project.stakeholders,
  });
  if (Object.keys(qualityErrors).length > 0) {
    return Response.json(
      { error: "Insufficient project input for simulation", details: qualityErrors },
      { status: 422 },
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
