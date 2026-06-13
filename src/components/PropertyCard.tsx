import Link from "next/link";
import {
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Tag,
  Star,
  Flame,
  ArrowDownRight,
  ShieldAlert,
  Minus,
} from "lucide-react";
import type { Property } from "@/types";
import type { Badge, BadgeTone } from "@/lib/signals";
import { CardMedia } from "@/components/CardMedia";
import { SaveButton } from "@/components/SaveButton";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { propertySignals } from "@/lib/signals";
import { agentById } from "@/lib/data/agents";
import { neighbourhoodById } from "@/lib/data/neighbourhoods";
import { formatCAD } from "@/lib/format";
import { cn } from "@/lib/cn";

const LISTING_LABEL: Record<Property["listingType"], string> = {
  sale: "For sale",
  rent: "For rent",
  preconstruction: "Pre-construction",
  sold: "Sold",
};

const TONE_SOLID: Record<BadgeTone, string> = {
  emerald: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white",
  amber: "bg-amber-500 text-white",
  sky: "bg-sky-600 text-white",
  violet: "bg-violet-600 text-white",
  slate: "bg-ink-800/90 text-white",
  brand: "bg-brand-700 text-white",
};

const TONE_SOFT: Record<BadgeTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-ink-100 text-ink-600",
  brand: "bg-brand-50 text-brand-700",
};

function badgeIcon(label: string) {
  if (/below|way below/i.test(label)) return TrendingDown;
  if (/above market/i.test(label)) return TrendingUp;
  if (/reduced/i.test(label)) return ArrowDownRight;
  if (/hot/i.test(label)) return Flame;
  if (/may drop/i.test(label)) return Tag;
  if (/unverified|ownership/i.test(label)) return ShieldAlert;
  if (/featured/i.test(label)) return Star;
  return Tag;
}

function SolidBadge({ badge }: { badge: Badge }) {
  const Icon = badgeIcon(badge.label);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
        TONE_SOLID[badge.tone],
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {badge.label}
    </span>
  );
}

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const s = propertySignals(property);
  const agent = agentById(property.agentId);
  const initial = agent ? agent.name[0] : "!";
  const isResidential = !property.category || property.category === "residential";
  const areaLabel =
    property.category === "land"
      ? `${(property.lotSqft ?? property.sqft).toLocaleString("en-CA")} ft² lot`
      : `${property.sqft.toLocaleString("en-CA")} ft²`;
  const priceLabel =
    property.listingType === "rent"
      ? `${formatCAD(property.price)}/mo`
      : property.listingType === "sold"
        ? `Sold · ${formatCAD(property.price)}`
        : formatCAD(property.price);

  const EstIcon = s.estimatePill
    ? s.estimatePill.tone === "emerald"
      ? TrendingDown
      : s.estimatePill.tone === "rose"
        ? TrendingUp
        : Minus
    : Minus;

  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        <CardMedia property={property} className="h-44 w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/35 to-transparent" />

        {/* stacked badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-30 flex max-w-[70%] flex-col items-start gap-1">
          <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-800 shadow-sm">
            {LISTING_LABEL[property.listingType]}
          </span>
          {s.badges.slice(0, 2).map((b) => (
            <SolidBadge key={b.label} badge={b} />
          ))}
          {s.lifestyle[0] && (
            <span className="rounded-md bg-brand-700/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              {s.lifestyle[0]}
            </span>
          )}
        </div>

        {/* top-right */}
        <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1.5">
          <CompareToggle id={property.id} />
          <SaveButton propertyId={property.id} />
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm",
              agent ? "bg-brand-700" : "bg-amber-500",
            )}
            title={agent ? agent.name : "Unverified lister"}
          >
            {initial}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-xl font-extrabold text-ink-900">{priceLabel}</p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
            <Sparkles className="h-3 w-3" /> Match {s.matchScore}%
          </span>
        </div>

        {s.estimatePill && (
          <span
            className={cn(
              "mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              TONE_SOFT[s.estimatePill.tone],
            )}
          >
            <EstIcon className="h-3 w-3" />
            {s.estimatePill.label}
          </span>
        )}

        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-ink-800 group-hover:text-brand-700">
          {property.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">
            {neighbourhoodById(property.address.neighbourhoodId)?.name ?? property.address.street} · {property.address.city},{" "}
            {property.address.province}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-ink-100 pt-3 text-sm text-ink-600">
          {isResidential ? (
            <>
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
            </>
          ) : (
            <>
              <span className="font-medium text-ink-700">{property.propertyType}</span>
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-ink-400" />
                {areaLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
