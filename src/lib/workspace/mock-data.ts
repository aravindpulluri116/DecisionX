import type {
  CanvasEdge,
  CanvasNode,
  ImpactScores,
  NodeIntelligence,
  Project,
  Scenario,
  ScenarioParams,
  WorkspaceGraph,
} from "@/types/workspace";
import {
  loadCustomProjects,
  loadCustomScenarios,
  loadRecentSlugs,
  persistCustomProject,
  persistCustomScenario,
} from "./mock-storage";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "metro-expansion-hyderabad",
    title: "Metro Expansion Hyderabad",
    status: "active",
    impact_score: 78,
    risk_level: "medium",
    project_type: "Infrastructure",
    location: "Hyderabad",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "new-industrial-zone",
    title: "New Industrial Zone",
    status: "review",
    impact_score: 65,
    risk_level: "high",
    project_type: "Land Use",
    location: "Telangana",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "airport-development",
    title: "Airport Development",
    status: "active",
    impact_score: 82,
    risk_level: "medium",
    project_type: "Infrastructure",
    location: "Hyderabad",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    slug: "bus-fare-increase",
    title: "Bus Fare Increase",
    status: "draft",
    impact_score: 45,
    risk_level: "high",
    project_type: "Transit Policy",
    location: "Hyderabad",
    created_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    slug: "flyover-construction",
    title: "Flyover Construction",
    status: "active",
    impact_score: 71,
    risk_level: "low",
    project_type: "Infrastructure",
    location: "Hyderabad",
    created_at: new Date().toISOString(),
  },
];

const defaultParams: ScenarioParams = {
  budget: 1200,
  population: 2.4,
  location: "Hyderabad",
  timeline: "10 years",
  projectType: "Infrastructure",
  policyType: "Transit",
};

const defaultScores: ImpactScores = {
  economic: 78,
  social: 72,
  environmental: 58,
  infrastructure: 85,
  politicalRisk: 42,
  publicAcceptance: 68,
};

export const MOCK_SCENARIOS: Scenario[] = MOCK_PROJECTS.map((p, i) => ({
  id: `22222222-2222-2222-2222-22222222220${i + 1}`,
  project_id: p.id,
  title: i === 0 ? "Baseline Route A" : `${p.title} — Default`,
  is_active: true,
  params: { ...defaultParams, location: p.location },
  impact_scores: {
    ...defaultScores,
    economic: p.impact_score,
    publicAcceptance: Math.max(30, p.impact_score - 10),
  },
  created_at: new Date().toISOString(),
}));

const METRO_NODES: CanvasNode[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "decision",
    label: "Build Metro",
    description: "Construct 42km metro corridor connecting IT corridor to old city.",
    position: { x: 80, y: 200 },
    data: {},
    parent_id: null,
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "impact",
    label: "Traffic Reduction",
    description: "Peak-hour congestion drops 28% along corridor within 18 months.",
    position: { x: 320, y: 120 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333301",
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "impact",
    label: "Property Growth",
    description: "Land values rise 12–18% within 2km of stations.",
    position: { x: 320, y: 280 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333301",
  },
  {
    id: "33333333-3333-3333-3333-333333333304",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "risk",
    label: "Rental Inflation",
    description: "Low-income renters face 15% rent increase near stations.",
    position: { x: 560, y: 120 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333303",
  },
  {
    id: "33333333-3333-3333-3333-333333333305",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "stakeholder",
    label: "Commuter Cohorts",
    description: "Daily riders shift from private vehicles to metro.",
    position: { x: 560, y: 200 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333302",
  },
  {
    id: "33333333-3333-3333-3333-333333333306",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "environmental",
    label: "Emissions Offset",
    description: "Net CO₂ reduction of 180K tonnes/year by year 5.",
    position: { x: 560, y: 280 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333302",
  },
  {
    id: "33333333-3333-3333-3333-333333333307",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    type: "risk",
    label: "Displacement Risk",
    description: "3,200 households at risk of involuntary relocation.",
    position: { x: 800, y: 200 },
    data: {},
    parent_id: "33333333-3333-3333-3333-333333333304",
  },
];

const METRO_EDGES: CanvasEdge[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333301",
    target: "33333333-3333-3333-3333-333333333302",
    data: {},
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333301",
    target: "33333333-3333-3333-3333-333333333303",
    data: {},
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333303",
    target: "33333333-3333-3333-3333-333333333304",
    data: {},
  },
  {
    id: "44444444-4444-4444-4444-444444444404",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333302",
    target: "33333333-3333-3333-3333-333333333305",
    data: {},
  },
  {
    id: "44444444-4444-4444-4444-444444444405",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333302",
    target: "33333333-3333-3333-3333-333333333306",
    data: {},
  },
  {
    id: "44444444-4444-4444-4444-444444444406",
    scenario_id: "22222222-2222-2222-2222-222222222201",
    source: "33333333-3333-3333-3333-333333333304",
    target: "33333333-3333-3333-3333-333333333307",
    data: {},
  },
];

const METRO_INTELLIGENCE: Record<string, NodeIntelligence> = {
  "33333333-3333-3333-3333-333333333301": {
    node_id: "33333333-3333-3333-3333-333333333301",
    impact_strength: 92,
    confidence: 88,
    stakeholders: ["State Govt", "Metro Corp", "Urban Planners"],
    timeline: [
      { year: "Y1", event: "Land acquisition begins" },
      { year: "Y3", event: "Phase 1 operational" },
      { year: "Y10", event: "Full corridor live" },
    ],
    mitigation: ["Phased rollout", "Community consultation", "Affordable housing mandate"],
    evidence: ["Metro ridership model 2024", "Hyderabad TOD study", "Agent economic analysis"],
  },
  "33333333-3333-3333-3333-333333333302": {
    node_id: "33333333-3333-3333-3333-333333333302",
    impact_strength: 82,
    confidence: 85,
    stakeholders: ["Commuters", "Auto unions", "Traffic police"],
    timeline: [
      { year: "Y1", event: "Construction disruption" },
      { year: "Y2", event: "First ridership data" },
      { year: "Y5", event: "Peak reduction measurable" },
    ],
    mitigation: ["Bus feeder integration", "Park-and-ride hubs"],
    evidence: ["Traffic flow simulation", "Peer city benchmarks"],
  },
  "33333333-3333-3333-3333-333333333303": {
    node_id: "33333333-3333-3333-3333-333333333303",
    impact_strength: 74,
    confidence: 79,
    stakeholders: ["Property developers", "Homeowners", "Banks"],
    timeline: [
      { year: "Y2", event: "Station TOD zones" },
      { year: "Y5", event: "Price plateau risk" },
    ],
    mitigation: ["Inclusionary zoning", "Rent stabilization pilot"],
    evidence: ["Property price index corridor data"],
  },
  "33333333-3333-3333-3333-333333333304": {
    node_id: "33333333-3333-3333-3333-333333333304",
    impact_strength: 61,
    confidence: 72,
    stakeholders: ["Renters", "Landlords", "NGOs"],
    timeline: [{ year: "Y3", event: "Rent spike near stations" }],
    mitigation: ["Rent caps in corridor", "Voucher program"],
    evidence: ["Rental market survey Q3"],
  },
  "33333333-3333-3333-3333-333333333305": {
    node_id: "33333333-3333-3333-3333-333333333305",
    impact_strength: 68,
    confidence: 81,
    stakeholders: ["Daily commuters", "IT workforce", "Students"],
    timeline: [{ year: "Y1", event: "Mode shift begins" }],
    mitigation: ["Last-mile connectivity", "Off-peak pricing"],
    evidence: ["Commute time reduction model"],
  },
  "33333333-3333-3333-3333-333333333306": {
    node_id: "33333333-3333-3333-3333-333333333306",
    impact_strength: 76,
    confidence: 83,
    stakeholders: ["Environmental agencies", "Health dept"],
    timeline: [{ year: "Y5", event: "Net emissions positive" }],
    mitigation: ["Green energy for stations", "Tree canopy program"],
    evidence: ["Emissions inventory baseline"],
  },
  "33333333-3333-3333-3333-333333333307": {
    node_id: "33333333-3333-3333-3333-333333333307",
    impact_strength: 42,
    confidence: 68,
    stakeholders: ["Slum communities", "Resettlement boards"],
    timeline: [{ year: "Y2", event: "Relocation notices" }],
    mitigation: ["In-situ upgrading", "Compensation at market rate"],
    evidence: ["Resettlement impact assessment"],
  },
};

/** In-memory store for mock mode when Supabase is unavailable */
let mockScenarios = [...MOCK_SCENARIOS];
const mockGraphs: Record<string, WorkspaceGraph> = {
  "22222222-2222-2222-2222-222222222201": {
    nodes: METRO_NODES,
    edges: METRO_EDGES,
    intelligence: METRO_INTELLIGENCE,
  },
};

const SEED_SLUGS = new Set(MOCK_PROJECTS.map((p) => p.slug));
let storeHydrated = false;

export function hydrateMockStore() {
  if (storeHydrated || typeof window === "undefined") return;
  storeHydrated = true;

  for (const project of loadCustomProjects()) {
    if (!MOCK_PROJECTS.some((p) => p.slug === project.slug)) {
      MOCK_PROJECTS.push(project);
    }
  }

  for (const scenario of loadCustomScenarios()) {
    if (!mockScenarios.some((s) => s.id === scenario.id)) {
      mockScenarios.push(scenario);
    }
  }
}

export function getMockProjects() {
  hydrateMockStore();
  return sortProjectsForNav(MOCK_PROJECTS);
}

/** Custom (user-created) projects first, then demos; newest first within each group */
export function sortProjectsForNav(projects: Project[]): Project[] {
  const custom = projects.filter((p) => !SEED_SLUGS.has(p.slug));
  const seed = projects.filter((p) => SEED_SLUGS.has(p.slug));
  const byRecent = (a: Project, b: Project) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  const recentSlugs = loadRecentSlugs();
  const rank = (slug: string) => {
    const i = recentSlugs.indexOf(slug);
    return i === -1 ? 999 : i;
  };

  custom.sort((a, b) => rank(a.slug) - rank(b.slug) || byRecent(a, b));
  seed.sort(byRecent);
  return [...custom, ...seed];
}

export function mergeProjectLists(...lists: Project[][]): Project[] {
  const bySlug = new Map<string, Project>();
  for (const list of lists) {
    for (const p of list) {
      bySlug.set(p.slug, p);
    }
  }
  return sortProjectsForNav([...bySlug.values()]);
}

export function isCustomProject(slug: string) {
  return !SEED_SLUGS.has(slug);
}

export function addMockProject(project: Project) {
  hydrateMockStore();
  if (!MOCK_PROJECTS.some((p) => p.slug === project.slug)) {
    MOCK_PROJECTS.push(project);
  }
  if (!SEED_SLUGS.has(project.slug)) {
    persistCustomProject(project);
  }
}

export function getMockProjectBySlug(slug: string) {
  hydrateMockStore();
  return MOCK_PROJECTS.find((p) => p.slug === slug) ?? null;
}

export function getMockScenarios(projectId: string) {
  hydrateMockStore();
  return mockScenarios.filter((s) => s.project_id === projectId);
}

export function getMockActiveScenario(projectId: string) {
  hydrateMockStore();
  return mockScenarios.find((s) => s.project_id === projectId && s.is_active) ?? null;
}

export function getMockGraph(scenarioId: string): WorkspaceGraph | null {
  return mockGraphs[scenarioId] ?? null;
}

export function setMockActiveScenario(projectId: string, scenarioId: string) {
  mockScenarios = mockScenarios.map((s) => ({
    ...s,
    is_active: s.project_id === projectId ? s.id === scenarioId : s.is_active,
  }));
}

export function saveMockScenario(
  projectId: string,
  title: string,
  params: ScenarioParams,
  scores: ImpactScores,
  graph: WorkspaceGraph,
) {
  const id = crypto.randomUUID();
  mockScenarios = mockScenarios.map((s) =>
    s.project_id === projectId ? { ...s, is_active: false } : s,
  );
  const scenario: Scenario = {
    id,
    project_id: projectId,
    title,
    is_active: true,
    params,
    impact_scores: scores,
    created_at: new Date().toISOString(),
  };
  mockScenarios.push(scenario);
  mockGraphs[id] = {
    ...graph,
    nodes: graph.nodes.map((n) => ({ ...n, scenario_id: id })),
    edges: graph.edges.map((e) => ({ ...e, scenario_id: id })),
  };
  if (!MOCK_SCENARIOS.some((s) => s.id === id)) {
    persistCustomScenario(scenario);
  }
  return scenario;
}

export function updateMockNodePosition(nodeId: string, position: { x: number; y: number }) {
  for (const graph of Object.values(mockGraphs)) {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.position = position;
      break;
    }
  }
}

