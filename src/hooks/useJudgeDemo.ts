"use client";

import { useEffect, useRef, useCallback } from "react";
import { DemoOrchestrator } from "@/lib/judge/demoOrchestrator";
import { DEMO_STEPS } from "@/lib/judge/types";
import { useJudgeStore } from "@/stores/judge-store";

export function useJudgeDemo() {
  const orchestratorRef = useRef<DemoOrchestrator | null>(null);
  const activePack = useJudgeStore((s) => s.activePack);
  const stepIndex = useJudgeStore((s) => s.stepIndex);
  const autoPlay = useJudgeStore((s) => s.autoPlay);
  const demoActive = useJudgeStore((s) => s.demoActive);
  const setStepIndex = useJudgeStore((s) => s.setStepIndex);
  const setStepProgress = useJudgeStore((s) => s.setStepProgress);
  const setVisibleAgentIndex = useJudgeStore((s) => s.setVisibleAgentIndex);
  const setDemoComplete = useJudgeStore((s) => s.setDemoComplete);

  const startOrchestrator = useCallback(() => {
    const pack = useJudgeStore.getState().activePack;
    if (!pack) return;
    const { stepIndex: currentStepIndex, autoPlay: isAutoPlay } = useJudgeStore.getState();
    orchestratorRef.current?.stop();
    const orch = new DemoOrchestrator(pack.stepTimings, pack.agentSequence.length, {
      onStepEnter: (_step, index) => {
        setStepIndex(index);
        setStepProgress(0);
        setDemoComplete(false);
        if (_step === "agents") setVisibleAgentIndex(0);
      },
      onStepProgress: setStepProgress,
      onAgentBeat: setVisibleAgentIndex,
      onComplete: () => setDemoComplete(true),
    });
    orchestratorRef.current = orch;
    orch.start(currentStepIndex, isAutoPlay);
  }, [setStepIndex, setStepProgress, setVisibleAgentIndex, setDemoComplete]);

  useEffect(() => {
    if (!demoActive || !activePack) return;
    startOrchestrator();
    return () => orchestratorRef.current?.stop();
  }, [demoActive, activePack, startOrchestrator]);

  useEffect(() => {
    if (!demoActive) return;
    orchestratorRef.current?.stop();
    if (autoPlay && activePack) startOrchestrator();
  }, [autoPlay, demoActive, activePack, startOrchestrator]);

  const next = useCallback(() => {
    orchestratorRef.current?.stop();
    const nextIdx = Math.min(DEMO_STEPS.length - 1, stepIndex + 1);
    setStepIndex(nextIdx);
    if (autoPlay && activePack) {
      setTimeout(() => orchestratorRef.current?.runStep(nextIdx), 50);
    }
  }, [stepIndex, autoPlay, activePack, setStepIndex]);

  const prev = useCallback(() => {
    orchestratorRef.current?.stop();
    setStepIndex(Math.max(0, stepIndex - 1));
  }, [stepIndex, setStepIndex]);

  const toggleAutoPlay = useCallback(() => {
    const next = !useJudgeStore.getState().autoPlay;
    useJudgeStore.getState().setAutoPlay(next);
    if (next) orchestratorRef.current?.resume();
    else orchestratorRef.current?.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      useJudgeStore.getState().setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      useJudgeStore.getState().setFullscreen(false);
    }
  }, []);

  return { next, prev, toggleAutoPlay, toggleFullscreen };
}
