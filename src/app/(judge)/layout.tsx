import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Judge Demo — DecisionX",
  description: "Cinematic hackathon demo — measure impact before making the decision.",
};

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0A0A0B] font-sans text-white antialiased">{children}</div>;
}
