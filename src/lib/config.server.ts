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
    // Add server-only values here, e.g.:
    //   databaseUrl: process.env.DATABASE_URL,
    //   stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  };
}
