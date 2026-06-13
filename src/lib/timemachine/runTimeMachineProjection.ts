import type { Simulation } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import type { TimeMachineBundle } from "@/types/timemachine";
import { buildTimeMachineBundle } from "./futureProjector";

export type TimeMachineProjectionInput = {
  agentResults: Simulation["agentResults"];
  impactScores: Simulation["impactScores"];
  params: Simulation["params"];
  geo?: LocationIntelligence | null;
};

export async function runTimeMachineProjection(
  input: TimeMachineProjectionInput,
): Promise<TimeMachineBundle> {
  const scores = input.impactScores ?? {
    economic: 60,
    social: 60,
    environmental: 60,
    infrastructure: 60,
    politicalRisk: 40,
    publicAcceptance: 60,
  };

  return buildTimeMachineBundle(scores, input.params, input.agentResults, input.geo);
}
