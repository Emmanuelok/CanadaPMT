import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AriaCopilot } from "@/components/AriaCopilot";
import { CompareProvider } from "@/components/compare/CompareContext";
import { CompareBar } from "@/components/compare/CompareBar";
import { AuroraBackground } from "@/components/motion/AuroraBackground";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

// On Vercel, resolve canonical/OG URLs to the real deployment domain.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://maplehaus.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MapleHaus — Canada's Intelligent Real Estate Platform",
    template: "%s · MapleHaus",
  },
  description:
    "MapleHaus is Canada's AI-powered real estate platform. Free, explainable home valuations, transparent bidding, verified scam-free listings, and a stress-test-aware affordability engine — built to fix what the big portals leave broken.",
  keywords: [
    "Canada real estate",
    "home valuation",
    "AI real estate",
    "mortgage affordability",
    "rental scam protection",
    "newcomer housing",
  ],
  openGraph: {
    title: "MapleHaus — Canada's Intelligent Real Estate Platform",
    description:
      "Free explainable valuations, transparent bidding, scam-free verified listings, and stress-test-aware affordability.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-screen">
        <AuroraBackground />
        <CompareProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <AriaCopilot />
          <CompareBar />
        </CompareProvider>
      </body>
    </html>
  );
}
