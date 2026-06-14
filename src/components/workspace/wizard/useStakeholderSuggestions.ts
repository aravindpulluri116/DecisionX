"use client";

import { useEffect, useRef, useState } from "react";

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
  const onSuggestedRef = useRef(onSuggested);

  useEffect(() => {
    onSuggestedRef.current = onSuggested;
  }, [onSuggested]);

  const contextKey = `${title}|${description}|${location}|${category}`;

  useEffect(() => {
    if (contextKey !== lastKeyRef.current) {
      lastKeyRef.current = contextKey;
      userEditedRef.current = false;
    }
  }, [contextKey]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (
      !category ||
      title.trim().length < 5 ||
      description.trim().length < 30 ||
      location.trim().length < 3
    ) {
      setLoading(false);
      return;
    }

    if (userEditedRef.current) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

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
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(typeof err.error === "string" ? err.error : "Could not suggest stakeholders");
        }

        const data = (await res.json()) as { stakeholders: string[]; rationale: string };
        if (cancelled || userEditedRef.current) return;

        setAiSuggested(data.stakeholders);
        setRationale(data.rationale);
        onSuggestedRef.current(data.stakeholders, data.rationale);
      } catch (e) {
        if (!cancelled) {
          if (e instanceof DOMException && e.name === "AbortError") {
            setError("Suggestion timed out — pick council members manually");
          } else {
            setError(e instanceof Error ? e.message : "Suggestion failed");
          }
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [enabled, contextKey, category, title, description, location, budget, timeline]);

  const markUserEdited = () => {
    userEditedRef.current = true;
    setLoading(false);
  };

  return { loading, rationale, aiSuggested, error, markUserEdited };
}
