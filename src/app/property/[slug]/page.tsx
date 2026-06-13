import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BedDouble,
  Bath,
  Maximize,
  Car,
  CalendarDays,
  Home,
  MapPin,
  ChevronLeft,
  Sparkles,
  CalendarClock,
} from "lucide-react";
import { properties, propertyBySlug } from "@/lib/data/properties";
import type { Property } from "@/types";
import { PropertyScene } from "@/components/PropertyScene";
import { PropertyCard } from "@/components/PropertyCard";
import { ValuationPanel } from "@/components/ValuationPanel";
import { TrustPanel } from "@/components/TrustPanel";
import { NeighbourhoodPanel } from "@/components/NeighbourhoodPanel";
import { AgentCard } from "@/components/AgentCard";
import { MortgageSnapshot } from "@/components/MortgageSnapshot";
import { PriceHistory } from "@/components/PriceHistory";
import { AriaButton } from "@/components/AriaButton";
import { Pill } from "@/components/ui";
import { formatCAD } from "@/lib/format";
import { PROVINCE_NAMES } from "@/lib/format";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = propertyBySlug(params.slug);
  if (!p) return { title: "Listing not found" };
  return {
    title: p.title,
    description: `${p.title} — ${p.address.street}, ${p.address.city}, ${p.address.province}. ${formatCAD(p.price)}${p.listingType === "rent" ? "/mo" : ""}.`,
  };
}

const LISTING_LABEL: Record<Property["listingType"], { label: string; tone: "brand" | "sky" | "amber" | "neutral" }> = {
  sale: { label: "For sale", tone: "brand" },
  rent: { label: "For rent", tone: "sky" },
  preconstruction: { label: "Pre-construction", tone: "amber" },
  sold: { label: "Sold", tone: "neutral" },
};

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const property = propertyBySlug(params.slug);
  if (!property) notFound();

  const heroKind = property.propertyType === "Condo Apartment" || property.propertyType === "Loft" ? "living" : "exterior";
  const listing = LISTING_LABEL[property.listingType];
  const thumbs = property.images.slice(1, 5);
  const similar = properties
    .filter((p) => p.address.city === property.address.city && p.id !== property.id && p.listingType !== "sold")
    .slice(0, 3);

  const priceLabel =
    property.listingType === "rent"
      ? `${formatCAD(property.price)}/mo`
      : property.listingType === "sold"
        ? `Sold for ${formatCAD(property.price)}`
        : formatCAD(property.price);

  const facts: { icon: typeof BedDouble; label: string; value: string }[] = [
    { icon: BedDouble, label: "Beds", value: `${property.beds}` },
    { icon: Bath, label: "Baths", value: `${property.baths}` },
    { icon: Maximize, label: "Interior", value: `${property.sqft.toLocaleString("en-CA")} ft²` },
    { icon: Car, label: "Parking", value: `${property.parking}` },
    { icon: CalendarDays, label: property.listingType === "preconstruction" ? "Completion" : "Built", value: `${property.yearBuilt}` },
    { icon: Home, label: "Type", value: property.propertyType },
  ];

  return (
    <div className="mh-container py-6">
      <Link href="/search?type=sale" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ChevronLeft className="h-4 w-4" /> Back to search
      </Link>

      {/* Gallery */}
      <div className="mt-4 overflow-hidden rounded-2xl">
        <PropertyScene
          seedKey={`${property.id}-0`}
          kind={heroKind}
          label={property.images[0]?.label}
          className="h-72 w-full sm:h-[420px]"
        />
      </div>
      {thumbs.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {thumbs.map((img, i) => (
            <PropertyScene
              key={i}
              seedKey={`${property.id}-${i + 1}`}
              label={img.label}
              className="h-20 w-full rounded-xl sm:h-28"
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={listing.tone}>{listing.label}</Pill>
            {property.transparentBidding && <Pill tone="brand"><Sparkles className="h-3 w-3" /> OfferIQ bidding</Pill>}
            {property.newcomerFriendly && <Pill tone="violet">Newcomer-friendly</Pill>}
            <span className="text-xs text-ink-400">MLS® {property.mls}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {priceLabel}
          </h1>
          <p className="mt-1 font-display text-lg font-semibold text-ink-700">{property.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4" />
            {property.address.street}, {property.address.city}, {PROVINCE_NAMES[property.address.province]}{" "}
            {property.address.postalCode}
          </p>
        </div>
        {property.openHouse && (
          <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700">
            <CalendarClock className="h-4 w-4" />
            Open house · {property.openHouse}
          </div>
        )}
      </div>

      {/* Facts */}
      <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:grid-cols-6">
        {facts.map((f) => (
          <div key={f.label} className="text-center">
            <f.icon className="mx-auto h-5 w-5 text-brand-600" />
            <p className="mt-1 text-sm font-bold text-ink-900">{f.value}</p>
            <p className="text-xs text-ink-500">{f.label}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="mh-card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">About this home</h2>
            <p className="mt-3 leading-relaxed text-ink-600">{property.description}</p>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {property.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-ink-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {feat}
                </div>
              ))}
            </div>
          </section>

          <ValuationPanel property={property} />

          <section className="mh-card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Price history</h2>
            <div className="mt-4">
              <PriceHistory history={property.priceHistory} />
            </div>
          </section>

          <NeighbourhoodPanel neighbourhoodId={property.address.neighbourhoodId} />
          <TrustPanel property={property} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <MortgageSnapshot property={property} />
          <AgentCard agentId={property.agentId} />
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift">
            <Sparkles className="h-6 w-6" />
            <p className="mt-3 font-display text-lg font-bold">Ask Aria about this home</p>
            <p className="mt-1 text-sm text-brand-50/90">
              Is it priced fairly? What would I need to earn? Aria has the full picture.
            </p>
            <AriaButton className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50">
              <Sparkles className="h-4 w-4" /> Chat with Aria
            </AriaButton>
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">More in {property.address.city}</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
