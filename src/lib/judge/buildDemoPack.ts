import type { AgentId } from "@/types/simulation";
import type { ScenarioParams } from "@/types/workspace";
import { buildTimeMachineBundle } from "@/lib/timemachine/futureProjector";
import { buildDefaultCohortSentiment } from "@/lib/timemachine/societyBaseline";
import type {
  AgentDemoBeat,
  JudgeDemoPack,
  JudgeInsightScores,
  JudgeRecommendation,
  JudgeSocietySnapshot,
} from "./types";
import { DEFAULT_STEP_TIMINGS } from "./types";

function mockFutureShockRaw() {
  return {
    consequences: [
      { source: "Project Decision", target: "Traffic Reduction", type: "impact", confidence: 75 },
      { source: "Traffic Reduction", target: "Property Value Growth", type: "economic", confidence: 68 },
      { source: "Property Value Growth", target: "Rental Inflation", type: "risk", confidence: 62 },
      { source: "Rental Inflation", target: "Population Migration", type: "social", confidence: 55 },
    ],
  };
}

function buildSociety(scores: JudgeDemoPack["impactScores"]): JudgeSocietySnapshot {
  const cohorts = buildDefaultCohortSentiment(scores);
  const supportPct = Math.round(cohorts.reduce((s, c) => s + c.supportPct, 0) / cohorts.length);
  const opposePct = Math.round(cohorts.reduce((s, c) => s + c.opposePct, 0) / cohorts.length);
  return {
    citizenCount: 10000,
    supportPct,
    opposePct,
    neutralPct: Math.max(0, 100 - supportPct - opposePct),
    cohorts,
  };
}

function agentBeat(agentId: AgentId, label: string, findings: string[]): AgentDemoBeat {
  return { agentId, label, findings, status: "completed" };
}

type PackConfig = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  overview: JudgeDemoPack["overview"];
  impactScores: JudgeDemoPack["impactScores"];
  agentSequence: AgentDemoBeat[];
  recommendation: JudgeRecommendation;
  judgeInsights: JudgeInsightScores;
  params: ScenarioParams;
  isTransit?: boolean;
};

function assemblePack(config: PackConfig): JudgeDemoPack {
  const timeMachine = buildTimeMachineBundle(
    config.impactScores,
    config.params,
    { futureShock: { raw: mockFutureShockRaw() } } as never,
    null,
  );
  const society = buildSociety(config.impactScores);
  const headlines = timeMachine.expected.headlines;

  return {
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    overview: config.overview,
    agentSequence: config.agentSequence,
    impactScores: config.impactScores,
    society,
    timeMachine,
    headlines,
    recommendation: config.recommendation,
    judgeInsights: config.judgeInsights,
    stepTimings: { ...DEFAULT_STEP_TIMINGS },
  };
}

export const METRO_DEMO_PACK: JudgeDemoPack = assemblePack({
  id: "metro",
  slug: "metro-expansion-hyderabad",
  title: "Hyderabad Metro Expansion",
  tagline: "42km corridor connecting IT hub to old city",
  overview: {
    budget: 1200,
    timeline: "10 years",
    location: "Hyderabad, Telangana",
    stakeholders: ["Citizens", "Commuters", "Businesses", "Government", "Environmental Groups"],
    description:
      "Construct a 42km metro corridor with 28 stations, projected to serve 1.2M daily riders and reduce peak congestion by 28%.",
  },
  impactScores: {
    economic: 78,
    social: 72,
    environmental: 58,
    infrastructure: 85,
    politicalRisk: 42,
    publicAcceptance: 68,
  },
  params: {
    budget: 1200,
    population: 2.4,
    location: "Hyderabad",
    timeline: "10 years",
    projectType: "Infrastructure",
    policyType: "Transit",
  },
  agentSequence: [
    agentBeat("economic", "Economic Agent", [
      "₹1,200M corridor projects 12,000 direct jobs over construction phase",
      "Property values along corridor expected +18% by year 5",
      "Local business revenue uplift estimated at ₹340M annually",
    ]),
    agentBeat("social", "Social Agent", [
      "Underserved eastern zones gain 40-minute commute reduction",
      "Accessibility score improves for 890,000 residents",
      "Construction-phase displacement manageable with phased rollout",
    ]),
    agentBeat("environmental", "Environmental Agent", [
      "Net CO₂ reduction of 42,000 tonnes/year at full ridership",
      "Construction emissions offset within 7 years of operation",
      "Green corridor buffers recommended at 3 station zones",
    ]),
    agentBeat("stakeholder", "Stakeholder Agent", [
      "Commuters and businesses strongly support (81% / 73%)",
      "Environmental groups conditionally support with green buffers",
      "Government alignment high; land acquisition risks in 2 districts",
    ]),
    agentBeat("risk", "Risk Agent", [
      "Cost overrun probability: medium (historical infra avg +12%)",
      "Political risk low-moderate; election cycle aligns with Phase II",
      "Mitigation: escrow fund + independent audit committee",
    ]),
    agentBeat("futureShock", "Future Shock Agent", [
      "Metro → Reduced Traffic → Property Appreciation → Rental Inflation",
      "Third-order effect: population migration toward corridor by 2037",
      "Black-swan: climate event could accelerate ridership +15%",
    ]),
    agentBeat("chiefDecisionOfficer", "Chief Decision Officer", [
      "Viability score: 74/100 — conditional approval recommended",
      "Phased implementation reduces upfront fiscal exposure",
      "Executive recommendation: proceed with Phase I pilot corridor",
    ]),
  ],
  recommendation: {
    viabilityScore: 74,
    keyRisks: ["Cost overrun on land acquisition", "Rental inflation in corridor zones", "Construction disruption"],
    keyOpportunities: ["12,000 jobs", "28% congestion reduction", "Regional economic multiplier"],
    mitigations: ["Phased rollout", "Affordable housing mandate near stations", "Independent cost audit"],
    alternativeScenario: "Delay Phase I pending stakeholder review in eastern districts",
    executiveSummary:
      "Hyderabad Metro Expansion demonstrates strong economic and infrastructure returns with manageable political risk. Conditional approval recommended with phased implementation.",
  },
  judgeInsights: {
    innovationScore: 92,
    technicalComplexity: "High — 7-agent pipeline + geo + society",
    stakeholderCoverage: "9 cohorts · 10,000 citizens",
    futurePredictionDepth: "20-year projection · 3 branches",
  },
});

export const INDUSTRIAL_DEMO_PACK: JudgeDemoPack = assemblePack({
  id: "industrial",
  slug: "new-industrial-zone",
  title: "New Industrial Zone",
  tagline: "Telangana manufacturing hub expansion",
  overview: {
    budget: 950,
    timeline: "15 years",
    location: "Telangana",
    stakeholders: ["Businesses", "Government", "Citizens", "Environmental Groups"],
    description:
      "Establish a 2,400-acre industrial zone targeting advanced manufacturing, projected to create 25,000 jobs with export-oriented incentives.",
  },
  impactScores: {
    economic: 82,
    social: 55,
    environmental: 42,
    infrastructure: 70,
    politicalRisk: 58,
    publicAcceptance: 52,
  },
  params: {
    budget: 950,
    population: 1.8,
    location: "Telangana",
    timeline: "15 years",
    projectType: "Land Use",
    policyType: "Industrial",
  },
  agentSequence: [
    agentBeat("economic", "Economic Agent", [
      "25,000 direct jobs projected; ₹1.8B annual tax revenue at maturity",
      "Export multiplier effect: 2.3x regional GDP contribution",
      "SME supplier ecosystem could add 8,000 indirect jobs",
    ]),
    agentBeat("social", "Social Agent", [
      "Adjacent villages face displacement pressure — 3,200 households affected",
      "Skill training programs critical for local employment share",
      "Public acceptance split along income lines",
    ]),
    agentBeat("environmental", "Environmental Agent", [
      "Water table stress in semi-arid zone — mitigation required",
      "Emissions increase +22% without green manufacturing standards",
      "Wetland buffer zone protection mandatory",
    ]),
    agentBeat("stakeholder", "Stakeholder Agent", [
      "Businesses and government strongly support (88% / 79%)",
      "Environmental advocates oppose (62% opposition)",
      "Local residents divided on employment vs. displacement",
    ]),
    agentBeat("risk", "Risk Agent", [
      "Environmental clearance timeline risk: high",
      "Land acquisition litigation probability: medium-high",
      "Water rights disputes possible in drought years",
    ]),
    agentBeat("futureShock", "Future Shock Agent", [
      "Industrial zone → Job growth → Migration influx → Housing pressure",
      "Supply chain shock could accelerate domestic manufacturing +20%",
      "Climate regulation may require retrofit costs by 2035",
    ]),
    agentBeat("chiefDecisionOfficer", "Chief Decision Officer", [
      "Viability score: 61/100 — proceed with strict environmental conditions",
      "Recommend green manufacturing standards as binding requirement",
      "Phased land release tied to compliance milestones",
    ]),
  ],
  recommendation: {
    viabilityScore: 61,
    keyRisks: ["Environmental clearance delays", "Community displacement", "Water resource conflict"],
    keyOpportunities: ["25,000 jobs", "Export revenue", "Regional industrial upgrade"],
    mitigations: ["Green manufacturing mandate", "Community benefit agreement", "Water recycling infrastructure"],
    alternativeScenario: "Reduce zone to 1,200 acres with stricter environmental buffer",
    executiveSummary:
      "New Industrial Zone offers substantial economic upside but carries elevated environmental and social risk. Conditional approval with green standards recommended.",
  },
  judgeInsights: {
    innovationScore: 89,
    technicalComplexity: "High — multi-domain impact modeling",
    stakeholderCoverage: "9 cohorts · 10,000 citizens",
    futurePredictionDepth: "20-year projection · 3 branches",
  },
});

export const FLYOVER_DEMO_PACK: JudgeDemoPack = assemblePack({
  id: "flyover",
  slug: "flyover-construction",
  title: "Flyover Construction Project",
  tagline: "Decongest critical junction at LB Nagar",
  overview: {
    budget: 320,
    timeline: "5 years",
    location: "Hyderabad",
    stakeholders: ["Commuters", "Citizens", "Businesses", "Government"],
    description:
      "Four-lane elevated flyover spanning 2.8km at LB Nagar junction, targeting 35% reduction in peak-hour wait times.",
  },
  impactScores: {
    economic: 65,
    social: 68,
    environmental: 52,
    infrastructure: 78,
    politicalRisk: 35,
    publicAcceptance: 71,
  },
  params: {
    budget: 320,
    population: 2.4,
    location: "Hyderabad",
    timeline: "5 years",
    projectType: "Infrastructure",
    policyType: "Roads",
  },
  agentSequence: [
    agentBeat("economic", "Economic Agent", [
      "₹180M annual productivity savings from reduced congestion",
      "Local retail foot traffic recovers post-construction by month 18",
      "Low fiscal exposure relative to metro-scale projects",
    ]),
    agentBeat("social", "Social Agent", [
      "350,000 daily commuters benefit from 22-minute average savings",
      "Temporary noise and dust impact on 1,200 adjacent households",
      "Pedestrian access improvements included in design",
    ]),
    agentBeat("environmental", "Environmental Agent", [
      "Modest emissions reduction from idling traffic elimination",
      "Green belt encroachment: 0.4 hectares — compensatory planting required",
      "Construction dust mitigation plan approved",
    ]),
    agentBeat("stakeholder", "Stakeholder Agent", [
      "Commuters strongly support (84%)",
      "Adjacent shop owners concerned during construction (45% oppose short-term)",
      "Government alignment high — quick-win infrastructure",
    ]),
    agentBeat("risk", "Risk Agent", [
      "Construction timeline risk: low-medium",
      "Utility relocation delays possible",
      "Minimal land acquisition — elevated design reduces conflict",
    ]),
    agentBeat("futureShock", "Future Shock Agent", [
      "Flyover → Traffic flow → Commercial revival → Property micro-appreciation",
      "Long-term: induced demand may offset gains by 2035 without transit integration",
      "Integration with metro feeder routes amplifies benefit +40%",
    ]),
    agentBeat("chiefDecisionOfficer", "Chief Decision Officer", [
      "Viability score: 78/100 — approve with transit integration clause",
      "Low cost, high commuter benefit, manageable environmental footprint",
      "Recommend concurrent metro feeder planning",
    ]),
  ],
  recommendation: {
    viabilityScore: 78,
    keyRisks: ["Induced demand offsetting gains", "Construction disruption to businesses", "Utility delays"],
    keyOpportunities: ["35% congestion reduction", "Low fiscal exposure", "Quick implementation timeline"],
    mitigations: ["Transit integration planning", "Business compensation fund during construction", "Night-shift construction windows"],
    alternativeScenario: "Hybrid flyover + bus rapid transit lane at grade",
    executiveSummary:
      "Flyover Construction Project delivers strong commuter benefits at modest cost. Approve with concurrent transit integration planning.",
  },
  judgeInsights: {
    innovationScore: 88,
    technicalComplexity: "High — agent + geo + society stack",
    stakeholderCoverage: "9 cohorts · 10,000 citizens",
    futurePredictionDepth: "20-year projection · 3 branches",
  },
});

export const JUDGE_DEMO_PACKS: Record<string, JudgeDemoPack> = {
  metro: METRO_DEMO_PACK,
  industrial: INDUSTRIAL_DEMO_PACK,
  flyover: FLYOVER_DEMO_PACK,
};

export function getDemoPackById(id: string): JudgeDemoPack | null {
  return JUDGE_DEMO_PACKS[id] ?? null;
}

export function getDemoPackBySlug(slug: string): JudgeDemoPack | null {
  return Object.values(JUDGE_DEMO_PACKS).find((p) => p.slug === slug) ?? null;
}
