import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Eye,
  ShieldCheck,
  Calculator,
  Globe2,
  MapPinned,
  LineChart,
  ScanSearch,
  CheckCircle2,
  TrendingUp,
  BadgeCheck,
  Languages,
  Lock,
} from "lucide-react";
import { HeroSearch } from "@/components/HeroSearch";
import { AriaButton } from "@/components/AriaButton";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeading, ScoreBar, Pill } from "@/components/ui";
import { properties, propertyById } from "@/lib/data/properties";
import { neighbourhoods } from "@/lib/data/neighbourhoods";
import { valueProperty } from "@/lib/valuation";
import { formatCAD, formatCADCompact, formatPercent } from "@/lib/format";

const PAIN_POINTS = [
  {
    icon: Eye,
    problem: "Sold prices stay hidden",
    body: "Across most of Canada you still can't freely see what a home actually sold for — the single most important number for any buyer or seller.",
    solution: "TrueValue AI shows full price history & a free, explainable estimate.",
    href: "/valuation",
  },
  {
    icon: ScanSearch,
    problem: "You're forced to bid blind",
    body: "\"Blind bidding\" hides every competing offer, inflating prices and leaving buyers to guess in the dark on the biggest purchase of their lives.",
    solution: "OfferIQ surfaces anonymised offer activity & an AI offer strategy.",
    href: "/about",
  },
  {
    icon: ShieldCheck,
    problem: "Rental scams prey on newcomers",
    body: "Fake listings and deposit theft disproportionately target newcomers and students — the people least able to absorb the loss.",
    solution: "ScamShield verifies landlords and scores every listing for fraud.",
    href: "/newcomers",
  },
  {
    icon: Calculator,
    problem: "Affordability is a black box",
    body: "Most calculators ignore the B-20 stress test, CMHC insurance and land-transfer tax — so the number you get isn't the number a lender will.",
    solution: "AffordIQ qualifies you exactly the way a Canadian lender does.",
    href: "/affordability",
  },
];

const AI_TOOLS = [
  { icon: LineChart, name: "TrueValue AI", desc: "Free, explainable home valuations with comparables, a confidence band and full price history.", href: "/valuation", tone: "brand" as const },
  { icon: ScanSearch, name: "OfferIQ", desc: "Transparent bidding — see offer activity and get an AI-recommended offer instead of bidding blind.", href: "/about", tone: "brand" as const },
  { icon: ShieldCheck, name: "ScamShield", desc: "Every listing scored on identity, ownership, photo authenticity and price sanity to stop rental fraud.", href: "/newcomers", tone: "maple" as const },
  { icon: Calculator, name: "AffordIQ", desc: "Stress-test-aware affordability with CMHC, land-transfer tax and first-time-buyer rebates built in.", href: "/affordability", tone: "brand" as const },
  { icon: Globe2, name: "Newcomer Pathway", desc: "A guided journey for thin credit files and no Canadian history, from first rental to first purchase.", href: "/newcomers", tone: "violet" as const },
  { icon: MapPinned, name: "Neighbourhood IQ", desc: "Schools, transit, safety, walkability, growth and climate resilience — unified, not siloed.", href: "/search?type=sale", tone: "brand" as const },
];

const STEPS = [
  { n: "01", title: "Search in plain language", body: "Tell Aria what you want — \"3-bed under $900k near transit in Mississauga\" — or use map search." },
  { n: "02", title: "See the truth on every listing", body: "Each home shows a TrueValue estimate, price history, ScamShield trust score and real affordability." },
  { n: "03", title: "Move with confidence", body: "Get an AI offer strategy, match with a vetted agent, and qualify the way a lender actually will." },
];

export default function HomePage() {
  const hero = propertyById("p-portcredit-condo")!;
  const heroValuation = valueProperty(hero);
  const featured = properties.filter((p) => p.featured).slice(0, 6);
  const topNbhds = [...neighbourhoods].sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white">
        <div className="absolute inset-0 mh-grid-bg opacity-40" />
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-28 left-6 h-80 w-80 rounded-full bg-maple-500/10 blur-3xl" />

        <div className="mh-container relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered · Coast to coast
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
              The <span className="text-brand-300">intelligent</span> way to buy, rent &amp; value a home in Canada.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-50/90">
              MapleHaus brings radical transparency to Canadian real estate — free explainable valuations,
              fraud-checked listings, transparent bidding, and affordability that respects the stress test.
            </p>

            <div className="mt-8 max-w-2xl">
              <HeroSearch />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-50/90">
              {[
                { icon: LineChart, label: "Free sold-price history" },
                { icon: Lock, label: "Fraud-checked listings" },
                { icon: Languages, label: "Bilingual EN · FR" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-brand-300" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Showcase cards */}
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="rounded-3xl border border-white/10 bg-white p-5 text-ink-900 shadow-lift">
              <div className="flex items-center justify-between">
                <span className="mh-eyebrow">
                  <LineChart className="h-3.5 w-3.5" /> TrueValue AI
                </span>
                <Pill tone="brand">{heroValuation.confidence}% confidence</Pill>
              </div>
              <p className="mt-4 text-sm text-ink-500">Estimated value · {hero.address.city}</p>
              <p className="font-display text-4xl font-extrabold text-ink-900">{formatCAD(heroValuation.estimate)}</p>
              <p className="mt-1 text-sm text-ink-500">
                Range {formatCADCompact(heroValuation.low)}–{formatCADCompact(heroValuation.high)} · listed at{" "}
                {formatCAD(hero.price)}
                <span className={heroValuation.askingDelta > 0 ? "ml-1 text-maple-600" : "ml-1 text-brand-600"}>
                  ({heroValuation.askingDelta > 0 ? "+" : ""}
                  {heroValuation.askingDelta}% vs AI)
                </span>
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {heroValuation.drivers.slice(0, 3).map((d) => (
                  <div key={d.label} className="rounded-xl bg-ink-50 p-2">
                    <p className="line-clamp-2 text-[11px] leading-tight text-ink-500">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 w-64 rotate-[-3deg] rounded-2xl border border-white/10 bg-white p-4 text-ink-900 shadow-lift">
              <span className="mh-eyebrow">
                <ShieldCheck className="h-3.5 w-3.5" /> ScamShield
              </span>
              <p className="mt-2 text-sm font-semibold text-ink-900">Listing verified</p>
              <p className="text-xs text-ink-500">Identity, ownership & photos checked · no duplicates found.</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-700">
                <CheckCircle2 className="h-4 w-4" /> Trust score 96/100
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────────────────── */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mh-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { value: "12", label: "cities, coast to coast" },
            { value: "100%", label: "listings show sold-price history" },
            { value: "Every", label: "rental scored for fraud" },
            { value: "EN · FR", label: "fully bilingual" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-brand-700">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain points / niche ──────────────────────────────────────────── */}
      <section className="bg-ink-50/50 py-20">
        <div className="mh-container">
          <SectionHeading
            align="center"
            eyebrow="Our critical niche"
            title="Built to fix what Canadian real estate won't"
            description="We researched the gaps the big portals leave open — then built an AI platform around solving exactly those problems."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {PAIN_POINTS.map((p) => (
              <div key={p.problem} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-maple-50 text-maple-600">
                  <p.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900">{p.problem}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{p.body}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-brand-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {p.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI tools ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mh-container">
          <SectionHeading
            eyebrow="One intelligent platform"
            title="Seven AI tools, one home journey"
            description="Each tool targets a real Canadian pain point — and they work together, orchestrated by Aria, your AI copilot."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <span
                  className={
                    tool.tone === "maple"
                      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-maple-50 text-maple-600"
                      : tool.tone === "violet"
                        ? "flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                        : "flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
                  }
                >
                  <tool.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{tool.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{tool.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
            {/* Aria CTA card */}
            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Meet Aria</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-50/90">
                  Your AI copilot ties it all together — search, value, qualify and verify in one conversation.
                </p>
              </div>
              <AriaButton className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-50">
                <Sparkles className="h-4 w-4" /> Chat with Aria
              </AriaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured listings ────────────────────────────────────────────── */}
      <section className="bg-ink-50/50 py-20">
        <div className="mh-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Live sample listings" title="Featured homes across Canada" />
            <Link href="/search?type=sale" className="mh-btn-ghost">
              Browse all listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Neighbourhood intelligence ───────────────────────────────────── */}
      <section className="py-20">
        <div className="mh-container">
          <SectionHeading
            eyebrow="Neighbourhood IQ"
            title="Know the neighbourhood before you commit"
            description="Schools, transit, safety, walkability, growth momentum and climate resilience — scored and unified for every area."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {topNbhds.map((nb) => (
              <Link
                key={nb.id}
                href={`/search?type=sale&q=${encodeURIComponent(nb.city)}`}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink-900">{nb.name}</h3>
                    <p className="text-sm text-ink-500">
                      {nb.city}, {nb.province}
                    </p>
                  </div>
                  <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <span className="font-display text-lg font-extrabold leading-none">{nb.scores.overall}</span>
                    <span className="text-[9px] font-semibold uppercase">score</span>
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-ink-500">Median</span>
                  <span className="font-semibold text-ink-900">{formatCADCompact(nb.medianPrice)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-500">12-mo change</span>
                  <span className={`flex items-center gap-1 font-semibold ${nb.priceYoY >= 0 ? "text-brand-600" : "text-maple-600"}`}>
                    <TrendingUp className="h-3.5 w-3.5" /> {formatPercent(nb.priceYoY)}
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <ScoreBar label="Transit" value={nb.scores.transit} />
                  <ScoreBar label="Walkability" value={nb.scores.walkability} />
                  <ScoreBar label="Climate resilience" value={nb.scores.climateResilience} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 py-20 text-white">
        <div className="mh-container">
          <SectionHeading
            align="center"
            eyebrow="How MapleHaus works"
            title={<span className="text-white">Three steps to a confident move</span>}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="font-display text-4xl font-extrabold text-brand-300">{s.n}</p>
                <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-50/85">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/search?type=sale" className="mh-btn-primary bg-white text-brand-800 hover:bg-brand-50">
              Start searching <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/affordability" className="mh-btn-ghost border-white/30 bg-white/10 text-white hover:border-white/60 hover:text-white">
              Check what you can afford
            </Link>
          </div>
        </div>
      </section>

      {/* ── For agents / SaaS ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mh-container">
          <div className="grid items-center gap-10 rounded-3xl border border-ink-100 bg-ink-50/60 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <span className="mh-eyebrow">
                <BadgeCheck className="h-3.5 w-3.5" /> For agents &amp; brokerages
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900">
                The AI listing platform your clients already trust
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">
                Publish verified listings, win more offers with OfferIQ, and let AffordIQ pre-qualify your leads —
                all from one MapleHaus dashboard. Built for Canadian boards, RECO/OREA-aware, bilingual by default.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/pricing" className="mh-btn-primary">
                  See plans &amp; pricing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/agents" className="mh-btn-ghost">
                  Browse the agent network
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, label: "Verified listing badges" },
                { icon: ScanSearch, label: "OfferIQ bidding suite" },
                { icon: Calculator, label: "AffordIQ lead pre-qualification" },
                { icon: TrendingUp, label: "Market & valuation analytics" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink-800">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
