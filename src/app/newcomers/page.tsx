import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe2,
  ShieldCheck,
  CreditCard,
  Home,
  Compass,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { properties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeading } from "@/components/ui";
import { AriaButton } from "@/components/AriaButton";

export const metadata: Metadata = {
  title: "Newcomer Pathway — housing for new Canadians",
  description:
    "A guided, scam-safe path to renting and buying in Canada with no local credit history — built for newcomers, students and work-permit holders.",
};

const CHALLENGES = [
  { icon: CreditCard, title: "No Canadian credit history", body: "Landlords and lenders lean on credit scores you haven't had time to build. We surface newcomer-friendly listings and lenders that accept alternative credit and guarantors." },
  { icon: ShieldCheck, title: "You're the #1 scam target", body: "Fraudsters deliberately target newcomers with fake listings and deposit theft. ScamShield scores every listing so you don't pay for a home that doesn't exist." },
  { icon: Globe2, title: "An unfamiliar system", body: "Provincial rules, the stress test, CMHC, notaries in Quebec — it's a lot. Aria explains every step in plain language, in English or French." },
];

const STEPS = [
  { icon: Compass, n: "01", title: "Get oriented", body: "Tell Aria your city, budget and timeline. Get a plain-language map of how renting and buying actually work in your province." },
  { icon: ShieldCheck, n: "02", title: "Find a safe rental", body: "Filter for newcomer-friendly listings and let ScamShield verify the landlord and flag any red flags before you transfer a cent." },
  { icon: CreditCard, n: "03", title: "Build Canadian credit", body: "Set up the accounts and on-time payments that build a credit file fast — the foundation for your first mortgage." },
  { icon: Home, n: "04", title: "Get mortgage-ready", body: "Use AffordIQ to see what you can afford, and match with lenders that offer newcomer mortgage programs (even on a work permit)." },
  { icon: KeyRound, n: "05", title: "Buy your first home", body: "Pair with a newcomer-specialist agent, make a confident offer with OfferIQ, and close with a bilingual team in your corner." },
];

const RED_FLAGS = [
  "You're asked to e-transfer a deposit before viewing the unit",
  "The \"landlord\" is overseas and can't show you the place",
  "The rent is far below similar listings in the area",
  "You're pressured to decide \"today\" or lose it",
  "The same photos appear on other sites under different names",
];

export default function NewcomersPage() {
  const friendly = properties.filter((p) => p.newcomerFriendly).slice(0, 6);

  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-violet-700 via-brand-800 to-brand-950 py-16 text-white">
        <div className="mh-container">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-100">
            <Globe2 className="h-3.5 w-3.5" /> Newcomer Pathway
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            New to Canada? Your home journey, de-risked.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/90">
            No Canadian credit history shouldn&apos;t mean no home — and it should never mean falling for a scam.
            MapleHaus is the first platform built around the newcomer experience, in English and French.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search?type=rent&newcomer=1" className="mh-btn-primary bg-white text-brand-800 hover:bg-brand-50">
              Browse newcomer-friendly rentals <ArrowRight className="h-4 w-4" />
            </Link>
            <AriaButton className="mh-btn-ghost border-white/30 bg-white/10 text-white hover:border-white/60 hover:text-white">
              Ask Aria where to start
            </AriaButton>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16">
        <div className="mh-container">
          <SectionHeading
            eyebrow="What makes it hard"
            title="The three barriers newcomers actually hit"
            description="We built a tool for each one."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CHALLENGES.map((c) => (
              <div key={c.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pathway */}
      <section className="bg-ink-50/50 py-16">
        <div className="mh-container">
          <SectionHeading eyebrow="The pathway" title="Five steps from landing to keys" />
          <div className="mt-10 grid gap-5 lg:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl font-extrabold text-ink-200">{s.n}</span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section className="py-16">
        <div className="mh-container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="rounded-3xl border border-maple-200 bg-maple-50/50 p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-maple-100 text-maple-600">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Rental scam red flags</h2>
            <p className="mt-2 text-sm text-ink-600">If you see any of these, stop. ScamShield flags them automatically — but trust your gut too.</p>
            <ul className="mt-5 space-y-2.5">
              {RED_FLAGS.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-maple-600" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink-900">How ScamShield protects you</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Verifies the lister's identity before a listing goes live",
                "Cross-checks ownership against the public land registry",
                "Runs reverse-image search to catch cloned photos",
                "Compares the price to real market data for the area",
                "Flags any unit appearing on multiple sites under different contacts",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/search?type=rent&newcomer=1" className="mh-btn-primary mt-6">
              See verified newcomer-friendly rentals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Listings */}
      {friendly.length > 0 && (
        <section className="bg-ink-50/50 py-16">
          <div className="mh-container">
            <SectionHeading eyebrow="Newcomer-friendly" title="Homes that accept guarantors & alternative credit" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {friendly.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
