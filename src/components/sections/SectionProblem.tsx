"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/site/SectionLabel";
import { FadeContent } from "@/components/react-bits";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    n: "73%",
    label: "of major infrastructure projects miss their stated impact targets.",
    src: "Flyvbjerg, Oxford (meta-analysis, n=2,062)",
  },
  {
    n: "₹2.4 L Cr",
    label: "in annual losses tied to second- and third-order decision effects.",
    src: "OECD Global Decisions Index, 2024",
  },
  {
    n: "1 in 6",
    label: "policy decisions are reversed within 36 months of implementation.",
    src: "DecisionX Public Sector Audit, 2025",
  },
];

export function SectionProblem() {
  return (
    <section className="relative border-b border-hairline bg-background">
      <div className="mesh-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-[1400px] px-6 py-28">
        <FadeContent blur duration={900} threshold={0.15}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <SectionLabel index="01" title="The problem" />
              <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
                Decisions are made <br />
                <span className="text-ink-muted">in the dark.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-ink-muted">
                Most consequential decisions — public infrastructure, policy, deployment — are evaluated
                with first-order intuition. Second and third-order effects emerge only after the decision
                has been made. DecisionX inverts the order.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline shadow-elevated md:grid-cols-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="h-full rounded-none border-0 bg-surface shadow-none transition-colors hover:bg-signal/[0.03]">
                    <CardContent className="flex flex-col justify-between p-7">
                      <div className="font-display text-[clamp(3rem,6vw,5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-ink transition-colors group-hover:text-signal">
                        {s.n}
                      </div>
                      <div className="mt-8">
                        <div className="h-px w-10 bg-signal" />
                        <p className="mt-3 text-[14px] leading-[1.5] text-ink">{s.label}</p>
                        <p className="mt-3 font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
                          {s.src}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}