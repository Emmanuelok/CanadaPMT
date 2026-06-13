"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Map as MapIcon, List, X } from "lucide-react";
import type { ListingType } from "@/types";
import { applyFilters, defaultFilters, PROPERTY_TYPES, type PropertyFilters } from "@/lib/search";
import { cities } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyMap } from "@/components/PropertyMap";
import { cn } from "@/lib/cn";

const TABS: { k: ListingType; label: string }[] = [
  { k: "sale", label: "Buy" },
  { k: "rent", label: "Rent" },
  { k: "preconstruction", label: "Pre-construction" },
  { k: "sold", label: "Sold" },
];

function initialFromParams(params: URLSearchParams): PropertyFilters {
  const type = (params.get("type") as ListingType) || "sale";
  const f = defaultFilters(["sale", "rent", "preconstruction", "sold"].includes(type) ? type : "sale");
  f.query = params.get("q") ?? "";
  f.city = params.get("city") ?? "";
  f.maxPrice = Number(params.get("max")) || 0;
  f.minBeds = Number(params.get("beds")) || 0;
  f.newcomerOnly = params.get("newcomer") === "1";
  f.transparentOnly = params.get("offeriq") === "1";
  return f;
}

export function SearchExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilters>(() => initialFromParams(params));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const results = useMemo(() => applyFilters(filters), [filters]);

  function update(patch: Partial<PropertyFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    const sp = new URLSearchParams();
    sp.set("type", next.listingType);
    if (next.query) sp.set("q", next.query);
    if (next.city) sp.set("city", next.city);
    if (next.maxPrice) sp.set("max", String(next.maxPrice));
    if (next.minBeds) sp.set("beds", String(next.minBeds));
    if (next.newcomerOnly) sp.set("newcomer", "1");
    if (next.transparentOnly) sp.set("offeriq", "1");
    router.replace(`/search?${sp.toString()}`, { scroll: false });
  }

  const isRent = filters.listingType === "rent";
  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minBeds ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.newcomerOnly ? 1 : 0) +
    (filters.transparentOnly ? 1 : 0);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mh-container py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex rounded-full bg-ink-50 p-1">
              {TABS.map((t) => (
                <button
                  key={t.k}
                  onClick={() => update({ listingType: t.k, maxPrice: 0 })}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                    filters.listingType === t.k ? "bg-white text-brand-700 shadow-sm" : "text-ink-600 hover:text-ink-900",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Select value={filters.city} onChange={(v) => update({ city: v })} label="City">
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select value={filters.propertyType} onChange={(v) => update({ propertyType: v })} label="Type">
                <option value="">Any type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <Select value={String(filters.minBeds)} onChange={(v) => update({ minBeds: Number(v) })} label="Beds">
                <option value="0">Any beds</option>
                <option value="1">1+ beds</option>
                <option value="2">2+ beds</option>
                <option value="3">3+ beds</option>
                <option value="4">4+ beds</option>
              </Select>
              <Select
                value={String(filters.maxPrice)}
                onChange={(v) => update({ maxPrice: Number(v) })}
                label="Max price"
              >
                <option value="0">Any price</option>
                {(isRent ? [2000, 2500, 3000, 4000] : [500000, 750000, 1000000, 1500000, 2500000]).map((p) => (
                  <option key={p} value={p}>
                    {isRent ? `$${p.toLocaleString("en-CA")}/mo` : `$${(p / 1000).toLocaleString("en-CA")}K`}
                  </option>
                ))}
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="relative hidden items-center sm:flex">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
                <input
                  value={filters.query}
                  onChange={(e) => update({ query: e.target.value })}
                  placeholder="Keyword…"
                  className="w-44 rounded-full border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
                />
              </label>
              <Select value={filters.sort} onChange={(v) => update({ sort: v as PropertyFilters["sort"] })} label="Sort">
                <option value="relevant">Most relevant</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="newest">Newest</option>
              </Select>
            </div>
          </div>

          {/* secondary toggles */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Toggle active={filters.newcomerOnly} onClick={() => update({ newcomerOnly: !filters.newcomerOnly })}>
              Newcomer-friendly
            </Toggle>
            <Toggle active={filters.transparentOnly} onClick={() => update({ transparentOnly: !filters.transparentOnly })}>
              OfferIQ transparent bidding
            </Toggle>
            {activeFilterCount > 0 && (
              <button
                onClick={() => update({ ...defaultFilters(filters.listingType), query: "" })}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-maple-600 hover:bg-maple-50"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mh-container py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-extrabold text-ink-900">
            {results.length} {filters.listingType === "sold" ? "sold" : filters.listingType === "rent" ? "rental" : "listing"}
            {results.length === 1 ? "" : "s"}
            {filters.city ? ` in ${filters.city}` : " across Canada"}
          </h1>
          {/* mobile view toggle */}
          <div className="flex rounded-full bg-ink-50 p-1 lg:hidden">
            <button
              onClick={() => setMobileView("list")}
              className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold", mobileView === "list" ? "bg-white text-brand-700 shadow-sm" : "text-ink-600")}
            >
              <List className="h-4 w-4" /> List
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold", mobileView === "map" ? "bg-white text-brand-700 shadow-sm" : "text-ink-600")}
            >
              <MapIcon className="h-4 w-4" /> Map
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_minmax(360px,40%)]">
          <div className={cn("min-w-0", mobileView === "map" && "hidden lg:block")}>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 py-20 text-center">
                <SlidersHorizontal className="h-8 w-8 text-ink-300" />
                <p className="mt-3 font-semibold text-ink-700">No listings match your filters</p>
                <p className="mt-1 text-sm text-ink-500">Try widening your budget, beds or city.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((p) => (
                  <div key={p.id} onMouseEnter={() => setActiveId(p.id)} onMouseLeave={() => setActiveId(null)}>
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cn("lg:sticky lg:top-44 lg:h-[calc(100vh-12rem)]", mobileView === "list" && "hidden lg:block")}>
            <PropertyMap
              properties={results}
              activeId={activeId}
              onHover={setActiveId}
              className="h-[65vh] w-full lg:h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 outline-none focus:border-brand-400"
    >
      {children}
    </select>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active ? "border-brand-300 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
      )}
    >
      {children}
    </button>
  );
}
