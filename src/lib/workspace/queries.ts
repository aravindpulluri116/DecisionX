import type { AgentId, AgentResult, DecisionReport, Simulation } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CanvasNode,
  ImpactScores,
  Project,
  ProjectStatus,
  RiskLevel,
  Scenario,
  ScenarioParams,
  WorkspaceGraph,
} from "@/types/workspace";
import { isDuplicateProjectKeyError, isDuplicateSlugError } from "@/lib/workspace/project-slug";
import { withTimeout } from "@/lib/supabase/with-timeout";
import { getProjectViability } from "@/lib/scoring/viability";

type ScenarioScoreRow = {
  project_id: string;
  impact_scores: unknown;
  is_active: boolean;
  created_at: string;
};

function normalizeImpactScores(scores: unknown): ImpactScores | null {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) return null;
  const s = scores as Record<string, unknown>;
  if (typeof s.economic !== "number") return null;
  return {
    economic: s.economic as number,
    social: (s.social as number) ?? 0,
    environmental: (s.environmental as number) ?? 0,
    infrastructure: (s.infrastructure as number) ?? 0,
    politicalRisk: (s.politicalRisk as number) ?? (s.political_risk as number) ?? 0,
    publicAcceptance: (s.publicAcceptance as number) ?? (s.public_acceptance as number) ?? 0,
  };
}

function pickScenarioScoresForProject(rows: ScenarioScoreRow[], projectId: string): ImpactScores | null {
  const list = rows.filter((r) => r.project_id === projectId);
  const active = list.find((r) => r.is_active);
  const activeScores = active ? normalizeImpactScores(active.impact_scores) : null;
  if (activeScores) return activeScores;

  const sorted = [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  for (const row of sorted) {
    const scores = normalizeImpactScores(row.impact_scores);
    if (scores) return scores;
  }
  return null;
}

async function hydrateProjectImpactScores(projects: Project[]): Promise<Project[]> {
  if (!projects.length) return projects;

  const scenarioRows: ScenarioScoreRow[] = [];
  const supabase = createClient();

  if (supabase) {
    const ids = projects.map((p) => p.id);
    const data = await querySupabase(() =>
      supabase
        .from("scenarios")
        .select("project_id, impact_scores, is_active, created_at")
        .in("project_id", ids)
        .order("created_at", { ascending: false }),
    );
    if (Array.isArray(data)) scenarioRows.push(...(data as ScenarioScoreRow[]));
  }

  if (typeof window !== "undefined") {
    const { loadCustomScenarios } = await import("./mock-storage");
    for (const s of loadCustomScenarios()) {
      scenarioRows.push({
        project_id: s.project_id,
        impact_scores: s.impact_scores,
        is_active: s.is_active,
        created_at: s.created_at,
      });
    }
  }

  return projects.map((project) => {
    const scores = pickScenarioScoresForProject(scenarioRows, project.id);
    if (!scores) return project;
    return { ...project, impact_score: getProjectViability(scores) ?? project.impact_score };
  });
}

/** Browser anon client in the app; service role (or anon) on the server for reliable writes. */
function getDbClient() {
  if (typeof window === "undefined") {
    return createAdminClient() ?? createClient();
  }
  return createClient();
}

async function runDbQuery<T>(
  query: () => PromiseLike<{ data: T | null; error: unknown }>,
): Promise<T | null> {
  try {
    const { data, error } = await withTimeout(query());
    if (error || data == null) return null;
    return data;
  } catch {
    return null;
  }
}

async function querySupabase<T>(
  query: () => PromiseLike<{ data: T | null; error: unknown }>,
): Promise<T | null> {
  try {
    const { data, error } = await withTimeout(query());
    if (error || data == null) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = createClient();
  let rows: Project[] = [];

  if (supabase) {
    const data = await querySupabase(() => supabase.from("projects").select("*").order("created_at"));
    rows = Array.isArray(data) ? (data as Project[]) : [];
  }

  if (typeof window !== "undefined") {
    const { loadCustomProjects } = await import("./mock-storage");
    const local = loadCustomProjects();
    const bySlug = new Map<string, Project>();
    for (const p of local) bySlug.set(p.slug, p);
    for (const p of rows) bySlug.set(p.slug, p);
    const merged = [...bySlug.values()].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return hydrateProjectImpactScores(merged);
  }

  return hydrateProjectImpactScores(rows);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createClient();
  if (!supabase) {
    const { loadCustomProjects } = await import("./mock-storage");
    return loadCustomProjects().find((p) => p.slug === slug) ?? null;
  }

  const data = await querySupabase(() =>
    supabase.from("projects").select("*").eq("slug", slug).single(),
  );
  const row = (data as Project | null) ?? null;
  if (row) return row;

  const { loadCustomProjects } = await import("./mock-storage");
  return loadCustomProjects().find((p) => p.slug === slug) ?? null;
}

export async function fetchScenarios(projectId: string): Promise<Scenario[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const data = await querySupabase(() =>
    supabase
      .from("scenarios")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  );
  return Array.isArray(data) ? (data as Scenario[]) : [];
}

export async function fetchActiveScenario(projectId: string): Promise<Scenario | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const data = await querySupabase(() =>
    supabase
      .from("scenarios")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .maybeSingle(),
  );
  return (data as Scenario | null) ?? null;
}

export async function fetchWorkspaceGraph(scenarioId: string): Promise<WorkspaceGraph | null> {
  const empty: WorkspaceGraph = { nodes: [], edges: [], intelligence: {} };
  const supabase = createClient();
  if (!supabase) return empty;

  try {
    const [nodesRes, edgesRes] = await withTimeout(
      Promise.all([
        supabase.from("canvas_nodes").select("*").eq("scenario_id", scenarioId),
        supabase.from("canvas_edges").select("*").eq("scenario_id", scenarioId),
      ]),
    );

    if (nodesRes.error || !nodesRes.data?.length) return empty;

    const nodeIds = nodesRes.data.map((n) => n.id);
    const intelRes = await withTimeout(
      supabase.from("node_intelligence").select("*").in("node_id", nodeIds),
    );

    const intelligence: WorkspaceGraph["intelligence"] = {};
    for (const row of intelRes.data ?? []) {
      intelligence[row.node_id] = {
        node_id: row.node_id,
        impact_strength: row.impact_strength,
        confidence: row.confidence,
        stakeholders: row.stakeholders as string[],
        timeline: row.timeline as { year: string; event: string }[],
        mitigation: row.mitigation as string[],
        evidence: (row.evidence as string[] | undefined) ?? ["Derived from simulation agents"],
      };
    }

    return {
      nodes: nodesRes.data.map((n) => ({
        ...n,
        position: n.position as { x: number; y: number },
        data: (n.data ?? {}) as Record<string, unknown>,
      })) as CanvasNode[],
      edges: (edgesRes.data ?? []) as WorkspaceGraph["edges"],
      intelligence,
    };
  } catch {
    return empty;
  }
}

export async function activateScenario(projectId: string, scenarioId: string) {
  const supabase = createClient();
  if (!supabase) return;

  await supabase.from("scenarios").update({ is_active: false }).eq("project_id", projectId);
  await supabase.from("scenarios").update({ is_active: true }).eq("id", scenarioId);
}

export async function createScenario(
  projectId: string,
  projectTitle: string,
  title: string,
  params: ScenarioParams,
  scores: ImpactScores,
  graph: WorkspaceGraph,
): Promise<Scenario> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase is required to persist scenarios. Configure NEXT_PUBLIC_SUPABASE_URL.");
  }

  await supabase.from("scenarios").update({ is_active: false }).eq("project_id", projectId);

  const { data: scenario, error } = await supabase
    .from("scenarios")
    .insert({
      project_id: projectId,
      title,
      is_active: true,
      params,
      impact_scores: scores,
    })
    .select()
    .single();

  if (error || !scenario) {
    throw new Error(error?.message ?? "Failed to create scenario");
  }

  const scenarioId = scenario.id as string;

  const nodeIdMap = new Map<string, string>();
  const sortedNodes = [...graph.nodes].sort((a, b) => {
    if (!a.parent_id && b.parent_id) return -1;
    if (a.parent_id && !b.parent_id) return 1;
    return 0;
  });

  for (const node of sortedNodes) {
    const { data: inserted } = await supabase
      .from("canvas_nodes")
      .insert({
        scenario_id: scenarioId,
        type: node.type,
        label: node.label,
        description: node.description,
        position: node.position,
        data: node.data,
        parent_id: node.parent_id ? nodeIdMap.get(node.parent_id) ?? null : null,
      })
      .select("id")
      .single();
    if (inserted) nodeIdMap.set(node.id, inserted.id);
  }

  for (const edge of graph.edges) {
    await supabase.from("canvas_edges").insert({
      scenario_id: scenarioId,
      source: nodeIdMap.get(edge.source) ?? edge.source,
      target: nodeIdMap.get(edge.target) ?? edge.target,
      data: edge.data,
    });
  }

  for (const [oldId, intel] of Object.entries(graph.intelligence)) {
    const newId = nodeIdMap.get(oldId);
    if (newId) {
      await supabase.from("node_intelligence").insert({
        node_id: newId,
        impact_strength: intel.impact_strength,
        confidence: intel.confidence,
        stakeholders: intel.stakeholders,
        timeline: intel.timeline,
        mitigation: intel.mitigation,
        evidence: intel.evidence,
      });
    }
  }

  return scenario as Scenario;
}

export { isSupabaseConfigured };

// --- Simulation runs (Phase 4) ---

type SimulationRunRow = {
  id: string;
  project_id: string;
  scenario_id: string | null;
  status: string;
  agent_states: Partial<Record<AgentId, AgentResult>>;
  report: DecisionReport | null;
  created_at: string;
};

const mockSimulationRuns = new Map<string, SimulationRunRow>();
const mockDecisionReports = new Map<string, DecisionReport>();

export async function createSimulationRun(
  projectId: string,
  status: string,
  id?: string,
): Promise<string> {
  const runId = id ?? crypto.randomUUID();
  const db = getDbClient();

  if (!db) {
    mockSimulationRuns.set(runId, {
      id: runId,
      project_id: projectId,
      scenario_id: null,
      status,
      agent_states: {},
      report: null,
      created_at: new Date().toISOString(),
    });
    return runId;
  }

  const { error } = await db.from("simulation_runs").insert({
    id: runId,
    project_id: projectId,
    status,
    agent_states: {},
  });
  if (error) console.error("[createSimulationRun]", error.message);

  mockSimulationRuns.set(runId, {
    id: runId,
    project_id: projectId,
    scenario_id: null,
    status,
    agent_states: {},
    report: null,
    created_at: new Date().toISOString(),
  });
  return runId;
}

export async function updateSimulationRun(
  id: string,
  patch: {
    status?: string;
    agent_states?: Partial<Record<AgentId, AgentResult>>;
    scenario_id?: string;
    report?: DecisionReport;
  },
) {
  const db = getDbClient();
  const mock = mockSimulationRuns.get(id);

  if (!db) {
    if (mock) {
      mockSimulationRuns.set(id, {
        ...mock,
        status: patch.status ?? mock.status,
        agent_states: patch.agent_states ?? mock.agent_states,
        scenario_id: patch.scenario_id ?? mock.scenario_id,
        report: patch.report ?? mock.report,
      });
    }
    return;
  }

  const update: Record<string, unknown> = {};
  if (patch.status) update.status = patch.status;
  if (patch.agent_states) update.agent_states = patch.agent_states;
  if (patch.scenario_id) update.scenario_id = patch.scenario_id;
  if (patch.report) update.report = patch.report;

  const { error } = await db.from("simulation_runs").update(update).eq("id", id);
  if (error) console.error("[updateSimulationRun]", error.message);

  if (mock) {
    mockSimulationRuns.set(id, {
      ...mock,
      ...patch,
      agent_states: patch.agent_states ?? mock.agent_states,
    });
  } else if (!db && Object.keys(update).length > 0) {
    // Only keep in-memory stubs when Supabase is unavailable — empty stubs would shadow DB reads.
    mockSimulationRuns.set(id, {
      id,
      project_id: "",
      scenario_id: patch.scenario_id ?? null,
      status: patch.status ?? "completed",
      agent_states: patch.agent_states ?? {},
      report: patch.report ?? null,
      created_at: new Date().toISOString(),
    });
  }
}

export async function createDecisionReport(
  simulationRunId: string,
  content: DecisionReport,
): Promise<string> {
  const reportId = content.id;
  mockDecisionReports.set(reportId, content);

  const db = getDbClient();
  if (!db) return reportId;

  const { error: reportError } = await db.from("decision_reports").insert({
    id: reportId,
    simulation_run_id: simulationRunId,
    content,
  });
  if (reportError) console.error("[createDecisionReport]", reportError.message);

  await updateSimulationRun(simulationRunId, { report: content });
  return reportId;
}

function normalizeAgentStates(raw: unknown): Partial<Record<AgentId, AgentResult>> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Partial<Record<AgentId, AgentResult>>;
  }
  return {};
}

function agentStateCount(states: Partial<Record<AgentId, AgentResult>> | undefined): number {
  return Object.keys(states ?? {}).length;
}

async function attachScenarioScores(
  db: NonNullable<ReturnType<typeof getDbClient>>,
  scenarioId: string,
  sim: Simulation,
): Promise<Simulation> {
  const { data: scenarioRow } = await db
    .from("scenarios")
    .select("impact_scores")
    .eq("id", scenarioId)
    .maybeSingle();
  if (scenarioRow?.impact_scores) {
    sim.impactScores = scenarioRow.impact_scores as ImpactScores;
  }
  return sim;
}

function reportFromRunRow(row: {
  id: string;
  project_id: string;
  scenario_id: string | null;
  status: string;
  agent_states: unknown;
  report: unknown;
  created_at: string;
}): DecisionReport | null {
  if (row.report && typeof row.report === "object") {
    return row.report as DecisionReport;
  }
  return null;
}

function runRowToSimulation(
  row: {
    id: string;
    project_id: string;
    scenario_id: string | null;
    status: string;
    agent_states: unknown;
    report: unknown;
    created_at: string;
  },
  graph?: WorkspaceGraph | null,
): Simulation {
  const report = reportFromRunRow(row);
  return {
    id: row.id,
    projectId: row.project_id,
    scenarioId: row.scenario_id ?? undefined,
    status: row.status as Simulation["status"],
    params: { budget: 0, population: 0, location: "", timeline: "10", projectType: "", policyType: "" },
    agentResults: normalizeAgentStates(row.agent_states),
    graph: graph ?? undefined,
    impactScores: undefined,
    reportId: report?.id,
    startedAt: row.created_at,
    completedAt: row.status === "completed" ? row.created_at : undefined,
  };
}

/** Load persisted report for a scenario (or latest project run as fallback). */
export async function fetchReportForProject(
  projectId: string,
  scenarioId?: string | null,
): Promise<DecisionReport | null> {
  if (scenarioId) {
    const linked = await fetchReportForScenario(scenarioId);
    if (linked) return linked;
  }
  return fetchLatestReportForProject(projectId);
}

export async function fetchReportForScenario(scenarioId: string): Promise<DecisionReport | null> {
  const cached = [...mockSimulationRuns.values()].find(
    (r) => r.scenario_id === scenarioId && r.report,
  );
  if (cached?.report) return cached.report;

  const db = getDbClient();
  if (!db) return null;

  const run = await runDbQuery<{ id: string; report: DecisionReport | null }>(() =>
    db
      .from("simulation_runs")
      .select("id, report")
      .eq("scenario_id", scenarioId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );

  if (run?.report) return run.report as DecisionReport;

  if (run?.id) {
    const dr = await runDbQuery<{ content: DecisionReport | null }>(() =>
      db
        .from("decision_reports")
        .select("content")
        .eq("simulation_run_id", run.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
    if (dr?.content) return dr.content as DecisionReport;
  }

  return null;
}

export async function fetchLatestReportForProject(projectId: string): Promise<DecisionReport | null> {
  const cached = [...mockSimulationRuns.values()]
    .filter((r) => r.project_id === projectId && r.report)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (cached?.report) return cached.report;

  const db = getDbClient();
  if (!db) return null;

  const run = await runDbQuery<{ id: string; report: DecisionReport | null }>(() =>
    db
      .from("simulation_runs")
      .select("id, report")
      .eq("project_id", projectId)
      .eq("status", "completed")
      .not("report", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );

  if (run?.report) return run.report as DecisionReport;

  if (run?.id) {
    const dr = await runDbQuery<{ content: DecisionReport | null }>(() =>
      db
        .from("decision_reports")
        .select("content")
        .eq("simulation_run_id", run.id)
        .limit(1)
        .maybeSingle(),
    );
    if (dr?.content) return dr.content as DecisionReport;
  }

  return null;
}

/** Link completed runs that were saved before scenario_id wiring existed. */
export async function linkOrphanSimulationRuns(
  projectId: string,
  scenarioId: string,
): Promise<void> {
  const db = getDbClient();
  if (!db) return;

  const { error } = await db
    .from("simulation_runs")
    .update({ scenario_id: scenarioId })
    .eq("project_id", projectId)
    .eq("status", "completed")
    .is("scenario_id", null);

  if (error) console.error("[linkOrphanSimulationRuns]", error.message);
}

export async function fetchSimulationRunForProject(
  projectId: string,
  scenarioId?: string | null,
): Promise<Simulation | null> {
  const db = getDbClient();

  if (scenarioId && db) {
    const data = await runDbQuery<SimulationRunRow>(() =>
      db
        .from("simulation_runs")
        .select("*")
        .eq("scenario_id", scenarioId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
    if (data) {
      const graph = await fetchWorkspaceGraph(scenarioId);
      const sim = runRowToSimulation(data, graph);
      if (graph?.nodes.length) sim.graph = graph;
      return attachScenarioScores(db, scenarioId, sim);
    }
  }

  if (scenarioId) {
    const mock = [...mockSimulationRuns.values()].find((r) => r.scenario_id === scenarioId);
    if (mock && agentStateCount(mock.agent_states) > 0) {
      return mockRunToSimulation(mock);
    }
  }

  if (!db) {
    const latestMock = [...mockSimulationRuns.values()]
      .filter((r) => r.project_id === projectId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return latestMock && agentStateCount(latestMock.agent_states) > 0
      ? mockRunToSimulation(latestMock)
      : null;
  }

  const data = await runDbQuery<SimulationRunRow>(() =>
    db
      .from("simulation_runs")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );

  if (!data) return null;
  const sid = data.scenario_id as string | null;
  const graph = sid ? await fetchWorkspaceGraph(sid) : null;
  const sim = runRowToSimulation(data, graph);
  if (graph?.nodes.length) sim.graph = graph;
  if (sid) return attachScenarioScores(db, sid, sim);
  return sim;
}

function mockRunToSimulation(mock: SimulationRunRow): Simulation {
  return {
    id: mock.id,
    projectId: mock.project_id,
    scenarioId: mock.scenario_id ?? undefined,
    status: mock.status as Simulation["status"],
    params: { budget: 0, population: 0, location: "", timeline: "10", projectType: "", policyType: "" },
    agentResults: mock.agent_states,
    startedAt: mock.created_at,
    reportId: mock.report?.id,
  };
}

export async function fetchSimulationRun(id: string): Promise<Simulation | null> {
  const mock = mockSimulationRuns.get(id);
  const supabase = createClient();

  if (!supabase) {
    return mock ? mockRunToSimulation(mock) : null;
  }

  const { data } = await supabase.from("simulation_runs").select("*").eq("id", id).maybeSingle();
  if (!data) return mock ? mockRunToSimulation(mock) : null;

  return {
    id: data.id,
    projectId: data.project_id,
    scenarioId: data.scenario_id ?? undefined,
    status: data.status as Simulation["status"],
    params: { budget: 0, population: 0, location: "", timeline: "10", projectType: "", policyType: "" },
    agentResults: normalizeAgentStates(data.agent_states),
    startedAt: data.created_at,
    reportId: (data.report as DecisionReport | null)?.id,
  };
}

export async function fetchDecisionReport(id: string): Promise<DecisionReport | null> {
  const cached = mockDecisionReports.get(id);
  if (cached) return cached;

  const supabase = createClient();
  if (!supabase) return null;

  const { data } = await supabase.from("decision_reports").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return data.content as DecisionReport;
}

export async function ensureProjectRecord(project: {
  id: string;
  slug: string;
  title: string;
  status: string;
  impact_score: number;
  risk_level: string;
  project_type: string;
  location: string;
  description?: string;
  category?: string;
  stakeholders?: string[];
  budget?: number;
  timeline?: string;
}): Promise<string> {
  const row = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    status: project.status,
    impact_score: project.impact_score,
    risk_level: project.risk_level,
    project_type: project.project_type,
    location: project.location,
    description: project.description ?? "",
    category: project.category ?? "Transportation",
    stakeholders: project.stakeholders ?? [],
    budget: project.budget ?? 0,
    timeline: project.timeline ?? "10 years",
  };

  // Browser: use service-role API — anon client cannot see rows RLS hides, causing duplicate inserts.
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string };
        return data.id;
      }
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      if (typeof err.error === "string" && isDuplicateProjectKeyError(err.error)) {
        return project.id;
      }
      console.warn("[ensureProjectRecord] API failed:", err);
    } catch (e) {
      console.warn("[ensureProjectRecord] API error:", e);
    }
    return project.id;
  }

  const db = getDbClient();
  if (!db) {
    throw new Error("Supabase is required. Configure NEXT_PUBLIC_SUPABASE_URL and anon key.");
  }

  const { data: byId } = await db.from("projects").select("id").eq("id", project.id).maybeSingle();
  if (byId?.id) return byId.id as string;

  const { data: bySlug } = await db.from("projects").select("id").eq("slug", project.slug).maybeSingle();
  if (bySlug?.id) return bySlug.id as string;

  const { data, error } = await db.from("projects").insert(row).select("id").single();
  if (error) {
    if (isDuplicateProjectKeyError(error.message ?? "", error.code)) {
      return project.id;
    }
    throw new Error(error.message ?? "Failed to ensure project exists in database");
  }
  if (!data) {
    throw new Error("Failed to ensure project exists in database");
  }

  return data.id as string;
}

export async function updateProjectDraftFields(
  projectId: string,
  fields: {
    description?: string;
    location?: string;
    category?: string;
    stakeholders?: string[];
    budget?: number;
    timeline?: string;
    project_type?: string;
  },
): Promise<void> {
  const db = getDbClient();
  if (db) {
    const { error } = await db.from("projects").update(fields).eq("id", projectId);
    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[updateProjectDraftFields]", error.message);
    }
  }

  if (typeof window !== "undefined") {
    const { loadCustomProjects, persistCustomProject } = await import("./mock-storage");
    const existing = loadCustomProjects().find((p) => p.id === projectId);
    if (existing) persistCustomProject({ ...existing, ...fields });
  }
}

export async function updateProjectImpactScore(projectId: string, impactScore: number): Promise<void> {
  const score = Math.min(100, Math.max(0, Math.round(impactScore)));
  const db = getDbClient();
  if (db) {
    const { error } = await db.from("projects").update({ impact_score: score }).eq("id", projectId);
    if (error) console.error("[updateProjectImpactScore]", error.message);
  }

  if (typeof window !== "undefined") {
    const { loadCustomProjects, persistCustomProject } = await import("./mock-storage");
    const existing = loadCustomProjects().find((p) => p.id === projectId);
    if (existing) persistCustomProject({ ...existing, impact_score: score });
  }
}

export async function insertProject(project: {
  id: string;
  slug: string;
  title: string;
  status: string;
  impact_score: number;
  risk_level: string;
  project_type: string;
  location: string;
  description: string;
  category: string;
  stakeholders: string[];
  budget: number;
  timeline: string;
}): Promise<Project> {
  const created: Project = {
    ...project,
    status: project.status as ProjectStatus,
    risk_level: project.risk_level as RiskLevel,
    created_at: new Date().toISOString(),
  };

  async function persistLocal() {
    if (typeof window !== "undefined") {
      const { persistCustomProject } = await import("./mock-storage");
      persistCustomProject(created);
    }
    return created;
  }

  // Prefer server route (service role) — avoids browser 401 from wrong anon/publishable key.
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20_000);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
      if (res.ok) {
        const data = (await res.json()) as Project;
        await persistLocal();
        return data;
      }
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      if (typeof err.error === "string" && isDuplicateSlugError(err.error)) {
        const existing = await fetchProjectBySlug(project.slug);
        if (existing) {
          if (typeof window !== "undefined") {
            const { persistCustomProject } = await import("./mock-storage");
            persistCustomProject(existing);
          }
          return existing;
        }
      }
      console.warn("[insertProject] API failed:", err);
      return persistLocal();
    } catch (e) {
      console.warn("[insertProject] API error:", e);
      return persistLocal();
    }
  }

  const supabase = createClient();
  if (!supabase) {
    return persistLocal();
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("projects")
        .insert({
          id: project.id,
          slug: project.slug,
          title: project.title,
          status: project.status,
          impact_score: project.impact_score,
          risk_level: project.risk_level,
          project_type: project.project_type,
          location: project.location,
          description: project.description,
          category: project.category,
          stakeholders: project.stakeholders,
          budget: project.budget,
          timeline: project.timeline,
        })
        .select()
        .single(),
    );

    if (error || !data) {
      if (error && isDuplicateSlugError(error.message)) {
        const existing = await fetchProjectBySlug(project.slug);
        if (existing) {
          if (typeof window !== "undefined") {
            const { persistCustomProject } = await import("./mock-storage");
            persistCustomProject(existing);
          }
          return existing;
        }
      }
      throw new Error(error?.message ?? "Failed to insert project");
    }

    await persistLocal();
    return data as Project;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to insert project";
    console.warn("[insertProject] direct insert failed:", message);
    return persistLocal();
  }
}

const mockLocationIntel = new Map<string, LocationIntelligence>();

export async function saveLocationIntelligence(
  projectId: string,
  intelligence: LocationIntelligence,
  coords?: { lat: number; lng: number },
): Promise<void> {
  mockLocationIntel.set(projectId, intelligence);
  const supabase = createClient();
  if (!supabase) return;

  await supabase
    .from("projects")
    .update({
      location_intelligence: intelligence,
      lat: coords?.lat ?? intelligence.coords.lat,
      lng: coords?.lng ?? intelligence.coords.lng,
      address: intelligence.address,
    })
    .eq("id", projectId);
}

export async function fetchLocationIntelligence(projectId: string): Promise<LocationIntelligence | null> {
  const cached = mockLocationIntel.get(projectId);
  const supabase = createClient();
  if (!supabase) return cached ?? null;

  const { data } = await supabase
    .from("projects")
    .select("location_intelligence")
    .eq("id", projectId)
    .maybeSingle();

  if (data?.location_intelligence) return data.location_intelligence as LocationIntelligence;
  return cached ?? null;
}
