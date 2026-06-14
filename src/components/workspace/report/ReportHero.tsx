"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { extractVerdictPhrase, firstSentence } from "@/lib/workspace/report-formatters";
import { getDecisionVerdict, TONE_STYLES, truncateText } from "@/lib/workspace/impact-metrics";
import { cn } from "@/lib/utils";
import type { EvidencePack } from "@/types/evidence";
import { ReportTrustStrip } from "./ReportTrustStrip";
import { ReportViabilityGauge } from "./ReportViabilityGauge";

type ReportHeroProps = {
  title: string;
  generatedAt: string;
  viability: number | null;
  executiveSummary: string;
  trustSummary?: EvidencePack["trustSummary"] | null;
};

const VERDICT_ICONS = {
  positive: ShieldCheck,
  warning: ShieldQuestion,
  signal: ArrowRight,
  negative: ShieldAlert,
} as const;

export function ReportHero({
  title,
  generatedAt,
  viability,
  executiveSummary,
  trustSummary,
}: ReportHeroProps) {
  const verdictPhrase = extractVerdictPhrase(executiveSummary);
  const summary = truncateText(firstSentence(executiveSummary), 160);
  const verdict = viability != null ? getDecisionVerdict(viability) : null;
  const styles = verdict ? TONE_STYLES[verdict.tone] : TONE_STYLES.signal;
  const Icon = verdict ? VERDICT_ICONS[verdict.tone] : ArrowRight;

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-[0_8px_40px_oklch(0.18_0.045_264/0.06)]"
    >
      <div className="grid gap-px bg-hairline md:grid-cols-[minmax(0,220px)_1fr]">
        {viability != null && (
          <div className="flex flex-col items-center justify-center bg-surface px-4 py-6 md:py-8">
            <ReportViabilityGauge score={viability} />
            {verdict && (
              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  styles.bg,
                  styles.border,
                  styles.text,
                )}
              >
                <Icon className="h-3 w-3" />
                {verdict.label}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col justify-center bg-surface px-5 py-6 md:px-8 md:py-8">
          <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
            Decision brief ·{" "}
            {new Date(generatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-ink md:text-3xl">
            {title}
          </h1>

          {verdictPhrase && (
            <p
              className={cn(
                "mt-4 inline-flex w-fit items-center rounded-md px-2.5 py-1 font-mono-data text-[11px] font-semibold uppercase tracking-[0.12em]",
                styles.bg,
                styles.text,
              )}
            >
              {verdictPhrase}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/80 md:text-base">{summary}</p>

          {trustSummary && (
            <div className="mt-5 border-t border-hairline pt-4">
              <ReportTrustStrip trustSummary={trustSummary} compact />
            </div>
          )}
        </div>
      </div>

      <div className="relative h-px overflow-hidden bg-hairline">
        <div className="absolute inset-y-0 w-1/3 animate-dx-scan bg-gradient-to-r from-transparent via-signal to-transparent" />
      </div>
    </motion.header>
  );
}
