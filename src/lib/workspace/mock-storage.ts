import type { Project, Scenario } from "@/types/workspace";

const PROJECTS_KEY = "decisionx-custom-projects";
const SCENARIOS_KEY = "decisionx-custom-scenarios";
const RECENT_KEY = "decisionx-recent-slugs";
const MAX_RECENT = 12;

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function loadCustomProjects(): Project[] {
  return readJson<Project>(PROJECTS_KEY);
}

export function persistCustomProject(project: Project) {
  const items = loadCustomProjects().filter((p) => p.slug !== project.slug);
  items.push(project);
  writeJson(PROJECTS_KEY, items);
}

export function loadCustomScenarios(): Scenario[] {
  return readJson<Scenario>(SCENARIOS_KEY);
}

export function persistCustomScenario(scenario: Scenario) {
  const items = loadCustomScenarios().filter((s) => s.id !== scenario.id);
  items.push(scenario);
  writeJson(SCENARIOS_KEY, items);
}

export function loadRecentSlugs(): string[] {
  return readJson<string>(RECENT_KEY);
}

export function touchRecentProject(slug: string) {
  const recent = loadRecentSlugs().filter((s) => s !== slug);
  recent.unshift(slug);
  writeJson(RECENT_KEY, recent.slice(0, MAX_RECENT));
}

export function isSupabasePersistenceEnabled(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
