"use client";

import { motion } from "framer-motion";
import { useJudgeStore } from "@/stores/judge-store";

export function JudgeInsightsPanel() {  const pack = useJudgeStore((s) => s.activePack);
  const stepIndex = useJudgeStore((s) => s.stepIndex);
  const currentStep = useJudgeStore((s) => s.currentStep);
  const presenterMode = useJudgeStore((s) => s.presenterMode);

  if (!pack || presenterMode) return null;

  const insights = pack.judgeInsights;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-16 z-50 w-56 border border-white/10 bg-black/80 p-4 backdrop-blur-md"
    >
      <p className="font-mono-data text-[9px] uppercase tracking-[0.2em] text-signal">Judge Insights</p>
      <div className="mt-3 space-y-3">
        <InsightRow
          label="Innovation Score"
          value={`${insights.innovationScore} / 100`}
          highlight={stepIndex >= 0}
        />
        <InsightRow
          label="Technical Complexity"
          value={insights.technicalComplexity}
          highlight={stepIndex >= 1}
        />
        <InsightRow
          label="Stakeholder Coverage"
          value={insights.stakeholderCoverage}
          highlight={currentStep === "society" || stepIndex >= 3}
        />
        <InsightRow
          label="Future Prediction Depth"
          value={insights.futurePredictionDepth}
          highlight={currentStep === "headlines" || stepIndex >= 4}
        />
      </div>
    </motion.div>
  );
}

function InsightRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight: boolean;
}) {
  return (
    <div className={highlight ? "text-white" : "text-white/40"}>
      <p className="font-mono-data text-[8px] uppercase">{label}</p>
      <p className="mt-0.5 text-xs">{value}</p>
    </div>
  );
}
