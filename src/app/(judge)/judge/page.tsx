"use client";

import { useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JudgeEntryScreen } from "@/components/judge/JudgeEntryScreen";
import { JudgeDemoFlow } from "@/components/judge/JudgeDemoFlow";
import { getDemoPackById, getDemoPackBySlug } from "@/lib/judge/demo-packs";
import { useJudgeStore } from "@/stores/judge-store";

function JudgePageInner() {
  const searchParams = useSearchParams();
  const demoActive = useJudgeStore((s) => s.demoActive);
  const activePack = useJudgeStore((s) => s.activePack);
  const setActivePack = useJudgeStore((s) => s.setActivePack);
  const setDemoActive = useJudgeStore((s) => s.setDemoActive);
  const resetDemo = useJudgeStore((s) => s.resetDemo);

  const startDemo = useCallback(
    (packId: string) => {
      const pack = getDemoPackById(packId);
      if (!pack) return;
      resetDemo();
      setActivePack(pack);
      setDemoActive(true);
    },
    [resetDemo, setActivePack, setDemoActive],
  );

  useEffect(() => {
    const scenario = searchParams.get("scenario");
    if (!scenario || demoActive) return;
    const byId = getDemoPackById(scenario);
    const bySlug = getDemoPackBySlug(scenario);
    const pack = byId ?? bySlug;
    if (pack) startDemo(pack.id);
  }, [searchParams, demoActive, startDemo]);

  const handleExit = useCallback(() => {
    resetDemo();
    setActivePack(null);
  }, [resetDemo, setActivePack]);

  const handlePickAnother = useCallback(() => {
    resetDemo();
    setActivePack(null);
  }, [resetDemo, setActivePack]);

  if (demoActive && activePack) {
    return <JudgeDemoFlow onExit={handleExit} onPickAnother={handlePickAnother} />;
  }

  return <JudgeEntryScreen onStart={startDemo} />;
}

export default function JudgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B]" />}>
      <JudgePageInner />
    </Suspense>
  );
}
