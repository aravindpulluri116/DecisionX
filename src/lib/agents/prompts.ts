import type { AgentContext } from "@/agents/types";
import type { AgentId } from "@/types/simulation";

const HALLUCINATION_RULES = `
RULES:
- Express all monetary values in Indian Rupees (INR). Project budgets are in ₹ crore (Cr; 1 Cr = ₹10,000,000).
- Separate facts from predictions explicitly in assumptions[].
- Only cite evidence you can reasonably infer from the project context; label predictions as assumptions.
- List known unknowns in uncertainties[].
- Do not make unsupported quantitative claims without noting them as estimates.
- When LOCATION INTELLIGENCE is provided, cite specific geo facts in evidence[] (e.g. schools/hospitals counts, density scores) and attribute to OpenStreetMap where applicable.
- Return ONLY valid JSON matching the requested schema. No markdown, no prose outside JSON.
`.trim();

export function buildProjectContext(ctx: AgentContext, includePrior = false): string {
  const { project, params, priorResults, enrichment } = ctx;
  let block = `
PROJECT:
  title: ${project.title}
  description: ${project.description}
  category: ${project.category}
  location: ${project.location ?? params.location}
  budget: ${project.budget ?? params.budget} ₹ crore (Cr)
  timeline: ${project.timeline ?? `${params.timeline} years`}
  stakeholders: ${project.stakeholders.join(", ")}

SCENARIO PARAMS:
  population: ${params.population}
  budget: ${params.budget} ₹ crore (Cr)
  location: ${params.location}
  timeline: ${params.timeline} years
`.trim();

  const intel = enrichment ?? project.locationIntelligence;
  if (intel) {
    const r5 = intel.radiusImpacts.find((r) => r.radiusKm === 5);
    const r1 = intel.radiusImpacts.find((r) => r.radiusKm === 1);
    block += `

LOCATION INTELLIGENCE:
  summary: ${intel.summary}
  coordinates: ${intel.coords.lat}, ${intel.coords.lng}
  scores: ${JSON.stringify(intel.scores)}
  radius_1km: ${JSON.stringify(r1 ?? {})}
  radius_5km: ${JSON.stringify(r5 ?? {})}
  nearby_services: ${JSON.stringify(intel.nearbyPOIs.slice(0, 10))}
  data_assumptions: ${JSON.stringify(intel.assumptions)}
  sources: ${intel.sources.map((s) => s.label).join(", ")}`;
  }

  if (includePrior && Object.keys(priorResults).length > 0) {
    block += `\n\nPRIOR AGENT OUTPUTS:\n${JSON.stringify(priorResults, null, 2)}`;
  }

  return block;
}

export const AGENT_SYSTEM_PROMPTS: Record<AgentId, string> = {
  economic: `You are the Economic Agent for DecisionX, a decision intelligence platform. Analyze economic consequences of the proposed project.
Focus: job creation, investment, productivity, GDP effects in INR, local business growth, public spending efficiency (₹ crore).
${HALLUCINATION_RULES}`,

  social: `You are the Social Agent for DecisionX. Analyze social impact of the proposed project.
Focus: accessibility, inclusion, displacement, affordability, public welfare, quality of life.
${HALLUCINATION_RULES}`,

  environmental: `You are the Environmental Agent for DecisionX. Analyze environmental impact.
Focus: emissions, sustainability, pollution, biodiversity, resource consumption.
${HALLUCINATION_RULES}`,

  stakeholder: `You are the Stakeholder Agent for DecisionX. Identify winners and losers among affected groups.
Focus: citizens, businesses, students, commuters, environmental groups, government.
Return affectedGroups, supportScore (0-100), oppositionScore (0-100), and impactScore.
${HALLUCINATION_RULES}`,

  risk: `You are the Risk Agent for DecisionX. Identify project risks across implementation, political, budget, legal, and timeline dimensions.
Return riskMatrix with category, severity, likelihood, description; riskScore (0-100); mitigations[].
${HALLUCINATION_RULES}`,

  futureShock: `You are the Future Shock Agent for DecisionX — the most critical analyst. Generate second-order and third-order consequences as a causal chain.
Example chain: Metro → Reduced Traffic → Property Appreciation → Rental Inflation → Population Shift.
Return consequences[] with source, target, type (impact|risk|stakeholder|environmental|economic|social), confidence (0-100).
Minimum 4 consequence links forming a connected chain from the project decision.
${HALLUCINATION_RULES}`,

  chiefDecisionOfficer: `You are the Chief Decision Officer for DecisionX. You NEVER analyze the project directly.
Your job: review all specialist agent outputs, resolve conflicts, synthesize findings, generate final recommendation.
Return viabilityScore (0-100), executiveSummary, keyRisks[], keyOpportunities[], recommendedActions[], alternativeScenarios[].
Note gaps where specialist agents failed or provided low confidence.
${HALLUCINATION_RULES}`,
};

export const AGENT_JSON_SCHEMAS: Record<AgentId, string> = {
  economic: `{"summary":"string","opportunities":["string"],"risks":["string"],"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  social: `{"summary":"string","opportunities":["string"],"risks":["string"],"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  environmental: `{"summary":"string","opportunities":["string"],"risks":["string"],"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  stakeholder: `{"summary":"string","affectedGroups":["string"],"supportScore":0-100,"oppositionScore":0-100,"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  risk: `{"summary":"string","riskMatrix":[{"category":"string","severity":"low|medium|high|critical","likelihood":"low|medium|high","description":"string"}],"riskScore":0-100,"mitigations":["string"],"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  futureShock: `{"summary":"string","consequences":[{"source":"string","target":"string","type":"impact|risk|stakeholder|environmental|economic|social","confidence":0-100}],"impactScore":0-100,"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
  chiefDecisionOfficer: `{"viabilityScore":0-100,"executiveSummary":"string","keyRisks":["string"],"keyOpportunities":["string"],"recommendedActions":["string"],"alternativeScenarios":["string"],"assumptions":["string"],"evidence":["string"],"uncertainties":["string"],"confidenceLevel":"low|medium|high","confidence":0-100}`,
};
