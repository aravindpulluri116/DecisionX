"use client";

import type { DataSourceAttribution } from "@/types/geo";

type SourceAttributionCardsProps = {
  sources: DataSourceAttribution[];
};

export function SourceAttributionCards({ sources }: SourceAttributionCardsProps) {
  if (!sources.length) return null;

  return (
    <section>
      <h3 className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-ink-muted">
        Data Sources
      </h3>
      <div className="mt-2 space-y-2">
        {sources.map((s) => (
          <div key={s.id} className="border border-hairline bg-background px-3 py-2">
            <p className="text-sm font-medium text-ink">{s.label}</p>
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-data text-[10px] text-signal hover:underline"
              >
                {s.url.replace(/^https?:\/\//, "")}
              </a>
            )}
            <p className="font-mono-data text-[9px] text-ink-muted">
              Retrieved {new Date(s.retrievedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
