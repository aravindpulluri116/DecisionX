export type MarketingTheme = "light" | "dark";

export const MARKETING_THEME_STORAGE_KEY = "dx-marketing-theme";

export function readMarketingTheme(): MarketingTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(MARKETING_THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function writeMarketingTheme(theme: MarketingTheme) {
  try {
    localStorage.setItem(MARKETING_THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
  window.__DX_MARKETING_THEME__ = theme;
}

declare global {
  interface Window {
    __DX_MARKETING_THEME__?: MarketingTheme;
  }
}
