"use client";

import { useJudgeStore } from "@/stores/judge-store";
import { useJudgeDemo } from "@/hooks/useJudgeDemo";
import { cn } from "@/lib/utils";

type JudgePresenterControlsProps = {
  onExit: () => void;
};

export function JudgePresenterControls({ onExit }: JudgePresenterControlsProps) {
  const autoPlay = useJudgeStore((s) => s.autoPlay);
  const presenterMode = useJudgeStore((s) => s.presenterMode);
  const setPresenterMode = useJudgeStore((s) => s.setPresenterMode);
  const { next, prev, toggleAutoPlay, toggleFullscreen } = useJudgeDemo();

  if (presenterMode) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-50 h-16 opacity-0 transition-opacity hover:opacity-100"
        onMouseEnter={() => setPresenterMode(false)}
      />
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur">
      <ControlBtn onClick={prev} label="Previous" />
      <ControlBtn onClick={toggleAutoPlay} label={autoPlay ? "Pause" : "Auto Play"} active={autoPlay} />
      <ControlBtn onClick={next} label="Next" primary />
      <ControlBtn onClick={() => setPresenterMode(true)} label="Presenter" />
      <ControlBtn onClick={toggleFullscreen} label="Fullscreen" />
      <ControlBtn onClick={onExit} label="Exit" />
    </div>
  );
}

function ControlBtn({
  onClick,
  label,
  primary,
  active,
}: {
  onClick: () => void;
  label: string;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 font-mono-data text-[10px] uppercase tracking-[0.12em] transition-colors",
        primary && "border border-signal bg-signal text-white",
        active && !primary && "text-signal",
        !primary && !active && "border border-white/20 text-white/70 hover:border-white/40 hover:text-white",
      )}
    >
      {label}
    </button>
  );
}
