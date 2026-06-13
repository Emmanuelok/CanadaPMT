"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Property } from "@/types";
import { formatCAD, formatCADCompact } from "@/lib/format";
import { propertySignals } from "@/lib/signals";
import { PropertyScene } from "@/components/PropertyScene";

function priceLabel(p: Property): string {
  return p.listingType === "rent" ? `$${(p.price / 1000).toFixed(1)}k` : formatCADCompact(p.price);
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [44, 44], maxZoom: 13 });
    }
  }, [points, map]);
  return null;
}

export function LeafletMap({
  properties,
  activeId,
  onHover,
}: {
  properties: Property[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
}) {
  const points = properties.map((p) => [p.coords.lat, p.coords.lng] as [number, number]);

  return (
    <MapContainer
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
        const icon = L.divIcon({
          html: priceLabel(p),
          className: `mh-pin ${active ? "mh-pin--active" : ""} ${deal ? "mh-pin--deal" : ""}`,
          iconAnchor: [24, 14],
        });
        return (
          <Marker
            key={p.id}
            position={[p.coords.lat, p.coords.lng]}
            icon={icon}
            eventHandlers={{
              mouseover: () => onHover?.(p.id),
              mouseout: () => onHover?.(null),
            }}
          >
            <Popup>
              <Link href={`/property/${p.slug}`} className="block no-underline">
                <PropertyScene seedKey={`${p.id}-0`} label={p.images[0]?.label} className="h-24 w-full" />
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
  );
}
