"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { STAKEHOLDER_OPTIONS } from "@/lib/constants/stakeholders";
import { cn } from "@/lib/utils";

type StakeholderPickerProps = {
  value: string[];
  onChange: (stakeholders: string[]) => void;
  disabled?: boolean;
  variant?: "light" | "dark";
  aiSuggested?: string[];
  aiRationale?: string | null;
  loading?: boolean;
  onUserEdit?: () => void;
};

export function StakeholderPicker({
  value,
  onChange,
  disabled,
  variant = "light",
  aiSuggested = [],
  aiRationale,
  loading,
  onUserEdit,
}: StakeholderPickerProps) {
  const aiSet = new Set(aiSuggested);
  const selected = value.filter((s) =>
    STAKEHOLDER_OPTIONS.includes(s as (typeof STAKEHOLDER_OPTIONS)[number]),
  );
  const unselected = STAKEHOLDER_OPTIONS.filter((name) => !value.includes(name));

  const toggle = (name: string) => {
    if (disabled || loading) return;
    onUserEdit?.();
    if (value.includes(name)) {
      onChange(value.filter((s) => s !== name));
    } else {
      onChange([...value, name]);
    }
  };

  const cardClass = (isSelected: boolean) =>
    cn(
      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
      variant === "dark"
        ? isSelected
          ? "border-signal/50 bg-signal/15 text-white"
          : "border-white/15 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/90"
        : isSelected
          ? "border-signal/40 bg-signal/10 text-ink shadow-sm"
          : "border-hairline bg-background text-ink-muted hover:border-signal/25 hover:text-ink",
      (disabled || loading) && "cursor-not-allowed opacity-50",
    );

  return (
    <div className="mt-2 space-y-4">
      {(loading || aiSuggested.length > 0) && (
        <div
          className={cn(
            "rounded-xl border px-3 py-3",
            variant === "dark" ? "border-signal/30 bg-signal/10" : "border-signal/25 bg-signal/5",
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={cn("h-3.5 w-3.5", loading ? "animate-pulse text-signal" : "text-signal")} />
            <p className="font-mono-data text-[10px] uppercase tracking-wider text-signal">
              {loading ? "AI selecting stakeholders…" : "AI suggested for this project"}
            </p>
          </div>
          {loading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-hairline/80" />
              ))}
            </div>
          ) : (
            <>
              {aiRationale && (
                <p className="mt-2 text-xs leading-snug text-ink-muted">{aiRationale}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {aiSuggested.map((name) => (
                  <span
                    key={name}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                      value.includes(name)
                        ? "border-signal/40 bg-signal/15 text-signal"
                        : "border-hairline bg-background text-ink-muted line-through opacity-60",
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selected.length > 0 && !loading && (
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
            Selected ({selected.length})
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selected.map((name) => (
              <label key={name} className={cardClass(true)}>
                <Checkbox
                  checked
                  onCheckedChange={() => toggle(name)}
                  disabled={disabled || loading}
                  aria-label={`Remove ${name}`}
                />
                <span className="flex min-w-0 flex-1 select-none items-center gap-2">
                  <span className="truncate">{name}</span>
                  {aiSet.has(name) && (
                    <span className="shrink-0 rounded bg-signal/15 px-1.5 py-0.5 font-mono-data text-[9px] uppercase text-signal">
                      AI
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {!loading && unselected.length > 0 && (
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-wider text-ink-muted">
            Add more groups
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unselected.map((name) => (
              <label key={name} className={cardClass(false)}>
                <Checkbox
                  checked={false}
                  onCheckedChange={() => toggle(name)}
                  disabled={disabled || loading}
                  aria-label={`Add ${name}`}
                />
                <span className="select-none">{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Fetches AI stakeholder suggestions when wizard step 3 context is ready. */
export function useStakeholderSuggestions(opts: {
  enabled: boolean;
  title: string;
  description: string;
  location: string;
  category: string | undefined;
  budget?: number;
  timeline?: string;
  onSuggested: (stakeholders: string[], rationale: string) => void;
}) {
  const { enabled, title, description, location, category, budget, timeline, onSuggested } = opts;
  const [loading, setLoading] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);
  const [aiSuggested, setAiSuggested] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userEditedRef = useRef(false);
  const lastKeyRef = useRef("");

  const contextKey = `${title}|${description}|${location}|${category}`;

  useEffect(() => {
    if (contextKey !== lastKeyRef.current) {
      lastKeyRef.current = contextKey;
      userEditedRef.current = false;
    }
  }, [contextKey]);

  useEffect(() => {
    if (
      !enabled ||
      !category ||
      title.trim().length < 5 ||
      description.trim().length < 30 ||
      location.trim().length < 3
    ) {
      return;
    }

    if (userEditedRef.current) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch("/api/projects/suggest-stakeholders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            category,
            budget,
            timeline,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(typeof err.error === "string" ? err.error : "Could not suggest stakeholders");
        }

        const data = (await res.json()) as { stakeholders: string[]; rationale: string };
        if (cancelled || userEditedRef.current) return;

        setAiSuggested(data.stakeholders);
        setRationale(data.rationale);
        onSuggested(data.stakeholders, data.rationale);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Suggestion failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, contextKey, category, title, description, location, budget, timeline, onSuggested]);

  const markUserEdited = () => {
    userEditedRef.current = true;
  };

  return { loading, rationale, aiSuggested, error, markUserEdited };
}
