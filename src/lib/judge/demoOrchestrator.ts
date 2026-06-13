import type { DemoStep } from "./types";
import { DEMO_STEPS } from "./types";

export type DemoOrchestratorCallbacks = {
  onStepEnter?: (step: DemoStep, index: number) => void;
  onStepProgress?: (progress: number) => void;
  onAgentBeat?: (index: number) => void;
  onTimeMachineYear?: (index: number) => void;
  onComplete?: () => void;
};

export class DemoOrchestrator {
  private timer: ReturnType<typeof setInterval> | null = null;
  private stepTimer: ReturnType<typeof setTimeout> | null = null;
  private agentTimer: ReturnType<typeof setInterval> | null = null;
  private yearTimer: ReturnType<typeof setInterval> | null = null;
  private stepStart = 0;
  private paused = false;
  private stepDurations: Record<DemoStep, number>;
  private agentCount: number;
  private yearCount: number;

  constructor(
    stepDurations: Record<DemoStep, number>,
    agentCount: number,
    yearCount: number,
    private callbacks: DemoOrchestratorCallbacks,
  ) {
    this.stepDurations = stepDurations;
    this.agentCount = agentCount;
    this.yearCount = yearCount;
  }

  start(stepIndex: number, autoPlay: boolean) {
    this.stop();
    if (!autoPlay) return;
    this.runStep(stepIndex);
  }

  runStep(stepIndex: number) {
    this.clearSubTimers();
    const step = DEMO_STEPS[stepIndex];
    if (!step) return;

    this.callbacks.onStepEnter?.(step, stepIndex);
    this.stepStart = Date.now();
    const duration = this.stepDurations[step];

    if (step === "agents") {
      let agentIdx = 0;
      const agentDuration = duration / Math.max(1, this.agentCount);
      this.callbacks.onAgentBeat?.(0);
      this.agentTimer = setInterval(() => {
        agentIdx += 1;
        if (agentIdx < this.agentCount) {
          this.callbacks.onAgentBeat?.(agentIdx);
        } else if (this.agentTimer) {
          clearInterval(this.agentTimer);
        }
      }, agentDuration);
    }

    if (step === "timemachine") {
      let yearIdx = 0;
      const yearDuration = duration / Math.max(1, this.yearCount);
      this.callbacks.onTimeMachineYear?.(0);
      this.yearTimer = setInterval(() => {
        yearIdx += 1;
        if (yearIdx < this.yearCount) {
          this.callbacks.onTimeMachineYear?.(yearIdx);
        } else if (this.yearTimer) {
          clearInterval(this.yearTimer);
        }
      }, yearDuration);
    }

    this.timer = setInterval(() => {
      if (this.paused) return;
      const elapsed = Date.now() - this.stepStart;
      this.callbacks.onStepProgress?.(Math.min(1, elapsed / duration));
    }, 100);

    this.stepTimer = setTimeout(() => {
      this.clearSubTimers();
      if (this.timer) clearInterval(this.timer);
      if (stepIndex < DEMO_STEPS.length - 1) {
        this.runStep(stepIndex + 1);
      } else {
        this.callbacks.onComplete?.();
      }
    }, duration);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  stop() {
    this.paused = false;
    if (this.timer) clearInterval(this.timer);
    if (this.stepTimer) clearTimeout(this.stepTimer);
    this.clearSubTimers();
    this.timer = null;
    this.stepTimer = null;
  }

  private clearSubTimers() {
    if (this.agentTimer) clearInterval(this.agentTimer);
    if (this.yearTimer) clearInterval(this.yearTimer);
    this.agentTimer = null;
    this.yearTimer = null;
  }
}
