"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MARKETING_THEME_STORAGE_KEY,
  readMarketingTheme,
  writeMarketingTheme,
  type MarketingTheme,
} from "@/lib/marketing-theme";

type MarketingThemeContextValue = {
  theme: MarketingTheme;
  setTheme: (theme: MarketingTheme) => void;
  toggleTheme: () => void;
};

const MarketingThemeContext = createContext<MarketingThemeContextValue | null>(null);

function getInitialTheme(): MarketingTheme {
  if (typeof window === "undefined") return "dark";
  return window.__DX_MARKETING_THEME__ ?? readMarketingTheme();
}

export function MarketingThemeShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<MarketingTheme>(getInitialTheme);

  const setTheme = useCallback((next: MarketingTheme) => {
    setThemeState(next);
    writeMarketingTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <MarketingThemeContext.Provider value={value}>
      <div
        className={`min-h-screen bg-background text-ink antialiased ${theme === "dark" ? "dark" : ""}`}
        data-marketing-theme={theme}
      >
        {children}
      </div>
    </MarketingThemeContext.Provider>
  );
}

export function useMarketingTheme() {
  const ctx = useContext(MarketingThemeContext);
  if (!ctx) {
    throw new Error("useMarketingTheme must be used within MarketingThemeShell");
  }
  return ctx;
}

export { MARKETING_THEME_STORAGE_KEY };
