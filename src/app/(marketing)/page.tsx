import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroDecisionUniverse } from "@/components/hero/HeroDecisionUniverse";
import { SectionProblem } from "@/components/sections/SectionProblem";
import { SectionRippleEffect } from "@/components/sections/SectionRippleEffect";
import { SectionHowItWorks } from "@/components/sections/SectionHowItWorks";
import { SectionSimulator } from "@/components/sections/SectionSimulator";
import { SectionDashboardPreview } from "@/components/sections/SectionDashboardPreview";
import { SectionMapPreview } from "@/components/sections/SectionMapPreview";
import { Toaster } from "@/components/ui/sonner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />
      <main>
        <HeroDecisionUniverse />
        <SectionProblem />
        <SectionRippleEffect />
        <SectionHowItWorks />
        <SectionSimulator />
        <SectionDashboardPreview />
        <SectionMapPreview />
      </main>
      <SiteFooter />
      <Toaster position="bottom-right" />
    </div>
  );
}
