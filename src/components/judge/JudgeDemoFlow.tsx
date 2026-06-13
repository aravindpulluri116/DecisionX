"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useJudgeStore } from "@/stores/judge-store";
import { useJudgeDemo } from "@/hooks/useJudgeDemo";
import { JudgeModeShell } from "./JudgeModeShell";
import { JudgeStepOverview } from "./JudgeStepOverview";
import { JudgeStepAgents } from "./JudgeStepAgents";
import { JudgeStepImpact } from "./JudgeStepImpact";
import { JudgeStepSociety } from "./JudgeStepSociety";
import { JudgeStepTimeMachine } from "./JudgeStepTimeMachine";
import { JudgeStepHeadlines } from "./JudgeStepHeadlines";
import { JudgeStepRecommendation } from "./JudgeStepRecommendation";
import { JudgeClosingCard } from "./JudgeClosingCard";

type JudgeDemoFlowProps = {
  onExit: () => void;
  onPickAnother: () => void;
};

export function JudgeDemoFlow({ onExit, onPickAnother }: JudgeDemoFlowProps) {
  const pack = useJudgeStore((s) => s.activePack);
  const currentStep = useJudgeStore((s) => s.currentStep);
  const demoComplete = useJudgeStore((s) => s.demoComplete);
  const resetDemo = useJudgeStore((s) => s.resetDemo);
  const setDemoActive = useJudgeStore((s) => s.setDemoActive);

  useJudgeDemo();

  if (!pack) return null;

  const handleReplay = () => {
    resetDemo();
    setDemoActive(true);
    useJudgeStore.getState().setActivePack(pack);
  };

  return (
    <JudgeModeShell onExit={onExit}>
      <AnimatePresence mode="wait">
        {demoComplete ? (
          <motion.div
            key="closing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            <JudgeClosingCard slug={pack.slug} onReplay={handleReplay} onPickAnother={onPickAnother} />
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="flex flex-1 flex-col"
          >
            {currentStep === "overview" && <JudgeStepOverview pack={pack} />}
            {currentStep === "agents" && <JudgeStepAgents pack={pack} />}
            {currentStep === "impact" && <JudgeStepImpact pack={pack} />}
            {currentStep === "society" && <JudgeStepSociety pack={pack} />}
            {currentStep === "timemachine" && <JudgeStepTimeMachine pack={pack} />}
            {currentStep === "headlines" && <JudgeStepHeadlines pack={pack} />}
            {currentStep === "recommendation" && <JudgeStepRecommendation pack={pack} />}
          </motion.div>
        )}
      </AnimatePresence>
    </JudgeModeShell>
  );
}
