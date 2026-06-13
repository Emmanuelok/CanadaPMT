import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  ScanSearch,
  ShieldCheck,
  Calculator,
  Globe2,
  Network,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Languages,
  Lock,
} from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { AriaButton } from "@/components/AriaButton";

export const metadata: Metadata = {
  title: "Why MapleHaus",
  description:
    "MapleHaus is built around the unsolved problems in Canadian real estate: hidden sold prices, blind bidding, rental fraud, the stress-test maze, newcomer barriers and fragmented data.",
};

const PROBLEMS = [
  {
    icon: Eye,
    problem: "Sold prices stay hidden",
    research:
      "It took a multi-year Competition Bureau fight just to force sold data into the open — and even now, most Canadians can't freely see what a home actually sold for, or a credible estimate of value.",
    solution: "TrueValue AI publishes a free, explainable estimate, a confidence band, comparables and full price history on every listing.",
    href: "/valuation",
    cta: "Try TrueValue",
  },
  {
    icon: ScanSearch,
    problem: "Buyers are forced to bid blind",
    research:
      "\"Blind bidding\" hides every competing offer. Buyers routinely overpay out of fear, and the lack of transparency is one of the most-cited consumer complaints in Canadian real estate.",
    solution: "OfferIQ gives sellers an opt-in transparent-bidding mode — buyers see anonymised offer activity and get an AI-recommended offer instead of guessing.",
    href: "#offeriq",
    cta: "How OfferIQ works",
  },
  {
    icon: ShieldCheck,
    problem: "Rental fraud preys on the vulnerable",
    research:
      "Reports of rental scams have surged, and they disproportionately hit newcomers and students — fake listings, cloned photos and deposit theft by \"landlords\" who are overseas.",
    solution: "ScamShield scores every listing on identity, land-registry ownership, photo authenticity and price sanity — and flags duplicates across platforms.",
    href: "/newcomers",
    cta: "See ScamShield",
  },
  {
    icon: Calculator,
    problem: "Affordability is a maze",
    research:
      "The B-20 stress test, CMHC insurance, land-transfer taxes that differ by province and city, and a patchwork of first-time-buyer programs make it genuinely hard to know what you qualify for.",
    solution: "AffordIQ qualifies you the way a lender does and ties the result directly to real listings — no more guessing.",
    href: "/affordability",
    cta: "Open AffordIQ",
  },
  {
    icon: Globe2,
    problem: "Newcomers are locked out",
    research:
      "Canada welcomes hundreds of thousands of newcomers a year, yet the system assumes a Canadian credit history and local references most simply don't have yet.",
    solution: "The Newcomer Pathway surfaces newcomer-friendly listings and lenders, explains every step bilingually, and protects against the scams that target new arrivals.",
    href: "/newcomers",
    cta: "Newcomer Pathway",
  },
  {
    icon: Network,
    problem: "Data is fragmented & oversight is thin",
    research:
      "Listings, sold data, school and transit info, climate risk and agent track records live in a dozen silos — and provincial regulators have been criticised for weak consumer protection.",
    solution: "Neighbourhood IQ unifies the signals that matter, and our agent network publishes verified licences and real, comparable performance data.",
    href: "/agents",
    cta: "Meet the network",
  },
];

const VALUES = [
  { icon: Languages, title: "Bilingual by default", body: "English and French throughout, with the provincial nuance Canadian real estate demands — including Quebec's notarial process." },
  { icon: Lock, title: "Transparency over gatekeeping", body: "No paywalls on the data that matters. If it helps you make a smarter decision, it's free and it's explainable." },
  { icon: Leaf, title: "Canada-first", body: "Built for Canadian rules, taxes, programs and communities — not a US platform with a maple leaf bolted on." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 py-16 text-white">
        <div className="mh-container">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
            <Leaf className="h-3.5 w-3.5" /> Our mission
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            We&apos;re rebuilding Canadian real estate around transparency.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/90">
            We studied the gaps the big Canadian portals leave open — then built an AI platform whose entire purpose is
            to close them. Here&apos;s what we found, and what we did about it.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mh-container">
          <SectionHeading eyebrow="The critical niche" title="Six unsolved problems — and our answer to each" />
          <div className="mt-10 space-y-5">
            {PROBLEMS.map((p) => (
              <div
                key={p.problem}
                id={p.problem.includes("blind") ? "offeriq" : undefined}
                className="scroll-mt-24 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft md:p-8"
              >
                <div className="grid gap-6 md:grid-cols-[auto_1fr_1fr] md:items-start">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-maple-50 text-maple-600">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink-900">{p.problem}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.research}</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50/60 p-5">
                    <p className="flex items-start gap-2 text-sm font-semibold text-brand-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      What we built
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.solution}</p>
                    <Link href={p.href} className="mh-link mt-3 inline-flex items-center gap-1 text-sm">
                      {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OfferIQ deep dive */}
      <section id="offeriq-detail" className="bg-ink-50/50 py-16">
        <div className="mh-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="mh-eyebrow">
              <ScanSearch className="h-3.5 w-3.5" /> OfferIQ
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900">
              Ending blind bidding, one transparent offer at a time
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              In most Canadian provinces, you&apos;re not allowed to know the details of competing offers on a home.
              You bid in the dark, anxious about overpaying — and the system quietly favours rising prices.
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              OfferIQ flips that. On listings where the seller opts in, every buyer sees the same anonymised picture:
              how many offers are in, the range, and how yours compares. Then our AI recommends an offer grounded in
              TrueValue, comparable sales and live demand — so you compete on information, not fear.
            </p>
            <Link href="/search?type=sale&offeriq=1" className="mh-btn-primary mt-6">
              Browse OfferIQ listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "See the number and range of competing offers in near real-time",
              "Get an AI-recommended offer anchored to TrueValue and comparables",
              "Understand the trade-off between price, conditions and closing date",
              "A fairer, faster process for buyers and sellers alike",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <p className="text-sm text-ink-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="mh-container">
          <SectionHeading align="center" eyebrow="What we stand for" title="Built for Canada, on principle" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mh-container">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-center text-white shadow-lift">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold">
              Ready to see Canadian real estate without the blind spots?
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/search?type=sale" className="mh-btn-primary bg-white text-brand-800 hover:bg-brand-50">
                Start exploring <ArrowRight className="h-4 w-4" />
              </Link>
              <AriaButton className="mh-btn-ghost border-white/30 bg-white/10 text-white hover:border-white/60 hover:text-white">
                Ask Aria a question
              </AriaButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
