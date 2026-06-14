export class FetchTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${Math.round(ms / 1000)}s`);
    this.name = "FetchTimeoutError";
  }
}

export async function fetchJsonWithTimeout<T>(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number; label?: string } = {},
): Promise<{ ok: boolean; status: number; data: T | null; errorText?: string }> {
  const { timeoutMs = 60_000, label = "Request", ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...fetchInit, signal: controller.signal });
    const text = await res.text();
    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = null;
      }
    }
    return {
      ok: res.ok,
      status: res.status,
      data,
      errorText: res.ok ? undefined : text || res.statusText,
    };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new FetchTimeoutError(label, timeoutMs);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
