"use client";

import { X } from "lucide-react";
import type { EvidencePack, ExplanationTarget } from "@/types/evidence";
import { ConfidenceBadge, ConfidenceMeter } from "./ConfidenceBadge";
import { ReasoningTimeline } from "./ReasoningTimeline";
import { cn } from "@/lib/utils";

type ExplanationDrawerProps = {
  open: boolean;
  onClose: () => void;
  pack: EvidencePack | null;
  target: ExplanationTarget | null;
};

export function ExplanationDrawer({ open, onClose, pack, target }: ExplanationDrawerProps) {
  if (!open || !pack || !target) return null;

  let title = "Explanation";
  let body: React.ReactNode = null;

  if (target.type === "impact") {
    const exp = pack.impactExplanations.find((e) => e.metric === target.metric);
    if (exp) {
      title = `${exp.label} impact — ${exp.score}`;
      body = (
        <ExplanationSections
          reasoning={exp.reasoning}
          evidence={exp.evidence}
          assumptions={exp.assumptions}
          uncertainties={exp.uncertainties}
          confidence={exp.confidence}
          confidenceLevel={exp.confidenceLevel}
          agents={exp.contributingAgents.map((id) => pack.agentTransparency.find((a) => a.agentId === id)?.label ?? id)}
        />
      );
    }
  } else if (target.type === "consequence") {
    const exp = pack.consequenceExplanations.find((e) => e.nodeId === target.nodeId);
    if (exp) {
      title = exp.label;
      body = (
        <>
          {exp.causedBy && (
            <Section title="Caused by">
              <p className="text-sm text-ink">{exp.causedBy}</p>
            </Section>
          )}
          <ExplanationSections
            reasoning={exp.reason}
            evidence={exp.evidence}
            assumptions={exp.assumptions}
            uncertainties={exp.uncertainties}
            confidence={exp.confidence}
            confidenceLevel={
              exp.confidence >= 70 ? "high" : exp.confidence >= 45 ? "medium" : "low"
            }
          />
        </>
      );
    }
  } else if (target.type === "agent") {
    const agent = pack.agentTransparency.find((a) => a.agentId === target.agentId);
    if (agent) {
      title = agent.label;
      body = (
        <>
          <Section title="Findings">
            <ul className="space-y-1">
              {agent.findings.map((f) => (
                <li key={f} className="text-[11px] leading-snug text-ink-muted">
                  · {f}
                </li>
              ))}
            </ul>
          </Section>
          <ExplanationSections
            reasoning={`Impact score ${agent.impactScore}/100 from specialist analysis.`}
            evidence={agent.evidence}
            assumptions={agent.assumptions}
            uncertainties={agent.uncertainties}
            confidence={agent.confidence}
            confidenceLevel={agent.confidenceLevel}
          />
        </>
      );
    }
  } else if (target.type === "reasoning") {
    const step = pack.reasoningChain.find((s) => s.id === target.stepId);
    if (step) {
      title = step.title;
      body = (
        <>
          <Section title="Conclusion">
            <p className="text-sm leading-relaxed text-ink">{step.summary}</p>
          </Section>
          <ExplanationSections
            reasoning="This step contributed to the final decision synthesis."
            evidence={step.evidence}
            assumptions={step.assumptions}
            uncertainties={step.uncertainties}
            confidence={step.confidence}
            confidenceLevel={step.confidenceLevel}
          />
          <Section title="Reasoning chain">
            <ReasoningTimeline steps={pack.reasoningChain} activeStepId={step.id} compact />
          </Section>
        </>
      );
    }
  }

  if (!body) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close explanation"
        className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[81] flex h-full w-full max-w-md flex-col border-l border-hairline bg-surface shadow-2xl",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              Why this prediction?
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline p-1.5 text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{body}</div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-muted">{title}</p>
      {children}
    </section>
  );
}

function ExplanationSections({
  reasoning,
  evidence,
  assumptions,
  uncertainties,
  confidence,
  confidenceLevel,
  agents,
}: {
  reasoning: string;
  evidence: EvidencePack["impactExplanations"][0]["evidence"];
  assumptions: string[];
  uncertainties: string[];
  confidence: number;
  confidenceLevel: "low" | "medium" | "high";
  agents?: string[];
}) {
  return (
    <>
      <Section title="Reasoning">
        <p className="text-sm leading-relaxed text-ink">{reasoning}</p>
        {agents && agents.length > 0 && (
          <p className="mt-2 text-[11px] text-ink-muted">
            Contributing agents: {agents.join(", ")}
          </p>
        )}
      </Section>

      <Section title="Confidence">
        <ConfidenceMeter score={confidence} level={confidenceLevel} />
        <p className="mt-2 text-[10px] text-ink-muted italic">
          This is a projection, not a verified outcome.
        </p>
      </Section>

      {evidence.length > 0 && (
        <Section title="Evidence">
          <ul className="space-y-2">
            {evidence.map((e, i) => (
              <li key={i} className="rounded-lg border border-hairline bg-background/60 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-ink">{e.title}</p>
                  <ConfidenceBadge
                    level={e.confidence >= 70 ? "high" : e.confidence >= 45 ? "medium" : "low"}
                    score={e.confidence}
                    compact
                  />
                </div>
                <p className="mt-1 text-[11px] leading-snug text-ink-muted">{e.description}</p>
                <p className="mt-1 text-[10px] text-ink-muted/80">Source: {e.source}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {assumptions.length > 0 && (
        <Section title="Assumptions">
          <ul className="space-y-1">
            {assumptions.map((a) => (
              <li key={a} className="text-[11px] text-ink-muted">
                · {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {uncertainties.length > 0 && (
        <Section title="Uncertainty">
          <ul className="space-y-1">
            {uncertainties.map((u) => (
              <li key={u} className="text-[11px] text-ink-muted">
                · {u}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
