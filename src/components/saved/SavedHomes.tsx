"use client";

import Link from "next/link";
import { Heart, Search, Trash2 } from "lucide-react";
import { useSaved } from "@/components/saved/SavedContext";
import { propertyById } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";

export function SavedHomes() {
  const { ids, hydrated, clear } = useSaved();
  const homes = ids.map((id) => propertyById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const n = homes.length;

  return (
    <div className="mh-container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Saved homes</h1>
          <p className="mt-2 text-zinc-400">
            {!hydrated
              ? "Loading your saved homes…"
              : n
                ? `${n} ${n === 1 ? "home" : "homes"} saved to this device.`
                : "Tap the heart on any listing to save it here."}
          </p>
        </div>
        {hydrated && n > 0 && (
          <button onClick={clear} className="mh-btn-ghost">
            <Trash2 className="h-4 w-4" /> Clear all
          </button>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : n === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maple-500/15 text-maple-400">
            <Heart className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-semibold text-white">No saved homes yet</p>
          <p className="mt-1 max-w-sm text-sm text-zinc-400">
            Browse listings and tap the heart to keep your favourites in one place — they’ll stay here on this device.
          </p>
          <Link href="/search?type=sale" className="mh-btn-primary mt-6">
            <Search className="h-4 w-4" /> Browse listings
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {homes.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
