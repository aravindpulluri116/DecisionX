import { z } from "zod";

export const confidenceLevelSchema = z.enum(["low", "medium", "high"]);

export const baseAgentFieldsSchema = z.object({
  assumptions: z.array(z.string()).min(1),
  evidence: z.array(z.string()).min(1),
  uncertainties: z.array(z.string()),
  confidenceLevel: confidenceLevelSchema,
  confidence: z.number().min(0).max(100),
});

export const standardAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(1),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  impactScore: z.number().min(0).max(100),
});

export const stakeholderAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(1),
  affectedGroups: z.array(z.string()).min(1),
  supportScore: z.number().min(0).max(100),
  oppositionScore: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
});

export const riskMatrixEntrySchema = z.object({
  category: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  likelihood: z.enum(["low", "medium", "high"]),
  description: z.string(),
});

export const riskAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(1),
  riskMatrix: z.array(riskMatrixEntrySchema).min(1),
  riskScore: z.number().min(0).max(100),
  mitigations: z.array(z.string()),
  impactScore: z.number().min(0).max(100),
});

export const consequenceSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(["impact", "risk", "stakeholder", "environmental", "economic", "social"]),
  confidence: z.number().min(0).max(100),
});

export const futureShockAgentSchema = baseAgentFieldsSchema.extend({
  summary: z.string().min(1),
  consequences: z.array(consequenceSchema).min(2),
  impactScore: z.number().min(0).max(100),
});

export const cdoAgentSchema = z.object({
  viabilityScore: z.number().min(0).max(100),
  executiveSummary: z.string().min(1),
  keyRisks: z.array(z.string()).min(1),
  keyOpportunities: z.array(z.string()).min(1),
  recommendedActions: z.array(z.string()).min(1),
  alternativeScenarios: z.array(z.string()).min(1),
  assumptions: z.array(z.string()),
  evidence: z.array(z.string()),
  uncertainties: z.array(z.string()),
  confidenceLevel: confidenceLevelSchema,
  confidence: z.number().min(0).max(100),
});

export type StandardAgentOutput = z.infer<typeof standardAgentSchema>;
export type StakeholderAgentOutput = z.infer<typeof stakeholderAgentSchema>;
export type RiskAgentOutput = z.infer<typeof riskAgentSchema>;
export type FutureShockAgentOutput = z.infer<typeof futureShockAgentSchema>;
export type CdoAgentOutput = z.infer<typeof cdoAgentSchema>;
export type ConsequenceLink = z.infer<typeof consequenceSchema>;
