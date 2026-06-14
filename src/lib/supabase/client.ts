import { createBrowserClient } from "@supabase/ssr";
import { isPublishableKeyMisconfigured, resolveSupabaseAnonKey } from "./keys";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseAnonKey();

  if (!url || !key) {
    if (typeof window !== "undefined" && isPublishableKeyMisconfigured()) {
      console.warn(
        "[DecisionX] NEXT_PUBLIC_SUPABASE_ANON_KEY is a publishable key (sb_publishable_…). " +
          "Use the JWT anon key from `supabase status` (starts with eyJ…).",
      );
    }
    return null;
  }

  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && resolveSupabaseAnonKey());
}
