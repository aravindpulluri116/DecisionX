export class FetchTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${Math.round(ms / 1000)}s`);
    this.name = "FetchTimeoutError";
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number; label?: string } = {},
): Promise<Response> {
  const { timeoutMs = 90_000, label = "Request", ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (fetchInit.signal) {
    fetchInit.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(input, { ...fetchInit, signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new FetchTimeoutError(label, timeoutMs);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
