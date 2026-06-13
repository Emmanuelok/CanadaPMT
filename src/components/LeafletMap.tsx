"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Scan } from "lucide-react";
import type { Property } from "@/types";
import { formatCAD, formatCADCompact } from "@/lib/format";
import { propertySignals } from "@/lib/signals";
import { Photo } from "@/components/Photo";

function priceLabel(p: Property): string {
  return p.listingType === "rent" ? `$${(p.price / 1000).toFixed(1)}k` : formatCADCompact(p.price);
}

// 3-band price heat colour (green → amber → red) across the visible set.
function heatColors(properties: Property[]): Record<string, string> {
  const prices = properties.map((p) => p.price).sort((a, b) => a - b);
  if (!prices.length) return {};
  const lo = prices[Math.floor(prices.length / 3)];
  const hi = prices[Math.floor((prices.length * 2) / 3)];
  const out: Record<string, string> = {};
  for (const p of properties) {
    out[p.id] = p.price <= lo ? "#059669" : p.price <= hi ? "#d97706" : "#dc2626";
  }
  return out;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(L.latLngBounds(points), { padding: [44, 44], maxZoom: 13 });
  }, [points, map]);
  return null;
}

export function LeafletMap({
  properties,
  activeId,
  onHover,
  heatmap = false,
  onBoundsSearch,
}: {
  properties: Property[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  heatmap?: boolean;
  onBoundsSearch?: (bounds: [number, number, number, number]) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const points = properties.map((p) => [p.coords.lat, p.coords.lng] as [number, number]);
  const heat = heatmap ? heatColors(properties) : {};

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={[56.13, -106.34]}
        zoom={4}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#e7efe9" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds points={points} />
        {properties.map((p) => {
          const deal = propertySignals(p).isDeal;
          const active = activeId === p.id;
          const color = heat[p.id];
          const cls = ["mh-pin", active && "mh-pin--active", deal && !color && "mh-pin--deal"]
            .filter(Boolean)
            .join(" ");
          const style = color && !active ? ` style="background:${color};border-color:${color};color:#fff"` : "";
          const icon = L.divIcon({
            html: `<div class="${cls}"${style}>${priceLabel(p)}</div>`,
            className: "",
            iconAnchor: [24, 14],
          });
          return (
            <Marker
              key={p.id}
              position={[p.coords.lat, p.coords.lng]}
              icon={icon}
              eventHandlers={{ mouseover: () => onHover?.(p.id), mouseout: () => onHover?.(null) }}
            >
              <Popup>
                <Link href={`/property/${p.slug}`} className="block no-underline">
                  <Photo seedKey={`${p.id}-0`} label={p.images[0]?.label} className="h-24 w-full" />
                  <div className="p-2.5">
                    <p className="font-display text-sm font-extrabold text-ink-900">
                      {p.listingType === "rent" ? `${formatCAD(p.price)}/mo` : formatCAD(p.price)}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-ink-700">{p.title}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">
                      {p.beds} bd · {p.baths} ba · {p.address.city}
                    </p>
                    <span className="mt-1.5 inline-block text-xs font-semibold text-brand-700">View listing →</span>
                  </div>
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {onBoundsSearch && (
        <button
          onClick={() => {
            const b = mapRef.current?.getBounds();
            if (b) onBoundsSearch([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
          }}
          className="absolute left-1/2 top-3 z-[500] inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white shadow-lift transition hover:bg-ink-800"
        >
          <Scan className="h-4 w-4" /> Search this area
        </button>
      )}

      {heatmap && (
        <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-ink-600 shadow backdrop-blur">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> lower
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> mid
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> higher
          </span>
        </div>
      )}
    </div>
  );
}
