"use client";

import { DEMO_STEPS } from "@/lib/judge/types";
import { cn } from "@/lib/utils";
import { useJudgeStore } from "@/stores/judge-store";

export function JudgeProgressRail() {
  const stepIndex = useJudgeStore((s) => s.stepIndex);
  const stepProgress = useJudgeStore((s) => s.stepProgress);
  const presenterMode = useJudgeStore((s) => s.presenterMode);

  if (presenterMode) return null;

  return (
    <div className="flex h-1 w-full bg-white/10">
      {DEMO_STEPS.map((step, i) => (
        <div key={step} className="relative flex-1 border-r border-[#0A0A0B] last:border-0">
          <div
            className={cn(
              "absolute inset-y-0 left-0 bg-signal transition-all duration-300",
              i < stepIndex && "w-full",
              i === stepIndex && "bg-signal",
              i > stepIndex && "w-0",
            )}
            style={{ width: i === stepIndex ? `${stepProgress * 100}%` : i < stepIndex ? "100%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}
