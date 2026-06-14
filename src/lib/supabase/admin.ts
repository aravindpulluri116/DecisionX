import { createClient } from "@supabase/supabase-js";
import { resolveSupabaseAnonKey } from "./keys";

/** Server-only client for API writes. Prefers service role; falls back to JWT anon for local RLS-open setups. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = resolveSupabaseAnonKey();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminClientConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || resolveSupabaseAnonKey()),
  );
}
