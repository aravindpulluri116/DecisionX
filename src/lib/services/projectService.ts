import type { DecisionProject, ProjectCategory } from "@/types/simulation";
import type { Project, ScenarioParams } from "@/types/workspace";
import { normalizeSpecialistSelection } from "@/lib/agents/selection";
import {
  fetchProjects,
  fetchProjectBySlug,
  insertProject,
  saveLocationIntelligence,
  updateProjectDraftFields,
} from "@/lib/workspace/queries";
import { resolveUniqueSlug, slugifyTitle } from "@/lib/workspace/project-slug";

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
  return slugifyTitle(title);
}

function toDecisionProject(p: Project): DecisionProject {
  return {
    ...p,
    description: p.description ?? "",
    category: (p.category as DecisionProject["category"]) ?? mapProjectTypeToCategory(p.project_type),
    stakeholders: (p.stakeholders as DecisionProject["stakeholders"]) ?? [],
    budget: p.budget ?? 0,
    timeline: p.timeline ?? "10 years",
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
  _scenarioParams?: ScenarioParams,
): Promise<DecisionProject> {
  if (!draft.title || !draft.description || !draft.location || draft.budget == null) {
    throw new Error("Project requires title, description, location, and budget");
  }
  if (!draft.category || !draft.stakeholders?.length) {
    throw new Error("Project requires category and stakeholders");
  }

  const baseSlug = slugify(draft.title);
  const existing = await fetchProjectBySlug(baseSlug);

  if (existing) {
    await updateProjectDraftFields(existing.id, {
      description: draft.description,
      location: draft.location,
      category: draft.category,
      stakeholders: draft.stakeholders,
      budget: draft.budget,
      timeline: draft.timeline ?? existing.timeline ?? "10 years",
      project_type: draft.project_type ?? draft.category,
    });

    const project = toDecisionProject({
      ...existing,
      description: draft.description,
      location: draft.location,
      category: draft.category,
      stakeholders: draft.stakeholders,
      budget: draft.budget,
      timeline: draft.timeline ?? existing.timeline ?? "10 years",
      project_type: draft.project_type ?? draft.category,
    });

    if (draft.locationIntelligence) {
      await saveLocationIntelligence(existing.id, draft.locationIntelligence, draft.geo?.coords);
      project.locationIntelligence = draft.locationIntelligence;
      project.geo = draft.geo;
    }

    return project;
  }

  const slug = await resolveUniqueSlug(draft.title, async (candidate) => {
    const hit = await fetchProjectBySlug(candidate);
    return hit != null;
  });

  const project: DecisionProject = {
    id: crypto.randomUUID(),
    slug,
    title: draft.title,
    status: "draft",
    impact_score: 0,
    risk_level: "medium",
    project_type: draft.project_type ?? draft.category,
    location: draft.location,
    created_at: new Date().toISOString(),
    description: draft.description,
    category: draft.category,
    stakeholders: draft.stakeholders,
    budget: draft.budget,
    timeline: draft.timeline ?? "10 years",
    geo: draft.geo,
    locationIntelligence: draft.locationIntelligence,
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

  if (project.locationIntelligence) {
    await saveLocationIntelligence(project.id, project.locationIntelligence, project.geo?.coords);
  }

  return project;
}

export function projectToScenarioParams(
  project: DecisionProject,
  overrides?: Partial<ScenarioParams>,
): ScenarioParams {
  const radiusImpacts = project.locationIntelligence?.radiusImpacts ?? [];
  const geoPopM =
    radiusImpacts.find((r) => r.radiusKm === 5)?.populationEstimate ??
    radiusImpacts.find((r) => r.radiusKm === 10)?.populationEstimate;

  const population =
    geoPopM && geoPopM > 0 && !project.locationIntelligence?.unavailable
      ? Math.max(0.05, parseFloat((geoPopM / 1_000_000).toFixed(2)))
      : undefined;

  const timelineMatch = project.timeline.match(/\d+/);
  const timelineYears = timelineMatch ? `${timelineMatch[0]} years` : project.timeline;

  return {
    budget: project.budget,
    population: population ?? 0,
    location: project.location,
    timeline: timelineYears,
    projectType: project.category,
    policyType: project.category,
    ...overrides,
    ...(overrides?.selectedAgents !== undefined
      ? { selectedAgents: normalizeSpecialistSelection(overrides.selectedAgents) }
      : {}),
  };
}

export { toDecisionProject };
