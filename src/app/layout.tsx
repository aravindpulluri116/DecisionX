import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DecisionX — Measure the impact before making the decision.",
  description:
    "DecisionX is a decision intelligence platform that predicts the economic, social, environmental, and stakeholder impact of major decisions before they are implemented.",
  authors: [{ name: "DecisionX" }],
  openGraph: {
    title: "DecisionX — Decision Intelligence Platform",
    description: "Measure the impact before making the decision.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
