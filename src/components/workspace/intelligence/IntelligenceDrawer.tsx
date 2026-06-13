"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Shield, Users, X, Zap } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { intelligenceSlide } from "@/lib/motion/workspace";
import { KpiCard } from "../shared/KpiCard";
import { cn } from "@/lib/utils";
import { TONE_STYLES } from "@/lib/workspace/impact-metrics";

export function IntelligenceDrawer() {
  const open = useWorkspaceStore((s) => s.drawerOpen);
  const setDrawerOpen = useWorkspaceStore((s) => s.setDrawerOpen);
  const nodeIntelligence = useWorkspaceStore((s) => s.nodeIntelligence);

  return (
    <AnimatePresence>
      {open && nodeIntelligence && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink/20 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            {...intelligenceSlide}
            className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-md flex-col border-l border-hairline bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-hairline px-5 py-4">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                  Node analysis
                </p>
                <p className="mt-1 font-display text-base font-semibold leading-snug text-ink">
                  {nodeIntelligence.stakeholders[0] ?? "Impact node"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="shrink-0 rounded-lg p-1 text-ink-muted hover:bg-background hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2">
                <KpiCard label="Impact" value={nodeIntelligence.impact_strength} tone="signal" icon={Zap} compact />
                <KpiCard label="Confidence" value={nodeIntelligence.confidence} tone="positive" icon={Shield} compact />
              </div>

              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                  <Users className="h-3 w-3" />
                  Stakeholders
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {nodeIntelligence.stakeholders.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-warning/25 bg-warning/8 px-2 py-0.5 text-[10px] font-medium text-warning"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                  <Calendar className="h-3 w-3" />
                  Timeline
                </p>
                <div className="space-y-2">
                  {nodeIntelligence.timeline.map((t) => (
                    <div
                      key={t.year}
                      className="flex gap-3 rounded-lg border border-hairline bg-background/60 px-3 py-2"
                    >
                      <span className="font-mono-data text-xs font-semibold text-signal">{t.year}</span>
                      <p className="text-xs leading-snug text-ink">{t.event}</p>
                    </div>
                  ))}
                </div>
              </section>

              {(nodeIntelligence.evidence?.length ?? 0) > 0 && (
                <InsightCards title="Evidence" items={nodeIntelligence.evidence!} tone="signal" />
              )}

              {(nodeIntelligence.mitigation?.length ?? 0) > 0 && (
                <InsightCards title="Mitigations" items={nodeIntelligence.mitigation} tone="positive" />
              )}

              {(nodeIntelligence.assumptions?.length ?? 0) > 0 && (
                <InsightCards title="Assumptions" items={nodeIntelligence.assumptions!} tone="neutral" compact />
              )}

              {(nodeIntelligence.uncertainties?.length ?? 0) > 0 && (
                <InsightCards title="Uncertainties" items={nodeIntelligence.uncertainties!} tone="warning" compact />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function InsightCards({
  title,
  items,
  tone,
  compact,
}: {
  title: string;
  items: string[];
  tone: keyof typeof TONE_STYLES;
  compact?: boolean;
}) {
  const styles = TONE_STYLES[tone];
  const visible = compact ? items.slice(0, 3) : items.slice(0, 4);

  return (
    <section>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">{title}</p>
      <div className="space-y-1.5">
        {visible.map((item) => (
          <div
            key={item}
            className={cn(
              "rounded-lg border px-3 text-xs leading-snug text-ink",
              compact ? "py-1.5" : "py-2",
              styles.bg,
              styles.border,
            )}
          >
            {item}
          </div>
        ))}
        {items.length > visible.length && (
          <p className="text-[10px] text-ink-muted">+{items.length - visible.length} more</p>
        )}
      </div>
    </section>
  );
}
