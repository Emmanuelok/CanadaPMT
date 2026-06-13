"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Property } from "@/types";
import { formatCADCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

function priceLabel(p: Property): string {
  if (p.listingType === "rent") return `$${(p.price / 1000).toFixed(1)}k`;
  return formatCADCompact(p.price);
}

export function PropertyMap({
  properties,
  activeId,
  onHover,
  className,
}: {
  properties: Property[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  className?: string;
}) {
  if (!properties.length) {
    return (
      <div className={cn("flex items-center justify-center rounded-2xl border border-ink-100 bg-ink-50", className)}>
        <p className="text-sm text-ink-500">No listings to map.</p>
      </div>
    );
  }

  const lats = properties.map((p) => p.coords.lat);
  const lngs = properties.map((p) => p.coords.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.04;
  const lngRange = maxLng - minLng || 0.04;

  const project = (p: Property) => {
    const single = properties.length === 1;
    const x = single ? 50 : 8 + ((p.coords.lng - minLng) / lngRange) * 84;
    const y = single ? 50 : 8 + ((maxLat - p.coords.lat) / latRange) * 84;
    return { x, y };
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-brand-50 via-white to-sky-50 mh-grid-bg",
        className,
      )}
    >
      {/* stylised water / parks */}
      <div className="pointer-events-none absolute -left-10 top-1/3 h-40 w-72 rotate-12 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="pointer-events-none absolute bottom-6 right-8 h-32 w-48 rounded-full bg-brand-100/60 blur-2xl" />

      {properties.map((p) => {
        const { x, y } = project(p);
        const active = activeId === p.id;
        return (
          <Link
            key={p.id}
            href={`/property/${p.slug}`}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-full rounded-full border px-2 py-1 text-[11px] font-bold shadow-sm transition",
              active
                ? "z-20 scale-110 border-brand-700 bg-brand-700 text-white"
                : "z-10 border-ink-200 bg-white text-ink-900 hover:border-brand-500 hover:bg-brand-50",
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={p.title}
          >
            {priceLabel(p)}
            <span
              className={cn(
                "absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r",
                active ? "border-brand-700 bg-brand-700" : "border-ink-200 bg-white",
              )}
            />
          </Link>
        );
      })}

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-ink-600 backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-brand-600" />
        {properties.length} on map
      </div>
    </div>
  );
}
