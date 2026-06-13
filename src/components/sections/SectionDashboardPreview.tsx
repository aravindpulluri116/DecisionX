"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  Cell,
} from "recharts";
import { SectionLabel } from "@/components/site/SectionLabel";

const sentimentData = [
  { name: "Residents", v: 64 },
  { name: "Commuters", v: 81 },
  { name: "Business", v: 73 },
  { name: "Env. NGOs", v: 41 },
  { name: "Workers", v: 56 },
];

const envData = Array.from({ length: 24 }).map((_, i) => ({
  x: i,
  v: 50 + Math.sin(i * 0.5) * 18 + i * 0.4,
}));

const decisionLog = [
  { id: "DX-2207", t: "Metro Phase II approved", tone: "positive", time: "14:02" },
  { id: "DX-2208", t: "Zone-B reclassification queued", tone: "warning", time: "14:11" },
  { id: "DX-2209", t: "Fare hike — sentiment alert", tone: "negative", time: "14:34" },
  { id: "DX-2210", t: "Highway-7 simulation v3", tone: "neutral", time: "14:48" },
  { id: "DX-2211", t: "Industrial corridor draft", tone: "neutral", time: "15:02" },
];

const stakeholders = [
  { x: 2, y: 8, r: 22, label: "Transit Auth" },
  { x: 7, y: 6, r: 18, label: "City Council" },
  { x: 5, y: 2, r: 14, label: "Climate Bd" },
  { x: 8, y: 3, r: 11, label: "Chamber" },
  { x: 3, y: 4, r: 9, label: "Residents" },
];

export function SectionDashboardPreview() {
  return (
    <section className="border-b border-hairline bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-28">
        <div className="max-w-2xl">
          <SectionLabel index="05" title="Intelligence wall" />
          <h2 className="mt-6 font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em]">
            One surface.<br />
            <span className="text-ink-muted">Every consequence.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 overflow-hidden border border-hairline bg-surface"
        >
          {/* HUD bar */}
          <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
            <div className="flex items-center gap-4 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              <span className="text-signal">◆</span>
              <span>DECISION CANVAS / METRO-CORRIDOR-07</span>
              <span>·</span>
              <span>OWNER: planning_ops</span>
              <span>·</span>
              <span>HORIZON 2026–2046</span>
            </div>
            <div className="flex items-center gap-3 font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                Live
              </span>
              <span>14:51:08 UTC</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-px bg-hairline">
            {/* Economic gauge */}
            <Panel className="col-span-12 md:col-span-3" label="Economic uplift">
              <div className="relative h-44">
                <ResponsiveContainer>
                  <RadialBarChart
                    innerRadius="68%"
                    outerRadius="100%"
                    data={[{ name: "v", v: 78, fill: "var(--signal)" }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="v" background={{ fill: "var(--hairline)" }} cornerRadius={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-display text-3xl font-bold">+$1.9B</div>
                  <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    20-YR NPV
                  </div>
                </div>
              </div>
            </Panel>

            {/* Sentiment bars */}
            <Panel className="col-span-12 md:col-span-5" label="Stakeholder sentiment">
              <div className="h-44">
                <ResponsiveContainer>
                  <BarChart data={sentimentData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--ink-muted)", fontFamily: "JetBrains Mono" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="v" radius={0}>
                      {sentimentData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            d.v >= 70
                              ? "var(--positive)"
                              : d.v >= 50
                                ? "var(--signal)"
                                : "var(--warning)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Env sparkline */}
            <Panel className="col-span-12 md:col-span-4" label="Environmental delta">
              <div className="h-44">
                <ResponsiveContainer>
                  <LineChart data={envData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="var(--ink)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-2xl font-bold text-warning">+4.8%</span>
                <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  AQI variance vs. baseline
                </span>
              </div>
            </Panel>

            {/* Stakeholder matrix */}
            <Panel className="col-span-12 md:col-span-5" label="Stakeholder power × interest">
              <div className="relative h-56 w-full">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  <line x1="0" y1="50" x2="100" y2="50" stroke="var(--hairline)" strokeDasharray="2 2" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="var(--hairline)" strokeDasharray="2 2" />
                  {stakeholders.map((s, i) => (
                    <g key={i}>
                      <circle
                        cx={s.x * 10}
                        cy={100 - s.y * 10}
                        r={s.r / 4}
                        fill="var(--signal)"
                        opacity={0.2}
                      />
                      <circle cx={s.x * 10} cy={100 - s.y * 10} r={1.5} fill="var(--ink)" />
                      <text
                        x={s.x * 10 + 3}
                        y={100 - s.y * 10 - 3}
                        fontSize="3"
                        fontFamily="JetBrains Mono"
                        fill="var(--ink-muted)"
                      >
                        {s.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="absolute bottom-1 left-1 font-mono-data text-[9px] uppercase tracking-[0.18em] text-ink-muted">
                  ← interest →
                </div>
                <div className="absolute top-1 left-1 origin-top-left rotate-90 font-mono-data text-[9px] uppercase tracking-[0.18em] text-ink-muted">
                  power
                </div>
              </div>
            </Panel>

            {/* Decision log */}
            <Panel className="col-span-12 md:col-span-7" label="Decision log">
              <div className="divide-y divide-hairline">
                {decisionLog.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 py-2.5 text-sm">
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      {d.id}
                    </span>
                    <span className="flex-1">{d.t}</span>
                    <span
                      className={`font-mono-data text-[10px] uppercase tracking-[0.18em] ${
                        d.tone === "positive"
                          ? "text-positive"
                          : d.tone === "warning"
                            ? "text-warning"
                            : d.tone === "negative"
                              ? "text-negative"
                              : "text-ink-muted"
                      }`}
                    >
                      ● {d.tone}
                    </span>
                    <span className="font-mono-data text-[10px] text-ink-muted">{d.time}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* scan bar */}
          <div className="relative h-px overflow-hidden bg-hairline">
            <div className="absolute inset-y-0 w-1/3 animate-dx-scan bg-gradient-to-r from-transparent via-signal to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Panel({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={`bg-surface p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          ◣ {label}
        </div>
        <div className="font-mono-data text-[9px] text-ink-muted">▲ ▼</div>
      </div>
      {children}
    </div>
  );
}