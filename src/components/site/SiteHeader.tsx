import Link from "next/link";
import { MagneticButton } from "./MagneticButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/workspace"
            className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
          >
            Platform
          </Link>
          {["Scenarios", "Intelligence", "Customers", "Docs"].map((l) => (
            <span
              key={l}
              className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted/50"
            >
              {l}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="hidden text-sm text-ink-muted hover:text-ink md:inline"
          >
            Open workspace
          </Link>
          <Link href="/workspace">
            <MagneticButton className="!px-4 !py-2 text-xs">
              Request access
              <span aria-hidden>→</span>
            </MagneticButton>
          </Link>
        </div>
      </div>
    </header>
  );
}