import { motion } from "framer-motion";
import { SectionLabel } from "@/components/site/SectionLabel";

const steps = [
  {
    n: "01",
    t: "Input",
    d: "Define the decision: scope, geography, budget, target population. Pull from your own data or DecisionX baselines.",
  },
  {
    n: "02",
    t: "Simulation",
    d: "Run thousands of forward simulations across economic, social, and environmental models — calibrated on historical analogs.",
  },
  {
    n: "03",
    t: "Impact Modeling",
    d: "Quantify first, second, and third-order effects with confidence intervals and time horizons up to 30 years.",
  },
  {
    n: "04",
    t: "Stakeholder Analysis",
    d: "Surface who wins, who loses, and by how much — broken down by cohort, district, and political weight.",
  },
  {
    n: "05",
    t: "Decision Intelligence",
    d: "Deliver a recommendation packet your board, council, or cabinet can act on — with audit trail and assumptions.",
  },
];

export function SectionHowItWorks() {
  return (
    <section className="border-b border-hairline bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-28">
        <div className="max-w-2xl">
          <SectionLabel index="03" title="How DecisionX works" />
          <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
            Five stages,<br />
            <span className="text-ink-muted">one decision packet.</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col bg-surface p-6"
            >
              <div className="absolute left-0 top-0 h-px w-0 bg-signal transition-all duration-700 group-hover:w-full" />
              <div className="flex items-center justify-between">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  STAGE {s.n}
                </div>
                {i < steps.length - 1 && (
                  <span className="text-ink-muted opacity-40">→</span>
                )}
              </div>
              <div className="mt-12 font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">
                {s.t}
              </div>
              <p className="mt-3 text-[13px] leading-[1.55] text-ink-muted">{s.d}</p>
              <MiniViz i={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniViz({ i }: { i: number }) {
  return (
    <div className="mt-8 h-12 w-full border-t border-hairline pt-3">
      <div className="flex h-full items-end gap-[3px]">
        {Array.from({ length: 18 }).map((_, k) => {
          const seed = (k * 7 + i * 13) % 11;
          const h = 20 + seed * 6;
          const active = k <= (i + 1) * 3;
          return (
            <div
              key={k}
              className={`flex-1 transition-colors ${active ? "bg-ink" : "bg-ink/12"}`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}