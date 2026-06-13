import { MagneticButton } from "./MagneticButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 border border-ink" />
            <div className="absolute inset-[3px] bg-signal" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Decision<span className="text-signal">X</span>
          </span>
          <span className="ml-2 hidden font-mono-data text-[10px] uppercase tracking-[0.2em] text-ink-muted md:inline">
            v1.0 · intelligence
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {["Platform", "Scenarios", "Intelligence", "Customers", "Docs"].map((l) => (
            <a
              key={l}
              href="#"
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#" className="hidden text-sm text-ink-muted hover:text-ink md:inline">
            Sign in
          </a>
          <MagneticButton className="!px-4 !py-2 text-xs">
            Request access
            <span aria-hidden>→</span>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}