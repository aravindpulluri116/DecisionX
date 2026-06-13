import type { SimulationInput } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import { buildLocationIntelligence } from "@/lib/services/geo/context-service";
import { saveLocationIntelligence } from "@/lib/workspace/queries";

export async function enrichLocationContext(input: SimulationInput): Promise<LocationIntelligence> {
  const geo = input.project.geo;
  const intelligence = await buildLocationIntelligence({
    location: input.project.location ?? input.params.location,
    coords: geo?.coords,
    projectArea: geo?.projectArea,
  });

  await saveLocationIntelligence(input.project.id, intelligence, geo?.coords);
  return intelligence;
}
