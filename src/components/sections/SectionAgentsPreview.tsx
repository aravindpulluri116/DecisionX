"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { FadeContent, ShinyText } from "@/components/react-bits";
import { AgentCouncilDiagram } from "@/components/marketing/AgentCouncilDiagram";
import { AgentCard } from "@/components/marketing/AgentCard";
import { SPECIALIST_AGENTS } from "@/lib/marketing/agents";
import { MagneticButton } from "@/components/site/MagneticButton";

export function SectionAgentsPreview() {
  return (
    <section className="relative border-b border-hairline bg-background">
      <div className="mesh-bg absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-signal/5 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-28">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
          <FadeContent blur duration={800}>
            <div>
              <SectionLabel title="The council" />
              <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
                Seven agents,
                <br />
                <ShinyText
                  text="one verdict."
                  speed={3.5}
                  className="text-ink-muted"
                />
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-ink-muted">
                DecisionX runs a specialist council — economic, social, environmental, stakeholder,
                risk, and future-shock analysts — before the Chief Decision Officer synthesizes an
                executive recommendation you can defend in the room.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/agents">
                  <MagneticButton className="!px-5 !py-2.5 text-xs">
                    Meet the council
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </MagneticButton>
                </Link>
                <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  6 specialists → 1 synthesizer
                </span>
              </div>
            </div>
          </FadeContent>

          <FadeContent delay={120} duration={900}>
            <AgentCouncilDiagram />
          </FadeContent>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALIST_AGENTS.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} compact />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/agents"
            className="group inline-flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-signal"
          >
            View all agents including Chief Decision Officer
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
