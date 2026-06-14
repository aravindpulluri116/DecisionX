"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { SectionLabel } from "@/components/site/SectionLabel";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { formatBudgetCrore } from "@/lib/format/currency";

export function SectionSimulator() {
  const [budget, setBudget] = useState(1200); // ₹ crore
  const [population, setPopulation] = useState(2.4); // M
  const [route, setRoute] = useState(2); // 1-4

  const results = useMemo(() => {
    const ridership = Math.round(
      (population * 0.32 + budget * 0.0008) * (1 + route * 0.05) * 1000
    );
    // CO2 is negative when ridership offsets construction emissions
    const co2 = Math.round((budget * 0.06 - ridership * 0.012) * (route === 4 ? 0.7 : 1));
    const econ = Math.round((budget * 1.85 - population * 50) * (1 + route * 0.04));
    const sentiment = Math.max(
      18,
      Math.min(
        94,
        Math.round(58 + (ridership / 1000) * 4 - Math.max(0, co2) * 0.4 - population * 3 + route * 1.5)
      )
    );
    const displacement = Math.round(
      Math.max(0, population * 8 + (route === 4 ? 22 : 0) - budget * 0.004)
    );
    return { ridership, co2, econ, sentiment, displacement };
  }, [budget, population, route]);

  const lastSentiment = useRef(results.sentiment);
  useEffect(() => {
    if (results.sentiment >= 80 && lastSentiment.current < 80) {
      toast.success("Sentiment crossed 80", { description: "Configuration above public-approval threshold." });
    } else if (results.sentiment < 50 && lastSentiment.current >= 50) {
      toast.warning("Sentiment fell below 50", { description: "Approval risk — review displacement profile." });
    }
    lastSentiment.current = results.sentiment;
  }, [results.sentiment]);

  const series = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const t = i / 23;
      return {
        x: i,
        econ: results.econ * (0.2 + t * 0.8) + Math.sin(i + budget) * 30,
        sentiment:
          Math.max(20, results.sentiment - 12) + t * 12 + Math.cos(i * 0.6) * 4,
      };
    });
  }, [results, budget]);

  return (
    <section id="simulator" className="relative border-b border-hairline bg-surface">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.55_0.12_195/0.04)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-[1400px] px-6 py-28">
        <div className="max-w-2xl">
          <SectionLabel index="04" title="Scenario simulator" />
          <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
            Move the inputs.<br />
            <span className="text-ink-muted">Watch the impact.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.6] text-ink-muted">
            A live cut from the DecisionX simulator: changing budget, target population, or route variant
            recomputes the projected impact in real time.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline shadow-[0_8px_32px_oklch(0.18_0.045_264/0.05)] lg:grid-cols-[1fr_1.6fr]">
          {/* Controls */}
          <div className="bg-surface p-8">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              ◣ scenario controls · METRO-CORRIDOR-07
            </div>

            <ControlBlock
              label="Capital budget"
              value={formatBudgetCrore(budget)}
              min={400}
              max={3200}
              step={50}
              v={budget}
              onChange={setBudget}
            />
            <ControlBlock
              label="Target population"
              value={`${population.toFixed(1)}M`}
              min={0.4}
              max={6}
              step={0.1}
              v={population}
              onChange={setPopulation}
            />
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Route variant
                </div>
                <div className="font-display text-sm font-semibold">V-{route}</div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-px overflow-hidden border border-hairline bg-hairline">
                {[1, 2, 3, 4].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoute(r)}
                    className={`py-2 text-xs transition-colors ${
                      r === route ? "bg-ink text-background" : "bg-surface hover:bg-background"
                    }`}
                  >
                    V-{r}
                  </button>
                ))}
              </div>
              <div className="mt-3 font-mono-data text-[10px] text-ink-muted">
                V-1 surface · V-2 mixed · V-3 elevated · V-4 underground
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-surface p-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-4">
              <KPI label="Ridership / day" value={results.ridership.toLocaleString()} tone="positive" />
              <KPI
                label="CO₂ Δ (kt/yr)"
                value={`${results.co2 > 0 ? "+" : ""}${results.co2}`}
                tone={results.co2 > 0 ? "negative" : "positive"}
              />
              <KPI label="Econ uplift (₹ Cr)" value={`₹${results.econ.toLocaleString("en-IN")}`} tone="positive" />
              <KPI label="Displacement (k)" value={`${results.displacement}`} tone="warning" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline md:grid-cols-[1fr_2fr]">
              <div className="bg-surface p-5">
                <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Stakeholder sentiment
                </div>
                <div className="relative mt-2 h-44">
                  <ResponsiveContainer>
                    <RadialBarChart
                      innerRadius="72%"
                      outerRadius="100%"
                      data={[{ name: "s", v: results.sentiment, fill: "var(--signal)" }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="v" background={{ fill: "var(--hairline)" }} cornerRadius={0} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-display text-3xl font-bold tabular-nums text-ink">
                      {results.sentiment}
                    </div>
                    <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      / 100
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface p-5">
                <div className="flex items-center justify-between">
                  <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Projection · 24 quarters
                  </div>
                  <div className="font-mono-data text-[10px] text-ink-muted">
                    <span className="text-signal">●</span> econ &nbsp;
                    <span className="text-positive">●</span> sentiment
                  </div>
                </div>
                <div className="mt-3 h-44">
                  <ResponsiveContainer>
                    <AreaChart data={series} margin={{ top: 6, right: 6, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="econ" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <YAxis hide />
                      <Area
                        type="monotone"
                        dataKey="econ"
                        stroke="var(--signal)"
                        strokeWidth={1.5}
                        fill="url(#econ)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sentiment"
                        stroke="var(--positive)"
                        strokeWidth={1.5}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlBlock({
  label,
  value,
  v,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  v: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between">
        <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </div>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-sm font-semibold tabular-nums"
        >
          {value}
        </motion.div>
      </div>
      <Slider
        value={[v]}
        min={min}
        max={max}
        step={step}
        onValueChange={(arr) => onChange(arr[0])}
        className="mt-3"
      />
      <div className="mt-2 flex justify-between font-mono-data text-[9px] text-ink-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "warning" | "negative";
}) {
  const color =
    tone === "positive" ? "text-positive" : tone === "warning" ? "text-warning" : "text-negative";
  return (
    <div className="bg-surface px-4 py-4">
      <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-1 font-display text-xl font-semibold tabular-nums ${color}`}
      >
        {value}
      </motion.div>
    </div>
  );
}