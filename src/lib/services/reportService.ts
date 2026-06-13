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

  const stakeholderRaw = stakeholder?.raw as { affectedGroups?: string[]; supportScore?: number; oppositionScore?: number } | undefined;
  const riskRaw = risk?.raw as { riskMatrix?: { category: string; severity: string; description: string }[] } | undefined;
  const futureRaw = future?.raw as { consequences?: { source: string; target: string }[] } | undefined;

  const allAssumptions = [
    ...(cdo?.assumptions ?? []),
    ...(economic?.assumptions ?? []).slice(0, 1),
    ...(future?.assumptions ?? []).slice(0, 1),
  ];
  const allUncertainties = [
    ...(cdo?.uncertainties ?? []),
    ...(risk?.uncertainties ?? []).slice(0, 2),
  ];

  const stakeholderSection = stakeholderRaw?.affectedGroups?.length
    ? `${stakeholder?.summary ?? ""} Affected groups: ${stakeholderRaw.affectedGroups.join(", ")}. Support index: ${stakeholderRaw.supportScore ?? "N/A"}%, Opposition: ${stakeholderRaw.oppositionScore ?? "N/A"}%.`
    : stakeholder?.summary ?? "Stakeholder mapping identifies key coalition dynamics and engagement requirements.";

  const riskSection = riskRaw?.riskMatrix?.length
    ? `${risk?.summary ?? ""} Key risks: ${riskRaw.riskMatrix.map((r) => `${r.category} (${r.severity}): ${r.description}`).join("; ")}.`
    : `${risk?.summary ?? "Risk assessment complete."} ${future?.summary ?? ""}`.trim();

  const futureSection = futureRaw?.consequences?.length
    ? `Consequence cascade: ${futureRaw.consequences.map((c) => `${c.source} → ${c.target}`).join(" → ")}. ${environmental?.opportunities[0] ?? ""}`
    : `Over the ${simulation.params.timeline} horizon, secondary and tertiary consequences are expected to compound. ${environmental?.opportunities[0] ?? "Environmental gains projected in steady state."}`;

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
      impactAnalysis: `${economic?.summary ?? "Economic analysis complete."} ${social?.summary ?? ""} ${scoreSummary}`.trim(),
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
