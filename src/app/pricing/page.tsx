import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import { AriaButton } from "@/components/AriaButton";

export const metadata: Metadata = {
  title: "Pricing & plans",
  description:
    "MapleHaus pricing — free for buyers and renters, with Pro and Brokerage plans for agents and teams that want the full AI listing platform.",
};

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    cadence: "forever",
    tagline: "For buyers, renters & newcomers",
    cta: "Start searching",
    href: "/search?type=sale",
    highlighted: false,
    features: [
      "Unlimited search across Canada",
      "TrueValue AI valuations & price history",
      "AffordIQ affordability + stress test",
      "ScamShield trust scores on every listing",
      "Aria AI copilot",
      "Saved homes & alerts",
      "Bilingual EN · FR",
    ],
  },
  {
    name: "Pro Agent",
    price: "$99",
    cadence: "per agent / month",
    tagline: "For individual agents",
    cta: "Start 30-day trial",
    href: "/pricing",
    highlighted: true,
    features: [
      "Everything in Explorer",
      "Verified agent profile & badge",
      "Unlimited verified listings",
      "OfferIQ transparent-bidding suite",
      "AffordIQ lead pre-qualification",
      "Valuation & market analytics",
      "Lead inbox + Aria auto-responder",
    ],
  },
  {
    name: "Brokerage",
    price: "$499",
    cadence: "per office / month",
    tagline: "For teams & brokerages",
    cta: "Talk to sales",
    href: "/pricing",
    highlighted: false,
    features: [
      "Everything in Pro Agent",
      "Unlimited team seats",
      "Branded agent microsites",
      "Bulk listing verification",
      "API & MLS/board integrations",
      "Bilingual concierge onboarding",
      "Priority support & SLAs",
    ],
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-brand-900 to-brand-950 py-14 text-white">
        <div className="mh-container text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
            <Sparkles className="h-3.5 w-3.5" /> Pricing
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight">
            Free for home seekers. Powerful for the pros.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50/90">
            Consumers never pay a cent. Agents and brokerages get the full AI listing platform — verified listings,
            transparent bidding and pre-qualified leads.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mh-container">
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-3xl border-2 border-brand-600 bg-white p-7 shadow-lift"
                    : "rounded-3xl border border-ink-100 bg-white p-7 shadow-soft"
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Most popular
                  </span>
                )}
                <p className="font-display text-lg font-bold text-ink-900">{plan.name}</p>
                <p className="text-sm text-ink-500">{plan.tagline}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold text-ink-900">{plan.price}</span>
                  <span className="pb-1 text-sm text-ink-500">{plan.cadence}</span>
                </div>

                {plan.name === "Pro Agent" ? (
                  <AriaButton className="mh-btn-primary mt-5 w-full">
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </AriaButton>
                ) : (
                  <Link
                    href={plan.href}
                    className={
                      plan.highlighted
                        ? "mh-btn-primary mt-5 w-full"
                        : "mh-btn-ghost mt-5 w-full"
                    }
                  >
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-ink-400">
            Prices in CAD. Pro and Brokerage billed annually; 30-day money-back guarantee. Plans are illustrative for
            this demonstration.
          </p>
        </div>
      </section>

      <section className="bg-ink-50/50 py-16">
        <div className="mh-container">
          <SectionHeading align="center" eyebrow="Questions" title="Common questions" />
          <div className="mx-auto mt-8 grid max-w-3xl gap-4">
            {[
              {
                q: "Is it really free for buyers and renters?",
                a: "Yes. TrueValue, AffordIQ, ScamShield and the Aria copilot are free, with no login wall. We monetise the professional side of the marketplace, not consumers.",
              },
              {
                q: "Do I need an Anthropic API key to run the AI?",
                a: "No. Aria runs on Claude when an API key is configured, and falls back to a built-in engine otherwise — so the platform is fully functional out of the box.",
              },
              {
                q: "Is MapleHaus bilingual?",
                a: "Yes — the experience and Aria both work in English and French, with provincial nuance (including Quebec's notarial process) built in.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <p className="font-display text-base font-bold text-ink-900">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
