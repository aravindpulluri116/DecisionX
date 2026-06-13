import type { DecisionProject, DecisionReport, Simulation, StakeholderGroup, ProjectCategory } from "@/types/simulation";
import type { Project, ScenarioParams } from "@/types/workspace";
import { fetchProjects, fetchProjectBySlug, insertProject } from "@/lib/workspace/queries";
import { getMockProjects } from "@/lib/workspace/mock-data";

const mockProjects: DecisionProject[] = getMockProjects().map((p) => ({
  ...p,
  description: `${p.title} — strategic decision initiative.`,
  category: mapProjectTypeToCategory(p.project_type),
  stakeholders: ["Citizens", "Government"] as StakeholderGroup[],
  budget: 800,
  timeline: "10 years",
}));

function mapProjectTypeToCategory(type: string): ProjectCategory {
  const map: Record<string, ProjectCategory> = {
    Infrastructure: "Transportation",
    "Land Use": "Urban Development",
    "Transit Policy": "Transportation",
    Aviation: "Transportation",
  };
  return map[type] ?? "Urban Development";
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDecisionProject(p: Project): DecisionProject {
  const existing = mockProjects.find((m) => m.id === p.id);
  if (existing) return existing;
  return {
    ...p,
    description: `${p.title} decision analysis.`,
    category: mapProjectTypeToCategory(p.project_type),
    stakeholders: ["Citizens", "Government"],
    budget: 800,
    timeline: "10 years",
  };
}

export async function listProjects(): Promise<DecisionProject[]> {
  const projects = await fetchProjects();
  return projects.map(toDecisionProject);
}

export async function getProjectBySlug(slug: string): Promise<DecisionProject | null> {
  const p = await fetchProjectBySlug(slug);
  return p ? toDecisionProject(p) : null;
}

export async function createProject(
  draft: Partial<DecisionProject>,
): Promise<DecisionProject> {
  const project: DecisionProject = {
    id: crypto.randomUUID(),
    slug: slugify(draft.title ?? "new-project"),
    title: draft.title ?? "New Project",
    status: "draft",
    impact_score: 50,
    risk_level: "medium",
    project_type: draft.project_type ?? draft.category ?? "Infrastructure",
    location: draft.location ?? "Hyderabad",
    created_at: new Date().toISOString(),
    description: draft.description ?? "",
    category: draft.category ?? "Transportation",
    stakeholders: draft.stakeholders ?? ["Citizens"],
    budget: draft.budget ?? 500,
    timeline: draft.timeline ?? "10 years",
    geo: draft.geo,
  };

  await insertProject({
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
  });

  mockProjects.push(project);
  return project;
}

export function projectToScenarioParams(project: DecisionProject): ScenarioParams {
  return {
    budget: project.budget,
    population: 2.4,
    location: project.location,
    timeline: project.timeline,
    projectType: project.category,
    policyType: project.category,
  };
}

export { toDecisionProject };
