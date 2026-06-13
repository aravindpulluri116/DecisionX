"use client";

import type { EvolvedCitizenStory } from "@/types/timemachine";

type FutureCitizenStoriesProps = {
  stories: EvolvedCitizenStory[];
  activeYear?: number;
};

export function FutureCitizenStories({ stories, activeYear }: FutureCitizenStoriesProps) {
  if (!stories.length) return null;

  return (
    <div className="border-t border-hairline p-4">
      <p className="font-mono-data text-[10px] uppercase text-ink-muted">Future citizen stories</p>
      <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
        {stories.slice(0, 4).map((s) => {
          const beats = activeYear
            ? s.milestones.filter((m) => m.year <= activeYear)
            : s.milestones;
          return (
            <div key={s.name} className="border border-hairline p-3">
              <p className="font-medium">
                {s.name} · {s.profile}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                {beats.map((m) => (
                  <li key={m.year}>
                    <span className="font-mono-data text-signal">{m.year}:</span> {m.narrative}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
