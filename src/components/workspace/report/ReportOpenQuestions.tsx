"use client";

import { HelpCircle, Info } from "lucide-react";
import { stripFactPrefix } from "@/lib/workspace/report-formatters";
import { truncateText } from "@/lib/workspace/impact-metrics";
import { ReportPanel } from "./ReportPanel";

type ReportOpenQuestionsProps = {
  assumptions: string[];
  uncertainties: string[];
};

export function ReportOpenQuestions({ assumptions, uncertainties }: ReportOpenQuestionsProps) {
  if (!assumptions.length && !uncertainties.length) return null;

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
      {assumptions.length > 0 && (
        <ReportPanel label="Assumptions" hint={`${assumptions.length} modeled`}>
          <div className="flex flex-wrap gap-1.5">
            {assumptions.slice(0, 5).map((a) => (
              <span
                key={a}
                className="inline-flex max-w-full items-start gap-1 rounded-lg border border-hairline bg-background/60 px-2.5 py-1.5 text-[11px] leading-snug text-ink-muted"
                title={stripFactPrefix(a)}
              >
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-ink-muted/60" />
                {truncateText(stripFactPrefix(a), 64)}
              </span>
            ))}
          </div>
        </ReportPanel>
      )}

      {uncertainties.length > 0 && (
        <ReportPanel label="Open questions" hint="Needs validation">
          <div className="flex flex-wrap gap-1.5">
            {uncertainties.slice(0, 5).map((u) => (
              <span
                key={u}
                className="inline-flex max-w-full items-start gap-1 rounded-lg border border-warning/25 bg-warning/5 px-2.5 py-1.5 text-[11px] leading-snug text-ink-muted"
                title={stripFactPrefix(u)}
              >
                <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                {truncateText(stripFactPrefix(u), 64)}
              </span>
            ))}
          </div>
        </ReportPanel>
      )}
    </div>
  );
}
