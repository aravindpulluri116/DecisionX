import { z } from "zod";

// Case-insensitive enum helper so Claude's "High" / "HIGH" both pass
const ciEnum = <T extends string>(...values: T[]) =>
  z
    .string()
    .transform((v) => v.toLowerCase() as T)
    .pipe(z.enum(values as [T, ...T[]]));

export const confidenceLevelSchema = ciEnum("low", "medium", "high", "very_high");

export const baseAgentFieldsSchema = z.object({
  assumptions: z.array(z.string()).default([]),
  evidence: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  /** @deprecated Ignored — platform derives confidence from data quality */
  confidenceLevel: confidenceLevelSchema.optional(),
  /** @deprecated Ignored — platform derives confidence from data quality */
  confidence: z.number().min(0).max(100).optional(),
});

export const standardAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(10),
  opportunities: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  recommendations: z.array(z.string()).default([]),
  impactScore: z.number().min(0).max(100),
});

export const stakeholderSentimentSchema = ciEnum(
  "strong_support",
  "moderate_support",
  "mixed_sentiment",
  "moderate_opposition",
  "strong_opposition",
  "concerned",
);

export const supportTrendSchema = ciEnum(
  "strong_support",
  "moderate_support",
  "mixed_sentiment",
  "moderate_opposition",
  "strong_opposition",
);

export const groupSentimentSchema = z.object({
  group: z.string().min(2),
  sentiment: stakeholderSentimentSchema,
});

export const stakeholderAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(10),
  affectedGroups: z.array(z.string()).min(1),
  groupSentiments: z.array(groupSentimentSchema).min(2).max(8),
  supportTrend: supportTrendSchema,
  impactScore: z.number().min(0).max(100),
  risks: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

export const riskMatrixEntrySchema = z.object({
  category: z.string().min(1),
  severity: ciEnum("low", "medium", "high", "critical"),
  likelihood: ciEnum("low", "medium", "high"),
  description: z.string().min(5),
});

export const riskAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(10),
  riskMatrix: z.array(riskMatrixEntrySchema).min(1),
  riskScore: z.number().min(0).max(100),
  mitigations: z.array(z.string()).default([]),
  impactScore: z.number().min(0).max(100),
});

export const consequenceSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: ciEnum("impact", "risk", "stakeholder", "environmental", "economic", "social"),
  linkStrength: ciEnum("direct", "indirect", "speculative").default("indirect"),
});

export const futureShockAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(10),
  consequences: z.array(consequenceSchema).min(2),
  impactScore: z.number().min(0).max(100),
  // Claude sometimes includes these; accept them
  opportunities: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
});

export const cdoAgentSchema = z.object({
  viabilityScore: z.number().min(0).max(100),
  executiveSummary: z.string().min(20),
  keyRisks: z.array(z.string()).min(1),
  keyOpportunities: z.array(z.string()).min(1),
  recommendedActions: z.array(z.string()).min(1),
  alternativeScenarios: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  evidence: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  /** @deprecated Ignored — platform derives confidence */
  confidenceLevel: confidenceLevelSchema.optional(),
  /** @deprecated Ignored — platform derives confidence */
  confidence: z.number().min(0).max(100).optional(),
});

export type StandardAgentOutput = z.infer<typeof standardAgentSchema>;
export type StakeholderAgentOutput = z.infer<typeof stakeholderAgentSchema>;
export type RiskAgentOutput = z.infer<typeof riskAgentSchema>;
export type FutureShockAgentOutput = z.infer<typeof futureShockAgentSchema>;
export type CdoAgentOutput = z.output<typeof cdoAgentSchema>;
export type ConsequenceLink = z.infer<typeof consequenceSchema>;
