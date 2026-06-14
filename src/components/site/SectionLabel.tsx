type Props = { index?: string; title: string; className?: string };

export function SectionLabel({ index, title, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {index ? `${index} · ` : ""}{title}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-hairline to-transparent" />
    </div>
  );
}