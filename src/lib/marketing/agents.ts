import { AGENT_LABELS, AGENT_ORDER } from "@/agents";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import type { AgentId } from "@/types/simulation";

export type MarketingAgent = {
  id: AgentId;
  label: string;
  role: string;
  shortLabel: string;
  tagline: string;
  description: string;
  outputs: string[];
  tier: "specialist" | "synthesizer";
  phase: number;
  color: string;
  glow: string;
};

const MARKETING_COPY: Record<
  AgentId,
  { tagline: string; description: string; outputs: string[] }
> = {
  economic: {
    tagline: "Models fiscal impact at project scale",
    description:
      "Quantifies jobs, productivity gains, budget overruns, and ROI using location intelligence and comparable infrastructure analogs — every figure tied to your project in ₹ crore.",
    outputs: ["Impact score", "Opportunities & risks", "₹ estimates", "Evidence trail"],
  },
  social: {
    tagline: "Maps who gains and who bears the cost",
    description:
      "Assesses commute, displacement, access to services, and quality-of-life shifts for named communities — not generic population statistics.",
    outputs: ["Community impact", "Displacement risk", "Service access", "Recommendations"],
  },
  environmental: {
    tagline: "Traces ecological footprint and climate exposure",
    description:
      "Evaluates emissions, green cover, storm-water, noise, and construction-phase environmental risk against the specific site and surrounding facilities.",
    outputs: ["CO₂ estimates", "Ecological risks", "Mitigation paths", "Geo evidence"],
  },
  stakeholder: {
    tagline: "Surfaces political weight and sentiment",
    description:
      "Identifies affected groups — vendors, institutions, residents, businesses — with qualitative support trends grounded in project context, not invented polls.",
    outputs: ["Affected groups", "Sentiment map", "Support trend", "Coalition risks"],
  },
  risk: {
    tagline: "Prioritizes what can derail delivery",
    description:
      "Builds a severity × likelihood matrix across financial, political, legal, and timeline dimensions — mandatory for large-budget Indian infrastructure contexts.",
    outputs: ["Risk matrix", "Risk score", "Mitigations", "Category breakdown"],
  },
  futureShock: {
    tagline: "Traces second- and third-order ripples",
    description:
      "Chains causal links from your decision into unexpected spillovers — the consequences standard first-order analysis misses before ground is broken.",
    outputs: ["Consequence chains", "Link strength", "Spillover risks", "Hidden upside"],
  },
  chiefDecisionOfficer: {
    tagline: "Synthesizes the council into a verdict",
    description:
      "Reads all six specialist reports and delivers an executive recommendation — viability score, key risks, opportunities, and numbered actions your board can act on.",
    outputs: ["Viability score", "Executive summary", "Key risks & wins", "Action plan"],
  },
};

export const MARKETING_AGENTS: MarketingAgent[] = AGENT_ORDER.map((id, index) => {
  const visual = AGENT_VISUALS[id];
  const copy = MARKETING_COPY[id];
  return {
    id,
    label: AGENT_LABELS[id],
    role: visual.role,
    shortLabel: visual.shortLabel,
    tagline: copy.tagline,
    description: copy.description,
    outputs: copy.outputs,
    tier: id === "chiefDecisionOfficer" ? "synthesizer" : "specialist",
    phase: index + 1,
    color: visual.color,
    glow: visual.glow,
  };
});

export const SPECIALIST_AGENTS = MARKETING_AGENTS.filter((a) => a.tier === "specialist");
export const SYNTHESIZER_AGENT = MARKETING_AGENTS.find((a) => a.tier === "synthesizer")!;
