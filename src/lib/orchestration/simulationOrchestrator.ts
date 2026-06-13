import { delay } from "@/agents/agentUtils";
import type { SimulationInput } from "@/types/simulation";
import type { OrchestratorEvent } from "./events";
import { runSimulationPipeline } from "./runSimulationServer";

export type { OrchestratorEvent, OrchestratorOptions, EventHandler } from "./events";
export { initAgentRuns } from "./agentRuns";
export { runSimulationPipeline } from "./runSimulationServer";

export async function* runSimulation(
  input: SimulationInput,
  options?: { reducedMotion?: boolean },
): AsyncGenerator<OrchestratorEvent> {
  const queue: OrchestratorEvent[] = [];
  let resolveNext: (() => void) | null = null;
  let done = false;

  const emit = async (event: OrchestratorEvent) => {
    queue.push(event);
    resolveNext?.();
  };

  const runner = runSimulationPipeline(input, emit, {
    reducedMotion: options?.reducedMotion,
  }).finally(() => {
    done = true;
    resolveNext?.();
  });

  while (!done || queue.length > 0) {
    if (queue.length === 0) {
      await new Promise<void>((r) => {
        resolveNext = r;
      });
      continue;
    }
    const event = queue.shift()!;
    yield event;
    if (options?.reducedMotion) await delay(0);
  }

  await runner;
}
