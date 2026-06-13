type Props = { index?: string; title: string; className?: string };

export function SectionLabel({ index, title, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {index ? `${index} · ` : ""}{title}
      </span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}