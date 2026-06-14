import Script from "next/script";
import { MarketingThemeShell } from "@/components/site/MarketingThemeShell";
import { MARKETING_THEME_STORAGE_KEY } from "@/lib/marketing-theme";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="marketing-theme-init" strategy="beforeInteractive">
        {`(function(){try{var t=localStorage.getItem("${MARKETING_THEME_STORAGE_KEY}");var d=t!=="light";window.__DX_MARKETING_THEME__=d?"dark":"light";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){window.__DX_MARKETING_THEME__="dark";document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}})();`}
      </Script>
      <MarketingThemeShell>{children}</MarketingThemeShell>
    </>
  );
}
