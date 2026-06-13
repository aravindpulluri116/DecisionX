"use client";

import { motion } from "framer-motion";
import type { JudgeDemoPack } from "@/lib/judge/types";
import { useJudgeStore } from "@/stores/judge-store";
import { TIME_MACHINE_MILESTONES } from "@/hooks/useJudgeDemo";
import type { TimelineMilestone } from "@/types/timemachine";
import { visibleConsequences } from "@/lib/timemachine/consequenceTimeline";

export function JudgeStepTimeMachine({ pack }: { pack: JudgeDemoPack }) {
  const yearIndex = useJudgeStore((s) => s.timeMachineYearIndex);
  const milestone = (TIME_MACHINE_MILESTONES[yearIndex] ?? "present") as TimelineMilestone;
  const trajectory = pack.timeMachine.expected;
  const snapshot = trajectory.snapshots[milestone];
  const cityState = trajectory.cityStates.find((c) => c.milestone === milestone);
  const consequences = visibleConsequences(trajectory.consequences, milestone);

  return (
    <div className="flex flex-1 flex-col px-8 py-10">
      <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
        Step 5 · Decision Time Machine
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold">Travel Through the Future</h2>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TIME_MACHINE_MILESTONES.map((m, i) => (
          <div
            key={m}
            className={`shrink-0 px-3 py-2 font-mono-data text-[10px] uppercase ${
              i <= yearIndex ? "text-signal" : "text-white/30"
            }`}
          >
            {trajectory.calendarYears[m as TimelineMilestone]}
          </div>
        ))}
      </div>

      {snapshot && (
        <motion.div
          key={milestone}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <div className="border border-white/10 bg-white/5 p-6">
            <p className="font-mono-data text-[10px] text-white/40">{snapshot.calendarYear}</p>
            <p className="mt-2 font-display text-2xl font-bold">
              Viability: {snapshot.politicalViability} ({snapshot.viabilityScore})
            </p>
            <p className="mt-2 text-sm text-white/60">
              Support {snapshot.sentiment.supportPct}% · Infrastructure {snapshot.infrastructure}
            </p>
            {cityState && (
              <div className="mt-6 flex h-32 items-end gap-1">
                {cityState.zoneHeatmap.map((z) => (
                  <motion.div
                    key={z.zoneId}
                    className="flex-1 bg-signal/70"
                    animate={{ height: `${30 + z.supportWeight * 80}px` }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="font-mono-data text-[10px] uppercase text-white/40">Consequences emerging</p>
            <div className="mt-3 space-y-2">
              {consequences.map((c) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-white/10 px-3 py-2 text-sm"
                >
                  <span className="font-mono-data text-signal">{c.year}</span> — {c.label}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
