import type { Metadata } from "next";
import Link from "next/link";
import { LineChart, Ruler, Building2, MapPinned, Lock, ArrowRight } from "lucide-react";
import { properties, propertyBySlug } from "@/lib/data/properties";
import { ValuationPanel } from "@/components/ValuationPanel";
import { PropertyPicker } from "@/components/PropertyPicker";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "TrueValue AI — free home valuation",
  description:
    "TrueValue AI gives a free, explainable estimate of any Canadian home's value, with a confidence band, comparable sales and full price history.",
};

const STEPS = [
  { icon: Ruler, title: "Living-area baseline", body: "We start from the home's interior size and a city- and type-specific price-per-square-foot benchmark." },
  { icon: Building2, title: "Condition & features", body: "Age, parking, lot size, bathrooms and finishes adjust the number up or down — and you see each one." },
  { icon: MapPinned, title: "Comparable sales", body: "Recent comparable listings and sold prices in the same area anchor the estimate and set its confidence." },
  { icon: LineChart, title: "Neighbourhood momentum", body: "Growth, transit and demand signals tilt the final value — then we publish the band, not just a point." },
];

export default function ValuationPage({ searchParams }: { searchParams: { slug?: string } }) {
  const valuable = properties.filter((p) => p.listingType !== "rent");
  const selected = propertyBySlug(searchParams.slug ?? "") ?? valuable.find((p) => p.featured) ?? valuable[0];
  const options = valuable.map((p) => ({ slug: p.slug, label: `${p.title} — ${p.address.city}` }));

  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-brand-900 to-brand-950 py-14 text-white">
        <div className="mh-container">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
            <LineChart className="h-3.5 w-3.5" /> TrueValue AI
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight">
            A free, explainable value for any home — the number Canada usually hides.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/90">
            In most of Canada, sold prices and home valuations sit behind agents and paywalls. TrueValue gives you the
            estimate, the confidence band, the comparables and the full price history — for free.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-brand-50">
            <Lock className="h-4 w-4 text-brand-300" />
            No login. No paywall. Every listing on MapleHaus shows its TrueValue.
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mh-container">
          <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-700">Value a sample property</p>
              <p className="text-sm text-ink-500">Pick any listing to see TrueValue in action.</p>
            </div>
            <PropertyPicker options={options} value={selected.slug} basePath="/valuation" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <ValuationPanel property={selected} />
            <div className="space-y-5">
              <div className="mh-card p-6">
                <p className="text-sm font-semibold text-ink-700">{selected.title}</p>
                <p className="text-sm text-ink-500">
                  {selected.address.street}, {selected.address.city}, {selected.address.province}
                </p>
                <Link href={`/property/${selected.slug}`} className="mh-btn-ghost mt-4 w-full">
                  Open full listing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift">
                <p className="font-display text-lg font-bold">Selling instead?</p>
                <p className="mt-1 text-sm text-brand-50/90">
                  Get a TrueValue seller report and match with a top-performing agent in your area.
                </p>
                <Link href="/agents" className="mh-btn-primary mt-4 w-full bg-white text-brand-800 hover:bg-brand-50">
                  Find a listing agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-50/50 py-16">
        <div className="mh-container">
          <SectionHeading
            align="center"
            eyebrow="Transparent by design"
            title="How TrueValue calculates a number you can trust"
            description="No black box. Every estimate shows its drivers, its comparables and an honest confidence band."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
