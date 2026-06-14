import type { DecisionReport, Simulation, SimulationInput } from "@/types/simulation";
import type { Scenario } from "@/types/workspace";
import {
  createScenario,
  fetchDecisionReport,
  fetchReportForProject,
  fetchScenarios,
  fetchSimulationRun,
  fetchSimulationRunForProject,
  fetchWorkspaceGraph,
  updateSimulationRun,
} from "@/lib/workspace/queries";

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

  const scenario = await createScenario(
    input.project.id,
    input.project.title,
    title,
    input.params,
    simulation.impactScores,
    simulation.graph,
  );

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
