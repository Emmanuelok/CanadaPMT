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
  Zap,
  Lock,
  Languages,
} from "lucide-react";
import { HeroSearch } from "@/components/HeroSearch";
import { AriaButton } from "@/components/AriaButton";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeading, ScoreBar } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { properties, propertyById, cities } from "@/lib/data/properties";
import { neighbourhoods } from "@/lib/data/neighbourhoods";
import { valueProperty } from "@/lib/valuation";
import { formatCAD, formatCADCompact, formatPercent } from "@/lib/format";

const PAIN_POINTS = [
  { icon: Eye, problem: "Sold prices stay hidden", body: "Across most of Canada you still can't freely see what a home actually sold for.", solution: "TrueValue AI — free, explainable valuations & full price history.", href: "/valuation" },
  { icon: ScanSearch, problem: "You're forced to bid blind", body: "Blind bidding hides every competing offer, inflating prices on the biggest purchase of your life.", solution: "OfferIQ — transparent bidding & an AI offer strategy.", href: "/about" },
  { icon: ShieldCheck, problem: "Rental fraud preys on newcomers", body: "Fake listings and deposit theft target the people least able to absorb the loss.", solution: "ScamShield — verified landlords & a fraud score on every listing.", href: "/newcomers" },
  { icon: Calculator, problem: "Affordability is a black box", body: "Calculators ignore the B-20 stress test, CMHC and land-transfer tax — so the number isn't real.", solution: "AffordIQ — qualifies you exactly like a Canadian lender.", href: "/affordability" },
];

const AI_TOOLS = [
  { icon: LineChart, name: "TrueValue AI", desc: "Free, explainable valuations with comparables, a confidence band and full price history.", href: "/valuation" },
  { icon: ScanSearch, name: "OfferIQ", desc: "Transparent bidding — see offer activity and get an AI-recommended offer instead of bidding blind.", href: "/about" },
  { icon: ShieldCheck, name: "ScamShield", desc: "Every listing scored on identity, ownership, photo authenticity and price sanity.", href: "/newcomers" },
  { icon: Calculator, name: "AffordIQ", desc: "Stress-test-aware affordability with CMHC, land-transfer tax and first-time-buyer rebates.", href: "/affordability" },
  { icon: Globe2, name: "Newcomer Pathway", desc: "A guided journey for thin credit files and no Canadian history — from first rental to first home.", href: "/newcomers" },
  { icon: MapPinned, name: "Neighbourhood IQ", desc: "Schools, transit, safety, walkability, growth and climate resilience — unified, not siloed.", href: "/search?type=sale" },
];

const STEPS = [
  { n: "01", title: "Search in plain language", body: "Tell Aria what you want — \"3-bed under $900k near transit in Mississauga\" — or explore the live map." },
  { n: "02", title: "See the truth on every listing", body: "TrueValue estimate, price history, ScamShield trust score and real affordability — on every home." },
  { n: "03", title: "Move with confidence", body: "Get an AI offer strategy, match with a vetted agent, and qualify the way a lender actually will." },
];

export default function HomePage() {
  const hero = propertyById("p-portcredit-condo")!;
  const v = valueProperty(hero);
  const featured = properties.filter((p) => p.featured && (!p.category || p.category === "residential")).slice(0, 6);
  const topNbhds = [...neighbourhoods].sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 sm:pt-24">
        <div className="mh-container relative text-center">
          <Reveal>
            <span className="mh-eyebrow">
              <Zap className="h-3.5 w-3.5" /> AI-native real estate · Canada
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-7xl">
              The <span className="gradient-text">intelligent</span> way to buy, rent &amp; value a home in Canada.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
              AI valuations, transparent bidding, fraud-checked listings and a copilot that does the legwork — for
              every home, coast to coast.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mx-auto mt-9 max-w-2xl text-left">
            <HeroSearch />
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
              {[
                { icon: LineChart, label: "Free sold-price history" },
                { icon: Lock, label: "Fraud-checked listings" },
                { icon: Calculator, label: "B-20 stress-tested" },
                { icon: Languages, label: "Bilingual EN · FR" },
              ].map((i) => (
                <span key={i.label} className="flex items-center gap-2">
                  <i.icon className="h-4 w-4 text-brand-400" />
                  {i.label}
                </span>
              ))}
            </div>
          </Reveal>

          {/* floating glass product chips */}
          <Reveal delay={0.28}>
            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-2xl p-5 text-left animate-float">
                <span className="mh-eyebrow">
                  <LineChart className="h-3.5 w-3.5" /> TrueValue AI
                </span>
                <p className="mt-3 text-sm text-zinc-400">{hero.address.city} · estimate</p>
                <p className="font-display text-3xl font-extrabold text-white">{formatCAD(v.estimate)}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatCADCompact(v.low)}–{formatCADCompact(v.high)} · {v.confidence}% confidence
                </p>
              </div>
              <div className="glass rounded-2xl p-5 text-left animate-float" style={{ animationDelay: "-2s" }}>
                <span className="mh-eyebrow">
                  <ShieldCheck className="h-3.5 w-3.5" /> ScamShield
                </span>
                <p className="mt-3 font-display text-3xl font-extrabold text-white">96/100</p>
                <p className="mt-1 text-xs text-zinc-500">Identity, ownership &amp; photos verified · no duplicates.</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Trusted listing
                </div>
              </div>
              <div className="glass rounded-2xl p-5 text-left animate-float" style={{ animationDelay: "-4s" }}>
                <span className="mh-eyebrow">
                  <Calculator className="h-3.5 w-3.5" /> AffordIQ
                </span>
                <p className="mt-3 text-sm text-zinc-400">Max budget · stress-tested</p>
                <p className="font-display text-3xl font-extrabold text-white">$842k</p>
                <p className="mt-1 text-xs text-zinc-500">On $140k income, 20% down, 7.04% qualifying rate.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── City marquee ─────────────────────────────────────────────────── */}
      <section className="mt-16">
        <p className="mh-container text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Live across Canada
        </p>
        <div className="mt-5">
          <Marquee>
            {[...cities, "12 cities"].map((c) => (
              <span key={c} className="mx-4 flex items-center gap-3 text-lg font-semibold text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {c}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── Pain points ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mh-container">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our critical niche"
              title={<span className="text-white">Built to fix what Canadian real estate won&apos;t</span>}
              description="We researched the gaps the big portals leave open — then built an AI platform around solving exactly those problems."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={p.problem} delay={i * 0.06}>
                <div className="mh-card flex h-full gap-4 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-fuchsia-500/20 text-brand-200 ring-1 ring-white/10">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{p.problem}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{p.body}</p>
                    <Link href={p.href} className="mt-3 flex items-start gap-2 text-sm font-semibold text-brand-300 hover:text-brand-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      {p.solution}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI tools ─────────────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="mh-container">
          <Reveal>
            <SectionHeading
              eyebrow="One intelligent platform"
              title={<span className="text-white">Seven AI tools, one home journey</span>}
              description="Each tool targets a real Canadian pain point — orchestrated by Aria, your AI copilot."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool, i) => (
              <Reveal key={tool.name} delay={i * 0.05}>
                <Link href={tool.href} className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-brand-500/40 hover:bg-white/[0.06]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow">
                    <tool.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{tool.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{tool.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                    Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/30 to-fuchsia-600/20 p-6">
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">Meet Aria</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                    Your AI copilot ties it together — search, value, qualify and verify in one conversation.
                  </p>
                </div>
                <AriaButton className="mh-btn-primary mt-5 w-full">
                  <Sparkles className="h-4 w-4" /> Chat with Aria
                </AriaButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Featured listings ────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mh-container">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Live sample listings" title={<span className="text-white">Featured homes across Canada</span>} />
              <Link href="/search?type=sale" className="mh-btn-ghost">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Neighbourhood IQ ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mh-container">
          <Reveal>
            <SectionHeading
              eyebrow="Neighbourhood IQ"
              title={<span className="text-white">Know the neighbourhood before you commit</span>}
              description="Schools, transit, safety, growth and climate resilience — scored and unified for every area."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {topNbhds.map((nb, i) => (
              <Reveal key={nb.id} delay={i * 0.05}>
                <Link href={`/search?type=sale&q=${encodeURIComponent(nb.city)}`} className="mh-card block p-6 transition hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{nb.name}</h3>
                      <p className="text-sm text-zinc-500">{nb.city}, {nb.province}</p>
                    </div>
                    <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                      <span className="font-display text-lg font-extrabold leading-none">{nb.scores.overall}</span>
                      <span className="text-[9px] font-semibold uppercase">score</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Median</span>
                    <span className="font-semibold text-white">{formatCADCompact(nb.medianPrice)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">12-mo change</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-300">
                      <TrendingUp className="h-3.5 w-3.5" /> {formatPercent(nb.priceYoY)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <ScoreBar label="Transit" value={nb.scores.transit} />
                    <ScoreBar label="Walkability" value={nb.scores.walkability} />
                    <ScoreBar label="Climate resilience" value={nb.scores.climateResilience} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mh-container">
          <Reveal>
            <SectionHeading align="center" eyebrow="How MapleHaus works" title={<span className="text-white">Three steps to a confident move</span>} />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="mh-card h-full p-7">
                  <p className="gradient-text font-display text-5xl font-extrabold">{s.n}</p>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── For agents / CTA ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mh-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/40 via-night-900 to-fuchsia-700/30 p-8 sm:p-12">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <span className="mh-eyebrow">
                    <BadgeCheck className="h-3.5 w-3.5" /> For agents &amp; brokerages
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    The AI listing platform your clients already trust
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-zinc-300">
                    Publish verified listings, win more offers with OfferIQ, and let AffordIQ pre-qualify your leads —
                    all from one dashboard. Canadian-board aware, bilingual by default.
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
                    { icon: Calculator, label: "AffordIQ lead pre-qual" },
                    { icon: TrendingUp, label: "Valuation analytics" },
                  ].map((f) => (
                    <div key={f.label} className="glass flex items-center gap-3 rounded-2xl p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                        <f.icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-white">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
