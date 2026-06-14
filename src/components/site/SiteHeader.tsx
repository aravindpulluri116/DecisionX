"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MagneticButton } from "./MagneticButton";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-hairline bg-background/90 shadow-[0_1px_24px_oklch(0.18_0.045_264/0.06)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-105">
            <div className="absolute inset-0 border border-ink transition-colors group-hover:border-signal" />
            <div className="absolute inset-[3px] bg-signal transition-all group-hover:inset-[2px]" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Decision<span className="text-signal">X</span>
          </span>
          <span className="ml-2 hidden rounded-full border border-hairline bg-surface/80 px-2 py-0.5 font-mono-data text-[9px] uppercase tracking-[0.2em] text-ink-muted md:inline">
            v1.0
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/workspace"
            className="rounded-md px-3 py-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:bg-signal/5 hover:text-signal"
          >
            Platform
          </Link>
          <a
            href="#simulator"
            className="rounded-md px-3 py-1.5 font-mono-data text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:bg-signal/5 hover:text-ink"
          >
            Simulator
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/workspace">
            <MagneticButton className="!px-4 !py-2 text-xs">
              Open workspace
              <span aria-hidden>→</span>
            </MagneticButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
