import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroDecisionUniverse } from "@/components/hero/HeroDecisionUniverse";
import { SectionProblem } from "@/components/sections/SectionProblem";
import { SectionRippleEffect } from "@/components/sections/SectionRippleEffect";
import { SectionHowItWorks } from "@/components/sections/SectionHowItWorks";
import { SectionSimulator } from "@/components/sections/SectionSimulator";
import { SectionDashboardPreview } from "@/components/sections/SectionDashboardPreview";
import { SectionFinalCTA } from "@/components/sections/SectionFinalCTA";
import { Toaster } from "@/components/ui/sonner";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <HeroDecisionUniverse />
        <SectionProblem />
        <SectionRippleEffect />
        <SectionHowItWorks />
        <SectionSimulator />
        <SectionDashboardPreview />
        <SectionFinalCTA />
      </main>
      <SiteFooter />
      <Toaster position="bottom-right" />
    </div>
  );
}
