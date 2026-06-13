const DEFAULT_SUPABASE_TIMEOUT_MS = 4_000;

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = DEFAULT_SUPABASE_TIMEOUT_MS,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Supabase request timed out")), ms);
    }),
  ]);
}
