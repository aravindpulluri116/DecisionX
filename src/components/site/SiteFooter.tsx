import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <div className="font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.85] tracking-[-0.04em]">
              Decision<span className="text-gradient-signal">X</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              Decision intelligence for governments, planners, and organizations operating under consequence.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/workspace"
                className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-surface transition-colors hover:bg-signal"
              >
                Open workspace →
              </Link>
            </div>
          </div>
          {[
            { title: "Platform", links: ["Simulator", "Report", "Intelligence", "Compare"] },
            { title: "Sectors", links: ["Public sector", "Mobility", "Energy", "Climate"] },
            { title: "Company", links: ["About", "Research", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                {col.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-ink transition-colors hover:text-signal">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-hairline pt-6 md:flex-row">
          <div className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            © 2026 DecisionX Labs · Built for consequence
          </div>
          <div className="flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-dx-pulse rounded-full bg-positive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
