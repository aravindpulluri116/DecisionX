import { create } from "zustand";
import type { DecisionProject, ProjectCategory } from "@/types/simulation";
import { validateProjectInputQuality } from "@/lib/validation/projectInput";

export type WizardStep = 1 | 2 | 3 | 4;

type WizardStore = {
  draft: Partial<DecisionProject>;
  errors: Record<string, string>;
  step: WizardStep;
  updateDraft: (patch: Partial<DecisionProject>) => void;
  reset: () => void;
  validate: () => boolean;
  validateStep: (step: WizardStep) => boolean;
  setStep: (step: WizardStep) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  setErrors: (errors: Record<string, string>) => void;
};

const CATEGORIES: ProjectCategory[] = [
  "Transportation",
  "Urban Development",
  "Environment",
  "Education",
  "Healthcare",
  "Economic Policy",
];

export { CATEGORIES as WIZARD_CATEGORIES };

const initialDraft: Partial<DecisionProject> = {
  title: "",
  description: "",
  location: "",
  budget: undefined,
  timeline: "10 years",
  category: "Transportation",
  stakeholders: [],
};

function draftAsInput(draft: Partial<DecisionProject>): Parameters<typeof validateProjectInputQuality>[0] {
  return {
    title: draft.title ?? "",
    description: draft.description ?? "",
    location: draft.location ?? "",
    budget: draft.budget ?? NaN,
    timeline: draft.timeline ?? "",
    category: draft.category,
    stakeholders: draft.stakeholders,
  };
}

function pickErrors(all: Record<string, string>, fields: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if (all[f]) out[f] = all[f];
  }
  return out;
}

const STEP_FIELDS: Record<WizardStep, string[]> = {
  1: ["title", "description"],
  2: ["location", "category"],
  3: ["budget", "timeline", "stakeholders"],
  4: ["title", "description", "location", "category", "budget", "timeline", "stakeholders"],
};

export const useWizardStore = create<WizardStore>((set, get) => ({
  draft: { ...initialDraft },
  errors: {},
  step: 1,
  updateDraft: (patch) => set({ draft: { ...get().draft, ...patch }, errors: {} }),
  reset: () => set({ draft: { ...initialDraft }, errors: {}, step: 1 }),
  setErrors: (errors) => set({ errors }),
  setStep: (step) => set({ step }),
  prevStep: () => {
    const { step } = get();
    if (step > 1) set({ step: (step - 1) as WizardStep, errors: {} });
  },
  nextStep: () => {
    const { step } = get();
    if (!get().validateStep(step)) return false;
    if (step < 4) set({ step: (step + 1) as WizardStep, errors: {} });
    return true;
  },
  validateStep: (step) => {
    const { draft } = get();
    const all = validateProjectInputQuality(draftAsInput(draft));
    if (!draft.category && step >= 2) {
      all.category = "Category is required";
    }
    const errors = pickErrors(all, STEP_FIELDS[step]);
    set({ errors });
    return Object.keys(errors).length === 0;
  },
  validate: () => {
    const { draft } = get();
    const errors = validateProjectInputQuality(draftAsInput(draft));
    if (!draft.category) {
      errors.category = "Category is required";
    }
    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));
