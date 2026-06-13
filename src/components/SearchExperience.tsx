"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  SplitSquareHorizontal,
  X,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Flame,
} from "lucide-react";
import type { ListingType, Property } from "@/types";
import { applyFilters, defaultFilters, PROPERTY_TYPES, type PropertyFilters } from "@/lib/search";
import { cities } from "@/lib/data/properties";
import { LIFESTYLE_CHIPS, matchesLifestyle, propertySignals } from "@/lib/signals";
import { PropertyCard } from "@/components/PropertyCard";
import { cn } from "@/lib/cn";

const LeafletMap = dynamic(() => import("@/components/LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e7efe9] text-sm text-ink-400">Loading map…</div>
  ),
});

const TABS: { k: ListingType; label: string }[] = [
  { k: "sale", label: "Buy" },
  { k: "rent", label: "Rent" },
  { k: "preconstruction", label: "Pre-construction" },
  { k: "sold", label: "Sold" },
];

type View = "split" | "grid" | "map";

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
  const [chips, setChips] = useState<string[]>(params.get("deal") === "1" ? ["Find me a deal"] : []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>("split");
  const [savedSearch, setSavedSearch] = useState(false);
  const [heatmap, setHeatmap] = useState(false);
  const [areaBounds, setAreaBounds] = useState<[number, number, number, number] | null>(null);

  const results = useMemo(() => {
    let r = applyFilters(filters);
    if (chips.length) r = r.filter((p) => chips.every((c) => matchesLifestyle(p, c)));
    if (areaBounds) {
      const [s, w, n, e] = areaBounds;
      r = r.filter((p) => p.coords.lat >= s && p.coords.lat <= n && p.coords.lng >= w && p.coords.lng <= e);
    }
    if (filters.sort === "relevant") {
      r = [...r].sort((a, b) => propertySignals(b).matchScore - propertySignals(a).matchScore);
    }
    return r;
  }, [filters, chips, areaBounds]);

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

  function toggleChip(c: string) {
    setChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  const isRent = filters.listingType === "rent";
  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minBeds ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.newcomerOnly ? 1 : 0) +
    (filters.transparentOnly ? 1 : 0) +
    chips.length;

  const noun = filters.listingType === "sold" ? "sold home" : filters.listingType === "rent" ? "rental" : "home";

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-ink-100 bg-cream-100/95 backdrop-blur">
        <div className="mh-container py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              {TABS.map((t) => (
                <button
                  key={t.k}
                  onClick={() => update({ listingType: t.k, maxPrice: 0 })}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                    filters.listingType === t.k ? "bg-brand-700 text-white shadow-sm" : "text-ink-600 hover:text-ink-900",
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
              <Select value={String(filters.maxPrice)} onChange={(v) => update({ maxPrice: Number(v) })} label="Max price">
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
                  className="w-40 rounded-full border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
                />
              </label>
              <Select value={filters.sort} onChange={(v) => update({ sort: v as PropertyFilters["sort"] })} label="Sort">
                <option value="relevant">Ranked for you</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="newest">Newest</option>
              </Select>
            </div>
          </div>

          {/* lifestyle chips */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {LIFESTYLE_CHIPS.map((c) => {
              const on = chips.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleChip(c)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    on
                      ? "border-brand-600 bg-brand-700 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700",
                  )}
                >
                  {c === "Find me a deal" && <Sparkles className="h-3.5 w-3.5" />}
                  {c}
                </button>
              );
            })}
            <Toggle active={filters.newcomerOnly} onClick={() => update({ newcomerOnly: !filters.newcomerOnly })}>
              Newcomer-ready
            </Toggle>
            <Toggle active={filters.transparentOnly} onClick={() => update({ transparentOnly: !filters.transparentOnly })}>
              OfferIQ bidding
            </Toggle>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setChips([]);
                  update({ ...defaultFilters(filters.listingType), query: "" });
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-maple-600 hover:bg-maple-50"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mh-container py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-extrabold text-ink-900">
            {results.length} {noun}
            {results.length === 1 ? "" : "s"}
            {filters.listingType === "sold" ? "" : " for " + (filters.listingType === "rent" ? "rent" : "sale")}
            {filters.city ? ` in ${filters.city}` : " across Canada"}
            <span className="ml-2 text-sm font-medium text-ink-400">· ranked for you</span>
          </h1>
          <div className="flex items-center gap-2">
            {areaBounds && (
              <button
                onClick={() => setAreaBounds(null)}
                className="inline-flex items-center gap-1 rounded-full border border-maple-200 bg-maple-50 px-3 py-1.5 text-xs font-semibold text-maple-600"
              >
                <X className="h-3.5 w-3.5" /> Clear area
              </button>
            )}
            {view !== "grid" && (
              <button
                onClick={() => setHeatmap((v) => !v)}
                className={cn(
                  "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:inline-flex",
                  heatmap ? "border-brand-300 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700 hover:border-brand-300",
                )}
              >
                <Flame className="h-4 w-4" /> Heatmap
              </button>
            )}
            <button
              onClick={() => setSavedSearch((v) => !v)}
              className="hidden items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-300 sm:inline-flex"
            >
              {savedSearch ? <BookmarkCheck className="h-4 w-4 text-brand-600" /> : <Bookmark className="h-4 w-4" />}
              {savedSearch ? "Search saved" : "Save this search"}
            </button>
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              {(
                [
                  { k: "split", icon: SplitSquareHorizontal, label: "Split" },
                  { k: "grid", icon: LayoutGrid, label: "Grid" },
                  { k: "map", icon: MapIcon, label: "Map" },
                ] as const
              ).map((v) => (
                <button
                  key={v.k}
                  onClick={() => setView(v.k)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    view === v.k ? "bg-brand-700 text-white" : "text-ink-600 hover:text-ink-900",
                  )}
                >
                  <v.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
            <SlidersHorizontal className="h-8 w-8 text-ink-300" />
            <p className="mt-3 font-semibold text-ink-700">No homes match your filters</p>
            <p className="mt-1 text-sm text-ink-500">Try widening your budget, beds, city or lifestyle filters.</p>
          </div>
        ) : view === "grid" ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : view === "map" ? (
          <div className="mt-5 h-[calc(100vh-15rem)] overflow-hidden rounded-2xl border border-ink-100">
            <LeafletMap properties={results} activeId={activeId} onHover={setActiveId} heatmap={heatmap} onBoundsSearch={setAreaBounds} />
          </div>
        ) : (
          // split
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            <div className="order-2 hidden overflow-hidden rounded-2xl border border-ink-100 lg:order-1 lg:block lg:sticky lg:top-44 lg:h-[calc(100vh-12rem)]">
              <LeafletMap properties={results} activeId={activeId} onHover={setActiveId} heatmap={heatmap} onBoundsSearch={setAreaBounds} />
            </div>
            <div className="order-1 min-w-0 lg:order-2">
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((p) => (
                  <div key={p.id} onMouseEnter={() => setActiveId(p.id)} onMouseLeave={() => setActiveId(null)}>
                    <PropertyCard property={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
      )}
    >
      {children}
    </button>
  );
}
