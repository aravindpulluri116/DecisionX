"use client";

import { useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { decisions } from "@/lib/mock/decisions";
import { DecisionUniverseScene } from "./DecisionUniverseScene";
import { MagneticButton } from "@/components/site/MagneticButton";
import { usePrefersReducedMotion } from "@/lib/motion";

export function HeroDecisionUniverse() {
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % decisions.length), 4200);
    return () => clearInterval(id);
  }, [reduced]);

  const active = decisions[activeIdx];

  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="mesh-bg absolute inset-0" />
      <div className="dot-bg absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-signal/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-24 h-[400px] w-[400px] rounded-full bg-environmental/5 blur-3xl" />
      {/* corner brackets */}
      <div className="pointer-events-none absolute inset-x-6 top-6 flex justify-between font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        <span>◢ decision universe / live</span>
        <span>seed: {active.id.toUpperCase()} · 04 chains active</span>
      </div>

      <div className="mx-auto grid min-h-[80vh] max-w-[1400px] grid-cols-1 items-center gap-8 px-6 pt-20 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-2">
        {/* Left: copy */}
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-4 py-2 shadow-sm backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Decision intelligence platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.6rem,6.4vw,5.2rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink"
          >
            Every decision<br />
            creates <span className="text-gradient-signal">consequences</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-xl text-[17px] leading-[1.55] text-ink-muted"
          >
            DecisionX helps governments, planners, and organizations measure economic,
            social, environmental, and stakeholder impacts — before implementation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              onClick={() =>
                document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start simulation
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link href="/workspace">
              <MagneticButton variant="ghost">
                <Play className="h-3.5 w-3.5 fill-current" />
                Open workspace
              </MagneticButton>
            </Link>
          </motion.div>

          {/* live readouts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline shadow-[0_8px_32px_oklch(0.18_0.045_264/0.06)]"
          >
            {[
              { k: "Modeled chains", v: "12,408" },
              { k: "Stakeholders mapped", v: "2.4M" },
              { k: "Decision accuracy", v: "+38%" },
            ].map((s) => (
              <div key={s.k} className="group bg-surface px-4 py-4 transition-colors hover:bg-signal/5">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  {s.k}
                </div>
                <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-signal">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D canvas */}
        <div className="relative -mx-4 h-[520px] lg:mx-0 lg:h-[620px]">
          {/* HUD */}
          <div className="pointer-events-none absolute left-0 top-0 z-10">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              ◣ network graph
            </div>
            <div className="mt-2 font-mono-data text-[10px] text-ink-muted">
              NODES <span className="text-ink">16</span> · EDGES <span className="text-ink">16</span>
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 bottom-0 z-10 text-right">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              cycling scenarios
            </div>
            <div className="mt-2 flex justify-end gap-1.5">
              {decisions.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setActiveIdx(i)}
                  className={`h-1 w-6 transition-colors ${i === activeIdx ? "bg-signal" : "bg-ink/15"}`}
                  aria-label={d.title}
                />
              ))}
            </div>
          </div>

          {reduced ? (
            <StaticHeroFallback active={active} />
          ) : (
            <Canvas
              camera={{ position: [0, 1.2, 6], fov: 50 }}
              dpr={[1, 1.8]}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <DecisionUniverseScene activeId={active.id} />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>
    </section>
  );
}

function StaticHeroFallback({ active }: { active: (typeof decisions)[number] }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative h-72 w-72 rounded-full border border-hairline">
        <div className="absolute inset-8 rounded-full border border-signal/30" />
        <div className="absolute inset-16 rounded-full border border-signal/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {active.category}
            </div>
            <div className="font-display text-xl font-semibold">{active.title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}