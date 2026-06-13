"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { k: "sale", label: "Buy" },
  { k: "rent", label: "Rent" },
  { k: "preconstruction", label: "Pre-construction" },
  { k: "sold", label: "Sold" },
] as const;

const PRICE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  rent: [
    { value: "", label: "Any price" },
    { value: "2000", label: "Up to $2,000/mo" },
    { value: "2500", label: "Up to $2,500/mo" },
    { value: "3000", label: "Up to $3,000/mo" },
    { value: "4000", label: "Up to $4,000/mo" },
  ],
  default: [
    { value: "", label: "Any price" },
    { value: "500000", label: "Up to $500K" },
    { value: "750000", label: "Up to $750K" },
    { value: "1000000", label: "Up to $1M" },
    { value: "1500000", label: "Up to $1.5M" },
    { value: "2500000", label: "Up to $2.5M" },
  ],
};

const CHIPS = [
  { label: "Toronto condos", href: "/search?type=sale&q=Toronto" },
  { label: "Vancouver under $2M", href: "/search?type=sale&q=Vancouver&max=2000000" },
  { label: "Newcomer-friendly rentals", href: "/search?type=rent&newcomer=1" },
  { label: "Calgary infill", href: "/search?type=sale&q=Calgary" },
];

export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState<string>("sale");
  const [q, setQ] = useState("");
  const [max, setMax] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", type);
    if (q.trim()) params.set("q", q.trim());
    if (max) params.set("max", max);
    router.push(`/search?${params.toString()}`);
  }

  const priceOptions = PRICE_OPTIONS[type] ?? PRICE_OPTIONS.default;

  return (
    <div className="w-full">
      <div className="flex gap-1 rounded-t-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.k}
            onClick={() => {
              setType(tab.k);
              setMax("");
            }}
            className={cn(
              "rounded-t-xl px-4 py-2.5 text-sm font-semibold transition",
              type === tab.k ? "bg-white text-brand-700 shadow-sm" : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-b-2xl rounded-tr-2xl bg-white p-2 shadow-lift sm:flex-row"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 px-3 focus-within:border-brand-400">
          <MapPin className="h-5 w-5 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="City, neighbourhood, or address"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-400"
          />
        </div>
        <select
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-3 py-3 text-sm text-ink-700 outline-none focus:border-brand-400"
          aria-label="Maximum price"
        >
          {priceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button type="submit" className="mh-btn-primary px-6 py-3">
          <Search className="h-4 w-4" />
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => router.push(chip.href)}
            className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
