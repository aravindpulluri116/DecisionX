import { create } from "zustand";
import type { DemoStep, JudgeDemoPack } from "@/lib/judge/types";
import { DEMO_STEPS } from "@/lib/judge/types";

type JudgeStore = {
  activePack: JudgeDemoPack | null;
  currentStep: DemoStep;
  stepIndex: number;
  stepProgress: number;
  autoPlay: boolean;
  presenterMode: boolean;
  fullscreen: boolean;
  demoActive: boolean;
  visibleAgentIndex: number;
  demoComplete: boolean;
  setActivePack: (pack: JudgeDemoPack | null) => void;
  setCurrentStep: (step: DemoStep) => void;
  setStepIndex: (i: number) => void;
  setStepProgress: (p: number) => void;
  setAutoPlay: (on: boolean) => void;
  setPresenterMode: (on: boolean) => void;
  setFullscreen: (on: boolean) => void;
  setDemoActive: (on: boolean) => void;
  setVisibleAgentIndex: (i: number) => void;
  setDemoComplete: (on: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetDemo: () => void;
};

export const useJudgeStore = create<JudgeStore>((set, get) => ({
  activePack: null,
  currentStep: "overview",
  stepIndex: 0,
  stepProgress: 0,
  autoPlay: true,
  presenterMode: false,
  fullscreen: false,
  demoActive: false,
  visibleAgentIndex: 0,
  demoComplete: false,
  setActivePack: (pack) => set({ activePack: pack }),
  setCurrentStep: (step) => {
    const idx = DEMO_STEPS.indexOf(step);
    set({ currentStep: step, stepIndex: idx >= 0 ? idx : 0, stepProgress: 0 });
  },
  setStepIndex: (i) => {
    const step = DEMO_STEPS[Math.max(0, Math.min(DEMO_STEPS.length - 1, i))];
    set({ stepIndex: i, currentStep: step, stepProgress: 0, demoComplete: false });
  },
  setStepProgress: (p) => set({ stepProgress: p }),
  setAutoPlay: (on) => set({ autoPlay: on }),
  setPresenterMode: (on) => set({ presenterMode: on }),
  setFullscreen: (on) => set({ fullscreen: on }),
  setDemoActive: (on) => set({ demoActive: on }),
  setVisibleAgentIndex: (i) => set({ visibleAgentIndex: i }),
  setDemoComplete: (on) => set({ demoComplete: on }),
  nextStep: () => {
    const { stepIndex } = get();
    if (stepIndex < DEMO_STEPS.length - 1) {
      get().setStepIndex(stepIndex + 1);
    }
  },
  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) get().setStepIndex(stepIndex - 1);
  },
  resetDemo: () =>
    set({
      currentStep: "overview",
      stepIndex: 0,
      stepProgress: 0,
      visibleAgentIndex: 0,
      demoActive: false,
      demoComplete: false,
    }),
}));
