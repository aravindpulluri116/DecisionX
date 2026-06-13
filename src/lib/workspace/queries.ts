import type { AgentId, AgentResult, DecisionReport, Simulation } from "@/types/simulation";
import type { LocationIntelligence } from "@/types/geo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
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
import {
  getMockActiveScenario,
  getMockGraph,
  getMockProjectBySlug,
  getMockProjects,
  getMockScenarios,
  hydrateMockStore,
  mergeProjectLists,
  saveMockScenario,
  setMockActiveScenario,
} from "./mock-data";
import { withTimeout } from "@/lib/supabase/with-timeout";

async function querySupabase<T>(
  query: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: () => T,
): Promise<T> {
  try {
    const { data, error } = await withTimeout(query());
    if (error || data == null) return fallback();
    return data;
  } catch {
    return fallback();
  }
}

export async function fetchProjects(): Promise<Project[]> {
  hydrateMockStore();
  const local = getMockProjects();
  const supabase = createClient();
  if (!supabase) return local;

  return querySupabase(
    () => supabase.from("projects").select("*").order("created_at"),
    () => local,
  ).then((data) => {
    const rows = Array.isArray(data) ? (data as Project[]) : [];
    return mergeProjectLists(rows, local);
  });
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  hydrateMockStore();
  const supabase = createClient();
  if (!supabase) return getMockProjectBySlug(slug);

  return querySupabase(
    () => supabase.from("projects").select("*").eq("slug", slug).single(),
    () => getMockProjectBySlug(slug),
  ).then((data) => (data as Project | null) ?? getMockProjectBySlug(slug));
}

export async function fetchScenarios(projectId: string): Promise<Scenario[]> {
  hydrateMockStore();
  const supabase = createClient();
  if (!supabase) return getMockScenarios(projectId);

  return querySupabase(
    () =>
      supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    () => getMockScenarios(projectId),
  ).then((data) => {
    const rows = Array.isArray(data) ? data : [];
    return rows.length ? (rows as Scenario[]) : getMockScenarios(projectId);
  });
}

export async function fetchActiveScenario(projectId: string): Promise<Scenario | null> {
  hydrateMockStore();
  const supabase = createClient();
  if (!supabase) return getMockActiveScenario(projectId);

  return querySupabase(
    () =>
      supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_active", true)
        .maybeSingle(),
    () => getMockActiveScenario(projectId),
  ).then((data) => (data as Scenario | null) ?? getMockActiveScenario(projectId));
}

export async function fetchWorkspaceGraph(scenarioId: string): Promise<WorkspaceGraph | null> {
  const empty: WorkspaceGraph = { nodes: [], edges: [], intelligence: {} };
  const supabase = createClient();
  if (!supabase) return getMockGraph(scenarioId) ?? empty;

  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from("canvas_nodes").select("*").eq("scenario_id", scenarioId),
    supabase.from("canvas_edges").select("*").eq("scenario_id", scenarioId),
  ]);

  if (nodesRes.error || !nodesRes.data?.length) return getMockGraph(scenarioId) ?? empty;

  const nodeIds = nodesRes.data.map((n) => n.id);
  const intelRes = await supabase.from("node_intelligence").select("*").in("node_id", nodeIds);

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
}

export async function activateScenario(projectId: string, scenarioId: string) {
  const supabase = createClient();
  if (!supabase) {
    setMockActiveScenario(projectId, scenarioId);
    return;
  }

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
    return saveMockScenario(projectId, title, params, scores, graph);
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
    return saveMockScenario(projectId, title, params, scores, graph);
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
  const supabase = createClient();

  if (!supabase) {
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

  await supabase.from("simulation_runs").insert({
    id: runId,
    project_id: projectId,
    status,
    agent_states: {},
  });

  // Keep an in-memory copy for fast reads within the same request lifecycle
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
  const supabase = createClient();
  const mock = mockSimulationRuns.get(id);

  if (!supabase) {
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

  await supabase.from("simulation_runs").update(update).eq("id", id);

  if (mock) {
    mockSimulationRuns.set(id, {
      ...mock,
      ...patch,
      agent_states: patch.agent_states ?? mock.agent_states,
    });
  }
}

export async function createDecisionReport(
  simulationRunId: string,
  content: DecisionReport,
): Promise<string> {
  const reportId = content.id;
  mockDecisionReports.set(reportId, content);

  const supabase = createClient();
  if (!supabase) return reportId;

  await supabase.from("decision_reports").insert({
    id: reportId,
    simulation_run_id: simulationRunId,
    content,
  });

  await updateSimulationRun(simulationRunId, { report: content });
  return reportId;
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
    agentResults: (data.agent_states ?? {}) as Partial<Record<AgentId, AgentResult>>,
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
  const supabase = createClient();
  const created: Project = {
    ...project,
    status: project.status as ProjectStatus,
    risk_level: project.risk_level as RiskLevel,
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    const { addMockProject } = await import("./mock-data");
    addMockProject(created);
    return created;
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

    const { addMockProject } = await import("./mock-data");

    if (error || !data) {
      addMockProject(created);
      return created;
    }

    addMockProject(data as Project);
    return data as Project;
  } catch {
    const { addMockProject } = await import("./mock-data");
    addMockProject(created);
    return created;
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
