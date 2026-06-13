import { create } from "zustand";
import type { DecisionProject, ProjectCategory, StakeholderGroup } from "@/types/simulation";

export type WizardStep = 1 | 2 | 3 | 4;

type WizardStore = {
  step: WizardStep;
  draft: Partial<DecisionProject>;
  errors: Record<string, string>;
  setStep: (step: WizardStep) => void;
  updateDraft: (patch: Partial<DecisionProject>) => void;
  setCategory: (category: ProjectCategory) => void;
  toggleStakeholder: (s: StakeholderGroup) => void;
  reset: () => void;
  validateStep: (step: WizardStep) => boolean;
};

const initialDraft: Partial<DecisionProject> = {
  title: "",
  description: "",
  location: "Hyderabad",
  budget: 800,
  timeline: "10 years",
  category: "Transportation",
  stakeholders: [],
};

export const useWizardStore = create<WizardStore>((set, get) => ({
  step: 1,
  draft: { ...initialDraft },
  errors: {},
  setStep: (step) => set({ step }),
  updateDraft: (patch) => set({ draft: { ...get().draft, ...patch }, errors: {} }),
  setCategory: (category) => set({ draft: { ...get().draft, category } }),
  toggleStakeholder: (s) => {
    const current = get().draft.stakeholders ?? [];
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    set({ draft: { ...get().draft, stakeholders: next } });
  },
  reset: () => set({ step: 1, draft: { ...initialDraft }, errors: {} }),
  validateStep: (step) => {
    const { draft } = get();
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!draft.title?.trim()) errors.title = "Project name is required";
      if (!draft.description?.trim()) errors.description = "Description is required";
    }
    if (step === 3) {
      if (!draft.stakeholders?.length) errors.stakeholders = "Select at least one stakeholder";
    }
    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));
