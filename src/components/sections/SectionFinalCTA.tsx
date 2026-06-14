"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { MagneticButton } from "@/components/site/MagneticButton";

export function SectionFinalCTA() {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-ink text-surface">
      <div className="mesh-bg-dark absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,oklch(0.52_0.22_262/0.12)_100%)]" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-signal">
            Ready to decide with confidence
          </p>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.035em]">
            Measure the impact
            <br />
            <span className="text-white/50">before you commit.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[16px] leading-[1.6] text-white/55">
            Run live Claude multi-agent analysis on your project. See economic, social, and environmental
            consequences in under 90 seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/workspace">
              <MagneticButton className="!bg-signal !text-white hover:!bg-white hover:!text-ink">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </Link>
            <MagneticButton
              variant="ghost"
              className="!border-white/20 !text-white hover:!border-white/40"
              onClick={() =>
                document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Try simulator
            </MagneticButton>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 font-mono-data text-[10px] uppercase tracking-[0.2em] text-white/30">
            <span>7 AI agents</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>OpenStreetMap geo</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>Live streaming</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
