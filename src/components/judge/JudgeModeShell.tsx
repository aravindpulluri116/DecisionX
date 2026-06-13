"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { useJudgeStore } from "@/stores/judge-store";
import { useJudgeDemo } from "@/hooks/useJudgeDemo";
import { JudgeProgressRail } from "./JudgeProgressRail";
import { JudgeInsightsPanel } from "./JudgeInsightsPanel";
import { JudgePresenterControls } from "./JudgePresenterControls";

type JudgeModeShellProps = {
  children: ReactNode;
  onExit: () => void;
};

export function JudgeModeShell({ children, onExit }: JudgeModeShellProps) {
  const setPresenterMode = useJudgeStore((s) => s.setPresenterMode);
  const presenterMode = useJudgeStore((s) => s.presenterMode);
  const demoComplete = useJudgeStore((s) => s.demoComplete);
  const { next, prev, toggleAutoPlay, toggleFullscreen } = useJudgeDemo();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
        case "Escape":
          e.preventDefault();
          onExit();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    },
    [next, prev, toggleAutoPlay, toggleFullscreen, onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const onFullscreenChange = () => {
      useJudgeStore.getState().setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!presenterMode) return;
    const showControls = () => setPresenterMode(false);
    window.addEventListener("mousemove", showControls);
    return () => window.removeEventListener("mousemove", showControls);
  }, [presenterMode, setPresenterMode]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0B] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {!demoComplete && <JudgeProgressRail />}
      <JudgeInsightsPanel />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      {!demoComplete && <JudgePresenterControls onExit={onExit} />}
    </div>
  );
}
