"use client";

import { HelpCircle, Info } from "lucide-react";
import { stripFactPrefix } from "@/lib/workspace/report-formatters";

type ReportOpenQuestionsProps = {
  assumptions: string[];
  uncertainties: string[];
};

export function ReportOpenQuestions({ assumptions, uncertainties }: ReportOpenQuestionsProps) {
  if (!assumptions.length && !uncertainties.length) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {assumptions.length > 0 && (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-ink-muted" />
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">What we assumed</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {assumptions.slice(0, 3).map((a) => (
              <li key={a} className="text-xs leading-snug text-ink-muted">
                {stripFactPrefix(a)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {uncertainties.length > 0 && (
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-warning" />
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-warning">Still unknown</h3>
          </div>
          <ul className="mt-3 space-y-2">
            {uncertainties.slice(0, 3).map((u) => (
              <li key={u} className="text-xs leading-snug text-ink-muted">
                {stripFactPrefix(u)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
