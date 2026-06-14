"use client";

import { Moon, Sun } from "lucide-react";
import { useMarketingTheme } from "./MarketingThemeShell";

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="relative flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface/80 text-ink-muted transition-colors hover:border-signal/30 hover:bg-signal/5 hover:text-ink"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden
      />
    </button>
  );
}
