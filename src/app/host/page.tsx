import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  Camera,
  LineChart,
  MessageSquare,
  Sparkles,
  Wrench,
  Package,
  BarChart3,
  ShieldCheck,
  CalendarCheck,
  Wallet,
  Check,
} from "lucide-react";
import { EarningsEstimator } from "@/components/host/EarningsEstimator";
import { HostLeadForm } from "@/components/host/HostLeadForm";
import { HOST_PLANS } from "@/lib/str";

export const metadata: Metadata = {
  title: "Host with MapleHaus — fully-managed short-term rentals",
  description:
    "Turn your home, suite or spare room into income. MapleHaus runs your short-term rental end-to-end — listing, pricing, guests, cleaning and maintenance — while you collect monthly payouts.",
};

const STEPS = [
  { icon: LineChart, title: "Get your estimate", body: "Tell us about your space and we project realistic earnings from comparable listings in your market." },
  { icon: Camera, title: "We onboard & list", body: "Pro photos, a high-converting listing, dynamic pricing and a municipal-rules check — live across the major platforms." },
  { icon: CalendarCheck, title: "We run everything", body: "Guest screening, 24/7 messaging, cleaning, restocking and maintenance — all handled for you." },
  { icon: Wallet, title: "You get paid", body: "Transparent monthly payouts and a performance dashboard. Block your own dates anytime." },
];

const SERVICES = [
  { icon: KeyRound, title: "Listing & multi-platform setup", body: "Airbnb, Vrbo and Booking.com — one space, maximum reach." },
  { icon: Camera, title: "Pro photography & copywriting", body: "Listings that look the part and rank higher." },
  { icon: LineChart, title: "Dynamic nightly pricing", body: "Rates tuned to demand, events and seasonality to lift revenue." },
  { icon: MessageSquare, title: "24/7 guest comms & screening", body: "Vetted guests, fast replies, five-star experiences." },
  { icon: Sparkles, title: "Cleaning & turnovers", body: "Vetted cleaners, hotel-grade linens, every changeover." },
  { icon: Wrench, title: "Maintenance & repairs", body: "A trusted trades network on call when something breaks." },
  { icon: Package, title: "Restocking & supplies", body: "Consumables and essentials kept topped up between stays." },
  { icon: BarChart3, title: "Payouts & reporting", body: "Clear monthly statements and live occupancy insights." },
];

const FAQ = [
  { q: "Is short-term rental allowed where I live?", a: "We check municipal bylaws and licensing during onboarding. Some cities restrict short-term rentals to your principal residence or require a permit — we’ll flag what applies before you commit." },
  { q: "Who pays for cleaning?", a: "Guests do, through the platform cleaning fee. We coordinate vetted cleaners for every turnover, so it’s not a cost out of your payout." },
  { q: "What’s the minimum commitment?", a: "Flexible. After a short initial term it’s month-to-month — cancel with notice if your plans change." },
  { q: "Can I still use my place?", a: "Absolutely. Block any dates in your owner calendar and the rest stays available to guests." },
  { q: "How quickly can I go live?", a: "Most spaces are listed within 1–2 weeks of onboarding, including photos, pricing and compliance checks." },
];

export default function HostPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mh-container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> MapleHaus Host · fully-managed short-term rentals
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Earn from your home.<br />
            <span className="gradient-text">We handle everything.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Got a spare suite, a basement apartment, or a place that sits empty? We turn it into a short-term rental and
            run it end-to-end — listing, pricing, guests, cleaning and maintenance. You just collect the payouts.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#start" className="mh-btn-primary px-6 py-3 text-base">
              Get a free earnings estimate <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how" className="mh-btn-ghost px-6 py-3 text-base">
              How it works
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-400">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-400" /> Licensing & bylaw checks</span>
            <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-brand-400" /> Hands-off, end-to-end</span>
            <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-brand-400" /> Keep up to 88% of revenue</span>
          </div>
        </div>
      </section>

      {/* Estimator */}
      <section id="estimate" className="mh-container py-12">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            What could your space earn?
          </h2>
          <p className="mt-3 text-zinc-400">
            A live estimate from local market averages. For the real number, get a custom projection below.
          </p>
        </div>
        <EarningsEstimator />
      </section>

      {/* How it works */}
      <section id="how" className="mh-container py-16">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          How it works
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-bold text-brand-400">STEP {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mh-container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything is taken care of
          </h2>
          <p className="mt-3 text-zinc-400">One team, one fee — the whole operation handled for you.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-brand-300">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="mh-container py-12">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                <BarChart3 className="h-3.5 w-3.5 text-brand-400" /> Owner dashboard
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Full transparency, in real time
              </h2>
              <p className="mt-3 max-w-xl text-zinc-400">
                Every owner gets a live dashboard: monthly payouts, occupancy trends, upcoming bookings, and every
                cleaning and maintenance task we handle on your behalf. No black box.
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Monthly payout statements", "Occupancy & revenue trends", "Upcoming bookings calendar", "Cleaning & maintenance log"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 shrink-0 text-brand-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/host/dashboard" className="mh-btn-primary mt-6">
                View a sample dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-night-900/60 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">Next payout · Jul 1</p>
                <Wallet className="h-4 w-4 text-brand-300" />
              </div>
              <p className="mt-1 font-display text-3xl font-extrabold text-white">$6,480</p>
              <div className="mt-4 flex items-end gap-1.5">
                {[38, 44, 52, 61, 72, 88, 96, 92, 78, 66, 58, 84].map((h, i) => (
                  <span
                    key={i}
                    className={i === 11 ? "flex-1 rounded-sm bg-brand-400" : "flex-1 rounded-sm bg-white/15"}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-500">Net payouts · last 12 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mh-container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, performance-aligned pricing
          </h2>
          <p className="mt-3 text-zinc-400">
            We only make money when you do — a percentage of revenue, no setup fees, no lock-in.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          <PlanCard
            featured
            name={HOST_PLANS.full.label}
            rate={HOST_PLANS.full.rate}
            blurb={HOST_PLANS.full.blurb}
            features={["Listing, photos & multi-platform setup", "Dynamic nightly pricing", "24/7 guest comms & screening", "Cleaning & turnovers coordinated", "Maintenance & restocking", "Monthly payouts & reporting"]}
          />
          <PlanCard
            name={HOST_PLANS.cohost.label}
            rate={HOST_PLANS.cohost.rate}
            blurb={HOST_PLANS.cohost.blurb}
            features={["Listing, photos & multi-platform setup", "Dynamic nightly pricing", "Guest comms & screening", "Monthly payouts & reporting", "You manage your own turnovers", "Cleaning & maintenance as add-ons"]}
          />
        </div>
      </section>

      {/* Lead form */}
      <section id="start" className="mh-container py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Get your free earnings estimate
            </h2>
            <p className="mt-3 text-zinc-400">
              Tell us about your space and we&apos;ll send a custom projection — no obligation.
            </p>
          </div>
          <HostLeadForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="mh-container py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-8 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                  {f.q}
                  <span className="text-brand-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mh-container pb-24">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Turn your space into income</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Hands-off hosting, handled by people who do this every day. See what your place could earn.
          </p>
          <Link href="#start" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold text-brand-700 transition hover:bg-zinc-100">
            Get my free estimate <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  name,
  rate,
  blurb,
  features,
  featured,
}: {
  name: string;
  rate: number;
  blurb: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "relative rounded-3xl border-2 border-brand-400/40 bg-brand-500/[0.06] p-7"
          : "relative rounded-3xl border border-white/10 bg-white/[0.03] p-7"
      }
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-white">
          Most popular
        </span>
      )}
      <h3 className="font-display text-xl font-bold text-white">{name}</h3>
      <p className="mt-2 font-display text-4xl font-extrabold text-white">
        {Math.round(rate * 100)}%<span className="text-base font-semibold text-zinc-400"> of revenue</span>
      </p>
      <p className="mt-2 text-sm text-zinc-400">{blurb}</p>
      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="#start" className={featured ? "mh-btn-primary mt-6 w-full" : "mh-btn-ghost mt-6 w-full"}>
        Get started
      </Link>
    </div>
  );
}
