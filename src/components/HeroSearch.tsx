"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { k: "sale", label: "Buy" },
  { k: "rent", label: "Rent" },
  { k: "preconstruction", label: "Pre-con" },
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
      <div className="mb-2 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.k}
            onClick={() => {
              setType(tab.k);
              setMax("");
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              type === tab.k
                ? "bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="glass flex flex-col gap-2 rounded-2xl p-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-brand-400">
          <MapPin className="h-5 w-5 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="City, neighbourhood, or address"
            className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
        <select
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="rounded-xl border border-white/10 bg-night-800 px-3 py-3 text-sm text-zinc-200 outline-none focus:border-brand-400"
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
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
