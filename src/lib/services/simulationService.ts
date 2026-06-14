import type { DecisionReport, Simulation, SimulationInput } from "@/types/simulation";
import type { Scenario } from "@/types/workspace";
import {
  createScenario,
  ensureProjectRecord,
  fetchDecisionReport,
  fetchReportForProject,
  fetchScenarios,
  fetchSimulationRun,
  fetchSimulationRunForProject,
  fetchWorkspaceGraph,
  updateProjectImpactScore,
  updateSimulationRun,
} from "@/lib/workspace/queries";
import { getProjectViability } from "@/lib/scoring/viability";

const mockSimulations = new Map<string, Simulation>();
const mockReports = new Map<string, DecisionReport>();

export async function getSimulation(id: string): Promise<Simulation | null> {
  const fromDb = await fetchSimulationRun(id);
  if (fromDb) return fromDb;
  return mockSimulations.get(id) ?? null;
}

export function saveSimulation(simulation: Simulation) {
  mockSimulations.set(simulation.id, simulation);
}

export async function getReport(id: string): Promise<DecisionReport | null> {
  const fromDb = await fetchDecisionReport(id);
  if (fromDb) return fromDb;
  return mockReports.get(id) ?? null;
}

export function saveReport(report: DecisionReport) {
  mockReports.set(report.id, report);
}

export async function getReportForScenario(
  projectId: string,
  scenarioId?: string | null,
): Promise<DecisionReport | null> {
  return fetchReportForProject(projectId, scenarioId);
}

export async function getSimulationForScenario(
  projectId: string,
  scenarioId?: string | null,
): Promise<Simulation | null> {
  return fetchSimulationRunForProject(projectId, scenarioId);
}

export async function persistSimulationAsScenario(
  input: SimulationInput,
  simulation: Simulation,
  title: string,
): Promise<Scenario> {
  if (!simulation.graph || !simulation.impactScores) {
    throw new Error("Simulation missing graph or scores");
  }

  const projectId = await ensureProjectRecord({
    id: input.project.id,
    slug: input.project.slug,
    title: input.project.title,
    status: input.project.status,
    impact_score: input.project.impact_score,
    risk_level: input.project.risk_level,
    project_type: input.project.project_type,
    location: input.project.location,
    description: input.project.description,
    category: input.project.category,
    stakeholders: input.project.stakeholders,
    budget: input.project.budget,
    timeline: input.project.timeline,
  });

  const scenario = await createScenario(
    projectId,
    input.project.title,
    title,
    input.params,
    simulation.impactScores,
    simulation.graph,
  );

  const viability = getProjectViability(simulation.impactScores);
  if (viability != null) await updateProjectImpactScore(projectId, viability);

  simulation.scenarioId = scenario.id;
  await updateSimulationRun(simulation.id, { scenario_id: scenario.id });
  saveSimulation(simulation);
  return scenario;
}

export async function duplicateScenario(
  projectId: string,
  scenarioId: string,
): Promise<Scenario | null> {
  const scenarios = await fetchScenarios(projectId);
  const source = scenarios.find((s) => s.id === scenarioId);
  if (!source) return null;

  const graph = await fetchWorkspaceGraph(scenarioId);
  const graphToSave = graph?.nodes.length
    ? graph
    : { nodes: [], edges: [], intelligence: {} };

  return createScenario(
    projectId,
    source.title,
    `${source.title} (Copy)`,
    source.params,
    source.impact_scores,
    graphToSave,
  );
}

export async function createScenarioFromAlternative(
  projectId: string,
  scenarioId: string,
  options: { name: string; budget?: number | null; timeline?: string },
): Promise<Scenario | null> {
  const scenarios = await fetchScenarios(projectId);
  const source = scenarios.find((s) => s.id === scenarioId);
  if (!source) return null;

  const graph = await fetchWorkspaceGraph(scenarioId);
  const graphToSave = graph?.nodes.length
    ? graph
    : { nodes: [], edges: [], intelligence: {} };

  const params = {
    ...source.params,
    ...(options.budget != null ? { budget: options.budget } : {}),
    ...(options.timeline ? { timeline: options.timeline } : {}),
  };

  const title = options.name.length > 80 ? `Plan B: ${options.name.slice(0, 77)}…` : `Plan B: ${options.name}`;

  return createScenario(projectId, source.title, title, params, source.impact_scores, graphToSave);
}
