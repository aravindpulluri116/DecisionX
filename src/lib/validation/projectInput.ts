import { z } from "zod";

/** Same char repeated, or trivially short alphabetic strings */
export const GIBBERISH_RE = /^(.)\1{3,}$|^[a-z]{1,3}$/i;

export const PROJECT_CATEGORIES = [
  "Transportation",
  "Urban Development",
  "Environment",
  "Education",
  "Healthcare",
  "Economic Policy",
] as const;

export type ProjectCategoryValue = (typeof PROJECT_CATEGORIES)[number];

export function isGibberishText(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3) return true;

  const compact = trimmed.replace(/\s+/g, "");
  if (compact.length >= 4 && GIBBERISH_RE.test(compact)) return true;

  const alphaNum = trimmed.replace(/[\s\d\W_]+/g, "").toLowerCase();
  if (alphaNum.length >= 6) {
    const unique = new Set(alphaNum).size;
    if (unique <= 2) return true;
    const first = alphaNum[0];
    if (alphaNum.split("").every((c) => c === first)) return true;
  }

  return false;
}

export function hasEnoughWords(text: string, minWords: number): boolean {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.replace(/\W/g, "").length >= 2);
  return words.length >= minWords;
}

export type ProjectInputFields = {
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  category?: string;
  stakeholders?: string[];
};

export function validateProjectInputQuality(input: ProjectInputFields): Record<string, string> {
  const errors: Record<string, string> = {};

  const title = input.title.trim();
  const description = input.description.trim();
  const location = input.location.trim();

  if (title.length < 5) {
    errors.title = "Project name must be at least 5 characters";
  } else if (isGibberishText(title)) {
    errors.title = "Enter a meaningful project name (not repeated characters or placeholders)";
  }

  if (description.length < 30) {
    errors.description =
      "Description must be at least 30 characters — explain what the project will do, for whom, and where";
  } else if (isGibberishText(description)) {
    errors.description = "Description looks like placeholder text — describe the actual project";
  } else if (!hasEnoughWords(description, 5)) {
    errors.description = "Use at least 5 meaningful words describing scope, beneficiaries, and outcomes";
  }

  if (location.length < 3) {
    errors.location = "Location is required";
  } else if (isGibberishText(location)) {
    errors.location = "Enter a real location (city, district, or region — not placeholder text)";
  } else if (location.length < 6 && !/[,/-]/.test(location)) {
    errors.location = "Be more specific — e.g. Whitefield, Bangalore, Karnataka";
  }

  if (input.budget == null || Number.isNaN(input.budget) || input.budget <= 0) {
    errors.budget = "Budget must be a positive number (₹ crore)";
  }

  if (!input.timeline?.trim()) {
    errors.timeline = "Timeline is required";
  }

  if (input.category !== undefined && !input.category.trim()) {
    errors.category = "Category is required";
  }

  const stakeholders = input.stakeholders;
  if (stakeholders !== undefined) {
    if (stakeholders.length === 0) {
      errors.stakeholders = "Add at least one stakeholder group";
    } else if (stakeholders.some((s) => isGibberishText(s) || s.length < 3)) {
      errors.stakeholders = "Use real stakeholder groups (e.g. Citizens, Government, Businesses)";
    }
  }

  return errors;
}

export function projectInputQualitySchema() {
  return z
    .object({
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(4000),
      location: z.string().min(1).max(200),
      budget: z.number().positive().max(1_000_000),
      timeline: z.string().min(1).max(50),
      category: z.enum(PROJECT_CATEGORIES).optional(),
      stakeholders: z.array(z.string()).optional(),
    })
    .superRefine((data, ctx) => {
      const fieldErrors = validateProjectInputQuality({
        title: data.title,
        description: data.description,
        location: data.location,
        budget: data.budget,
        timeline: data.timeline,
        category: data.category,
        stakeholders: data.stakeholders,
      });
      for (const [field, message] of Object.entries(fieldErrors)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [field] });
      }
    });
}

export const qualityProjectInputSchema = projectInputQualitySchema();
