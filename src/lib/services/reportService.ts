import type { AgentId } from "@/types/simulation";
import type { DecisionReport, Simulation } from "@/types/simulation";
import { getCdoRaw } from "@/lib/agents/normalize";
import { saveReport } from "./simulationService";

export function generateReport(simulation: Simulation, projectTitle: string): DecisionReport {
  const cdo = simulation.agentResults.chiefDecisionOfficer;
  const cdoRaw = getCdoRaw(cdo);
  const economic = simulation.agentResults.economic;
  const social = simulation.agentResults.social;
  const environmental = simulation.agentResults.environmental;
  const stakeholder = simulation.agentResults.stakeholder;
  const risk = simulation.agentResults.risk;
  const future = simulation.agentResults.futureShock;

  const scores = simulation.impactScores;
  const scoreSummary = scores
    ? `Economic ${scores.economic}, Social ${scores.social}, Environmental ${scores.environmental}, Infrastructure ${scores.infrastructure}, Political Risk ${scores.politicalRisk}, Public Acceptance ${scores.publicAcceptance}.`
    : "Impact scores pending.";

  const riskRaw = risk?.raw as { riskMatrix?: { category: string; severity: string; description: string }[] } | undefined;

  const allAssumptions = [
    ...(cdo?.assumptions ?? []),
    ...(economic?.assumptions ?? []).slice(0, 1),
    ...(future?.assumptions ?? []).slice(0, 1),
  ];
  const allUncertainties = [
    ...(cdo?.uncertainties ?? []),
    ...(risk?.uncertainties ?? []).slice(0, 2),
  ];

  const stakeholderSection = stakeholder?.summary ?? "Stakeholder mapping identifies key coalition dynamics.";

  const riskSection =
    risk?.summary ??
    (riskRaw?.riskMatrix?.length
      ? `${riskRaw.riskMatrix.length} risks identified across legal, financial, and operational dimensions.`
      : "Risk assessment complete.");

  const futureSection = future?.summary ?? "Future trajectory analysis maps second-order consequences.";

  const report: DecisionReport = {
    id: crypto.randomUUID(),
    simulationId: simulation.id,
    projectTitle,
    generatedAt: new Date().toISOString(),
    sections: {
      executiveSummary:
        cdoRaw?.executiveSummary ??
        cdo?.summary ??
        `Executive review of ${projectTitle} recommends conditional approval with phased implementation and continuous monitoring.`,
      impactAnalysis: [economic?.summary, social?.summary, environmental?.summary].filter(Boolean).join(" ") || scoreSummary,
      stakeholderAnalysis: stakeholderSection,
      riskAnalysis: riskSection,
      futureOutlook: futureSection,
      recommendations:
        cdoRaw?.recommendedActions ??
        cdo?.recommendations ?? [
          "Proceed with Phase 1 under milestone gates",
          "Establish continuous monitoring",
          "Review quarterly with Decision Intelligence board",
        ],
      viabilityScore: cdoRaw?.viabilityScore ?? cdo?.impactScore,
      alternativeScenarios: cdoRaw?.alternativeScenarios ?? [],
      assumptions: allAssumptions,
      uncertainties: allUncertainties,
    },
  };

  saveReport(report);
  return report;
}

export function formatAgentContributions(simulation: Simulation): string[] {
  return (Object.entries(simulation.agentResults) as [AgentId, typeof simulation.agentResults[AgentId]][])
    .filter(([, r]) => r)
    .map(([id, r]) => `${id}: ${r!.summary}`);
}
