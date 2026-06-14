/** URL-safe slug from project title. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function resolveUniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifyTitle(title) || "project";
  if (!(await isTaken(base))) return base;

  for (let n = 2; n <= 99; n++) {
    const candidate = `${base}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export function isDuplicateSlugError(message: string): boolean {
  return message.includes("projects_slug_key") || message.includes("duplicate key") && message.includes("slug");
}

export function isDuplicateProjectKeyError(message: string, code?: string): boolean {
  return (
    code === "23505" ||
    message.includes("projects_pkey") ||
    isDuplicateSlugError(message)
  );
}
