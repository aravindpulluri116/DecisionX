import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DecisionX — Measure the impact before making the decision." },
      {
        name: "description",
        content:
          "DecisionX is a decision intelligence platform that predicts the economic, social, environmental, and stakeholder impact of major decisions before they are implemented.",
      },
      { property: "og:title", content: "DecisionX — Decision Intelligence Platform" },
      {
        property: "og:description",
        content: "Measure the impact before making the decision.",
      },
    ],
  }),
  component: Index,
});

function Index() {
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
