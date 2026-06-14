import Script from "next/script";
import { MarketingThemeShell } from "@/components/site/MarketingThemeShell";
import { MARKETING_THEME_STORAGE_KEY } from "@/lib/marketing-theme";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="marketing-theme-init" strategy="beforeInteractive">
        {`(function(){try{var t=localStorage.getItem("${MARKETING_THEME_STORAGE_KEY}");window.__DX_MARKETING_THEME__=t==="light"?"light":"dark";}catch(e){window.__DX_MARKETING_THEME__="dark";}})();`}
      </Script>
      <MarketingThemeShell>{children}</MarketingThemeShell>
    </>
  );
}
