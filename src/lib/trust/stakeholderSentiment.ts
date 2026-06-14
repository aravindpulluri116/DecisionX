import type { AgentResult, StakeholderGroupSentiment, StakeholderSentiment, SupportTrend } from "@/types/simulation";
import { SENTIMENT_LABELS, SUPPORT_TREND_LABELS } from "./labels";

const SENTIMENT_VALUES: StakeholderSentiment[] = [
  "strong_support",
  "moderate_support",
  "mixed_sentiment",
  "moderate_opposition",
  "strong_opposition",
  "concerned",
];

const SUPPORT_WEIGHT: Record<StakeholderSentiment, number> = {
  strong_support: 2,
  moderate_support: 1,
  mixed_sentiment: 0,
  concerned: -0.5,
  moderate_opposition: -1,
  strong_opposition: -2,
};

function normalizeSentiment(value: string): StakeholderSentiment | null {
  const key = value.toLowerCase().replace(/\s+/g, "_") as StakeholderSentiment;
  if (SENTIMENT_VALUES.includes(key)) return key;
  if (value.toLowerCase().includes("strong") && value.toLowerCase().includes("support")) return "strong_support";
  if (value.toLowerCase().includes("moderate") && value.toLowerCase().includes("support")) return "moderate_support";
  if (value.toLowerCase().includes("strong") && value.toLowerCase().includes("oppos")) return "strong_opposition";
  if (value.toLowerCase().includes("moderate") && value.toLowerCase().includes("oppos")) return "moderate_opposition";
  if (value.toLowerCase().includes("concern")) return "concerned";
  if (value.toLowerCase().includes("mixed")) return "mixed_sentiment";
  return null;
}

function parseGroupName(raw: string): string {
  return raw.split("—")[0].split(" - ")[0].split("(")[0].trim();
}

function inferSentimentFromText(group: string, risks: string[], opportunities: string[]): StakeholderSentiment {
  const g = group.toLowerCase();
  const riskHit = risks.some((r) => r.toLowerCase().includes(g.slice(0, 8)));
  const oppHit = opportunities.some((o) => o.toLowerCase().includes(g.slice(0, 8)));
  if (riskHit && oppHit) return "mixed_sentiment";
  if (riskHit) return "moderate_opposition";
  if (oppHit) return "moderate_support";
  return "mixed_sentiment";
}

function deriveSupportTrend(groups: StakeholderGroupSentiment[]): SupportTrend {
  if (!groups.length) return "mixed_sentiment";
  const avg = groups.reduce((sum, g) => sum + SUPPORT_WEIGHT[g.sentiment], 0) / groups.length;
  if (avg >= 1.2) return "strong_support";
  if (avg >= 0.4) return "moderate_support";
  if (avg <= -1.2) return "strong_opposition";
  if (avg <= -0.4) return "moderate_opposition";
  return "mixed_sentiment";
}

type StakeholderRaw = {
  groupSentiments?: { group: string; sentiment: string }[];
  supportTrend?: string;
  affectedGroups?: string[];
  supportScore?: number;
  oppositionScore?: number;
};

export type StakeholderTrustView = {
  supportTrend: SupportTrend;
  supportTrendLabel: string;
  groups: StakeholderGroupSentiment[];
};

export function buildStakeholderTrustView(result: AgentResult | undefined): StakeholderTrustView | null {
  if (!result) return null;

  const raw = result.raw as StakeholderRaw | undefined;
  let groups: StakeholderGroupSentiment[] = [];

  if (raw?.groupSentiments?.length) {
    groups = raw.groupSentiments
      .map((entry) => {
        const sentiment = normalizeSentiment(entry.sentiment);
        if (!sentiment) return null;
        return { group: parseGroupName(entry.group), sentiment };
      })
      .filter((g): g is StakeholderGroupSentiment => g != null);
  }

  if (!groups.length && raw?.affectedGroups?.length) {
    groups = raw.affectedGroups.map((g) => ({
      group: parseGroupName(g),
      sentiment: inferSentimentFromText(g, result.risks, result.opportunities),
    }));
  }

  if (!groups.length) return null;

  let supportTrend: SupportTrend;
  if (raw?.supportTrend) {
    const parsed = normalizeSentiment(raw.supportTrend);
    supportTrend =
      parsed && parsed !== "concerned" ? (parsed as SupportTrend) : deriveSupportTrend(groups);
  } else {
    supportTrend = deriveSupportTrend(groups);
  }

  return {
    supportTrend,
    supportTrendLabel: SUPPORT_TREND_LABELS[supportTrend],
    groups,
  };
}

export function sentimentLabel(sentiment: StakeholderSentiment): string {
  return SENTIMENT_LABELS[sentiment];
}
