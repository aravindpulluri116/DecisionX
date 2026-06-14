"use client";

import { DecisionVerdictBanner } from "../shared/DecisionVerdictBanner";
import { extractVerdictPhrase, firstSentence } from "@/lib/workspace/report-formatters";
import { cn } from "@/lib/utils";

type ReportHeroProps = {
  title: string;
  generatedAt: string;
  viability: number | null;
  executiveSummary: string;
};

export function ReportHero({ title, generatedAt, viability, executiveSummary }: ReportHeroProps) {
  const verdictPhrase = extractVerdictPhrase(executiveSummary);
  const headline = firstSentence(executiveSummary);

  return (
    <header className="space-y-5">
      <div>
        <p className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Executive brief
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 font-mono-data text-[11px] text-ink-muted">
          {new Date(generatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {viability != null && (
        <div className="space-y-3">
          <DecisionVerdictBanner score={viability} compact />
          <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
            {verdictPhrase && (
              <span
                className={cn(
                  "inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  viability >= 60
                    ? "bg-warning/15 text-warning"
                    : viability >= 45
                      ? "bg-signal/15 text-signal"
                      : "bg-negative/15 text-negative",
                )}
              >
                {verdictPhrase}
              </span>
            )}
            <p className={cn("line-clamp-4 text-sm leading-relaxed text-ink", verdictPhrase && "mt-2")}>
              {headline}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
