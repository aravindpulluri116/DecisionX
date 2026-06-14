"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AGENT_VISUALS } from "@/lib/workspace/agentVisuals";
import type { MarketingAgent } from "@/lib/marketing/agents";
import { cn } from "@/lib/utils";

type Props = {
  agent: MarketingAgent;
  index: number;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
};

export function AgentCard({ agent, index, selected, onSelect, compact }: Props) {
  const Icon = AGENT_VISUALS[agent.id].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        className={cn(
          "group relative h-full overflow-hidden border-hairline bg-surface shadow-elevated transition-all duration-300",
          selected && "ring-1",
          onSelect && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
          compact ? "rounded-xl" : "rounded-2xl",
        )}
        style={{
          ...(selected ? { ringColor: agent.color, boxShadow: `0 0 0 1px ${agent.color}40` } : {}),
        }}
        onClick={onSelect}
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={(e) => {
          if (onSelect && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
        />
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25"
          style={{ backgroundColor: agent.color }}
        />

        <CardContent className={cn("relative flex h-full flex-col", compact ? "p-5" : "p-7")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline bg-background transition-colors group-hover:border-transparent"
                style={{
                  boxShadow: selected ? `0 0 20px ${agent.glow}` : undefined,
                  background: selected ? `${agent.color}12` : undefined,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: agent.color }} strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Phase {String(agent.phase).padStart(2, "0")}
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {agent.shortLabel}
                </h3>
              </div>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 border-hairline font-mono-data text-[9px] uppercase tracking-[0.14em]"
              style={{ color: agent.color, borderColor: `${agent.color}55` }}
            >
              {agent.tier === "synthesizer" ? "Verdict" : "Specialist"}
            </Badge>
          </div>

          <p
            className="mt-4 font-display text-[15px] font-medium leading-snug text-ink"
            style={{ color: selected ? agent.color : undefined }}
          >
            {agent.tagline}
          </p>

          {!compact && (
            <>
              <p className="mt-3 flex-1 text-[13px] leading-[1.6] text-ink-muted">
                {agent.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {agent.outputs.map((o) => (
                  <span
                    key={o}
                    className="rounded-md border border-hairline bg-background px-2 py-1 font-mono-data text-[9px] uppercase tracking-[0.12em] text-ink-muted"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
