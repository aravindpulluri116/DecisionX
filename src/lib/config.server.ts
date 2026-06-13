import process from "node:process";

// Server-only config. Import only from Route Handlers, Server Actions,
// or other server-only modules — never from client components.
//
// When to use which env-access pattern:
//   - this module: server-only helpers reused across handlers
//   - process.env inside a route handler: one-off reads
//   - NEXT_PUBLIC_*: public config readable from client and server
//     (analytics IDs, public URLs). Never put secrets there.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
  };
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
