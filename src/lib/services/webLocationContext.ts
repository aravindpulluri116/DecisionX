/** Lightweight public web context for a place name (Wikipedia summary). */
export async function fetchWebLocationContext(location: string): Promise<string | null> {
  const query = location.trim().split(",")[0]?.trim();
  if (!query) return null;

  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`,
      { headers: { "User-Agent": "DecisionX/1.0 (decision intelligence)" }, next: { revalidate: 86400 } },
    );
    if (!searchRes.ok) return null;
    const searchJson = (await searchRes.json()) as [string, string[]];
    const title = searchJson[1]?.[0];
    if (!title) return null;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      { headers: { "User-Agent": "DecisionX/1.0 (decision intelligence)" }, next: { revalidate: 86400 } },
    );
    if (!summaryRes.ok) return null;
    const summary = (await summaryRes.json()) as { extract?: string; title?: string };
    if (!summary.extract) return null;
    return `${summary.title ?? title}: ${summary.extract}`;
  } catch {
    return null;
  }
}
