"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Layers, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SectionLabel } from "@/components/site/SectionLabel";
import { MagneticButton } from "@/components/site/MagneticButton";
import { BlurText, CountUp, FadeContent, ShinyText } from "@/components/react-bits";
import { Badge } from "@/components/ui/badge";
import { AgentCouncilDiagram } from "@/components/marketing/AgentCouncilDiagram";
import { AgentCard } from "@/components/marketing/AgentCard";
import { MARKETING_AGENTS, SPECIALIST_AGENTS, SYNTHESIZER_AGENT } from "@/lib/marketing/agents";
import type { AgentId } from "@/types/simulation";
import { Toaster } from "@/components/ui/sonner";

const PIPELINE = [
  {
    icon: Layers,
    title: "Parallel specialists",
    body: "Six domain agents analyze your project concurrently — each with its own schema, evidence rules, and hallucination guardrails.",
  },
  {
    icon: GitBranch,
    title: "Shared context",
    body: "Later agents read prior outputs. Location intelligence from OpenStreetMap and project metadata flow into every specialist pass.",
  },
  {
    icon: Sparkles,
    title: "Executive synthesis",
    body: "The Chief Decision Officer weighs economic, social, environmental, stakeholder, and risk signals into a single viability verdict.",
  },
] as const;

export default function AgentsPage() {
  const [selectedId, setSelectedId] = useState<AgentId>("economic");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-hairline">
          <div className="mesh-bg absolute inset-0" />
          <div className="dot-bg absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-signal/8 blur-3xl" />

          <div className="relative mx-auto max-w-[1400px] px-6 pb-20 pt-28">
            <FadeContent blur duration={900}>
              <Badge
                variant="outline"
                className="mb-6 gap-2 border-hairline bg-surface/80 px-4 py-2 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted shadow-sm backdrop-blur"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-full bg-signal opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                Multi-agent decision intelligence
              </Badge>

              <h1 className="max-w-4xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
                The agents behind
                <br />
                every{" "}
                <ShinyText text="consequence." speed={3} className="text-signal" />
              </h1>

              <BlurText
                text="Seven purpose-built AI specialists debate your project before a Chief Decision Officer delivers the verdict your leadership team needs."
                className="mt-6 max-w-2xl text-[16px] leading-[1.65] text-ink-muted"
                delay={40}
                animateBy="words"
              />

              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { label: "Specialist agents", to: 6, suffix: "" },
                  { label: "Analysis phases", to: 7, suffix: "" },
                  { label: "Evidence per run", to: 40, suffix: "+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-3xl font-bold tracking-tight text-ink">
                      <CountUp to={stat.to} duration={1.8} separator="" suffix={stat.suffix} />
                    </div>
                    <div className="mt-1 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeContent>
          </div>
        </section>

        {/* Interactive council */}
        <section className="relative border-b border-hairline bg-background">
          <div className="mesh-bg absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-[1400px] px-6 py-24">
            <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.1fr]">
              <FadeContent>
                <SectionLabel index="01" title="Council layout" />
                <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                  Hover or select
                  <br />
                  <span className="text-ink-muted">any seat.</span>
                </h2>
                <p className="mt-5 max-w-md text-[14px] leading-[1.6] text-ink-muted">
                  Each agent occupies a fixed seat in the council. Specialists report in sequence;
                  their findings feed the center — where the Chief Decision Officer renders the
                  final recommendation.
                </p>

                <div className="mt-10 space-y-4">
                  {PIPELINE.map((step, i) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.45 }}
                      className="flex gap-4 rounded-xl border border-hairline bg-surface/60 p-4 backdrop-blur-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-background">
                        <step.icon className="h-4 w-4 text-signal" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-display text-sm font-semibold text-ink">{step.title}</div>
                        <p className="mt-1 text-[13px] leading-[1.55] text-ink-muted">{step.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeContent>

              <FadeContent delay={100}>
                <AgentCouncilDiagram activeId={selectedId} onSelect={setSelectedId} />
              </FadeContent>
            </div>
          </div>
        </section>

        {/* Specialist grid */}
        <section className="relative border-b border-hairline">
          <div className="relative mx-auto max-w-[1400px] px-6 py-24">
            <FadeContent>
              <SectionLabel index="02" title="Specialist agents" />
              <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em]">
                Domain experts,
                <span className="text-ink-muted"> not generalists.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-[14px] leading-[1.6] text-ink-muted">
                Every specialist runs with a strict JSON schema, project-specific prompts, and rules
                that separate facts from predictions. Click a card to highlight its seat in the council.
              </p>
            </FadeContent>

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {SPECIALIST_AGENTS.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  selected={selectedId === agent.id}
                  onSelect={() => setSelectedId(agent.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CDO spotlight */}
        <section className="relative border-b border-hairline bg-background">
          <div className="mesh-bg absolute inset-0 opacity-35" />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${SYNTHESIZER_AGENT.glow}, transparent)`,
            }}
          />
          <div className="relative mx-auto max-w-[1400px] px-6 py-24">
            <FadeContent>
              <SectionLabel index="03" title="Chief Decision Officer" />
              <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div>
                  <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
                    The final
                    <br />
                    <ShinyText text="verdict." speed={4} className="text-signal" />
                  </h2>
                  <p className="mt-6 max-w-lg text-[15px] leading-[1.65] text-ink-muted">
                    {SYNTHESIZER_AGENT.description}
                  </p>
                  <ul className="mt-8 space-y-3">
                    {SYNTHESIZER_AGENT.outputs.map((o) => (
                      <li
                        key={o}
                        className="flex items-center gap-3 font-mono-data text-[11px] uppercase tracking-[0.14em] text-ink"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: SYNTHESIZER_AGENT.color }}
                        />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                <AgentCard
                  agent={SYNTHESIZER_AGENT}
                  index={0}
                  selected={selectedId === SYNTHESIZER_AGENT.id}
                  onSelect={() => setSelectedId(SYNTHESIZER_AGENT.id)}
                />
              </div>
            </FadeContent>
          </div>
        </section>

        {/* Full roster table */}
        <section className="relative border-b border-hairline">
          <div className="relative mx-auto max-w-[1400px] px-6 py-24">
            <FadeContent>
              <SectionLabel index="04" title="Run sequence" />
              <h2 className="mt-6 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.03em]">
                How the council convenes
              </h2>
            </FadeContent>

            <div className="mt-12 overflow-hidden rounded-2xl border border-hairline bg-hairline shadow-elevated">
              {MARKETING_AGENTS.map((agent, i) => (
                <motion.button
                  key={agent.id}
                  type="button"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedId(agent.id)}
                  className={`group flex w-full items-center gap-4 border-b border-hairline bg-surface px-6 py-5 text-left transition-colors last:border-b-0 hover:bg-signal/[0.04] ${
                    selectedId === agent.id ? "bg-signal/[0.06]" : ""
                  }`}
                >
                  <span className="w-8 font-mono-data text-[11px] text-ink-muted">
                    {String(agent.phase).padStart(2, "0")}
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="min-w-[140px] font-display text-base font-semibold text-ink">
                    {agent.label}
                  </span>
                  <span className="hidden font-mono-data text-[10px] uppercase tracking-[0.14em] text-ink-muted sm:inline">
                    {agent.role}
                  </span>
                  <span className="ml-auto hidden max-w-md text-[13px] text-ink-muted md:inline">
                    {agent.tagline}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-background">
          <div className="mesh-bg absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-[1400px] px-6 py-28 text-center">
            <FadeContent>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.03em]">
                Put the council to work
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[15px] text-ink-muted">
                Create a project, run a simulation, and watch all seven agents debate your decision
                in the workspace theater.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/workspace">
                  <MagneticButton>
                    Open workspace
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </MagneticButton>
                </Link>
                <Link
                  href="/#simulator"
                  className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-signal"
                >
                  Try the simulator →
                </Link>
              </div>
            </FadeContent>
          </div>
        </section>
      </main>
      <SiteFooter />
      <Toaster position="bottom-right" />
    </div>
  );
}
