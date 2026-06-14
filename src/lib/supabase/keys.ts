/** JWT anon key for Supabase REST — not sb_publishable_* keys. */
export function resolveSupabaseAnonKey(): string | undefined {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (anon && !anon.startsWith("sb_publishable_")) {
    return anon;
  }

  if (publishable && !publishable.startsWith("sb_publishable_")) {
    return publishable;
  }

  return undefined;
}

export function isPublishableKeyMisconfigured(): boolean {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(anon?.startsWith("sb_publishable_"));
}
