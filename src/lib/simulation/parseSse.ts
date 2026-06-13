import type { OrchestratorEvent } from "@/lib/orchestration/events";

export async function* parseSimulationSse(
  response: Response,
): AsyncGenerator<OrchestratorEvent> {
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      try {
        yield JSON.parse(json) as OrchestratorEvent;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
