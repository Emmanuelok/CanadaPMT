import Link from "next/link";
import { BedDouble, Bath, Maximize, MapPin, ShieldCheck, ShieldAlert, Sparkles, Globe } from "lucide-react";
import type { Property } from "@/types";
import { PropertyImage } from "@/components/PropertyImage";
import { Pill } from "@/components/ui";
import { formatCAD } from "@/lib/format";
import { valueProperty } from "@/lib/valuation";
import { assessListing } from "@/lib/scamShield";
import { cn } from "@/lib/cn";

const LISTING_LABEL: Record<Property["listingType"], { label: string; tone: "brand" | "sky" | "amber" | "neutral" }> = {
  sale: { label: "For sale", tone: "brand" },
  rent: { label: "For rent", tone: "sky" },
  preconstruction: { label: "Pre-construction", tone: "amber" },
  sold: { label: "Sold", tone: "neutral" },
};

function imageIcon(p: Property): "home" | "building" | "trees" | "hammer" {
  if (p.listingType === "preconstruction") return "hammer";
  if (p.propertyType === "Condo Apartment" || p.propertyType === "Loft") return "building";
  return "home";
}

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const listing = LISTING_LABEL[property.listingType];
  const valuation = valueProperty(property);
  const scam = assessListing(property);
  const isRental = property.listingType === "rent";

  const priceLabel =
    property.listingType === "rent"
      ? `${formatCAD(property.price)}/mo`
      : property.listingType === "sold"
        ? `Sold · ${formatCAD(property.price)}`
        : formatCAD(property.price);

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        <PropertyImage
          seedKey={`${property.id}-0`}
          icon={imageIcon(property)}
          kind={property.listingType === "preconstruction" ? "rendering" : "photo"}
          className="h-48 w-full"
        />
        <span className="absolute left-3 top-3">
          <Pill tone={listing.tone}>{listing.label}</Pill>
        </span>
        <span className="absolute right-3 top-3 flex gap-1.5">
          {isRental && scam.risk !== "low" ? (
            <Pill tone="maple">
              <ShieldAlert className="h-3 w-3" /> {scam.risk === "high" ? "High risk" : "Caution"}
            </Pill>
          ) : property.trust.verifiedLister ? (
            <Pill tone="brand">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Pill>
          ) : null}
        </span>
        {property.daysOnMarket <= 14 && property.listingType !== "sold" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            New · {property.daysOnMarket}d on market
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-xl font-extrabold text-ink-900">{priceLabel}</p>
          {(property.listingType === "sale" || property.listingType === "preconstruction") && (
            <span
              className={cn(
                "text-xs font-semibold",
                Math.abs(valuation.askingDelta) < 2
                  ? "text-ink-500"
                  : valuation.askingDelta > 0
                    ? "text-maple-600"
                    : "text-brand-600",
              )}
              title="Asking price vs. TrueValue AI estimate"
            >
              {Math.abs(valuation.askingDelta) < 2
                ? "At AI value"
                : `${valuation.askingDelta > 0 ? "+" : ""}${valuation.askingDelta}% vs AI`}
            </span>
          )}
        </div>

        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-ink-800 group-hover:text-brand-700">
          {property.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {property.address.street}, {property.address.city}, {property.address.province}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-ink-100 pt-3 text-sm text-ink-600">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-ink-400" />
            {property.beds} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-ink-400" />
            {property.baths} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-ink-400" />
            {property.sqft.toLocaleString("en-CA")} ft²
          </span>
        </div>

        {(property.newcomerFriendly || property.transparentBidding) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.transparentBidding && (
              <Pill tone="brand">
                <Sparkles className="h-3 w-3" /> OfferIQ bidding
              </Pill>
            )}
            {property.newcomerFriendly && (
              <Pill tone="violet">
                <Globe className="h-3 w-3" /> Newcomer-friendly
              </Pill>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
