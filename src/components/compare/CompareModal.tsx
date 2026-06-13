"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Property } from "@/types";
import { propertyById } from "@/lib/data/properties";
import { valueProperty } from "@/lib/valuation";
import { propertySignals } from "@/lib/signals";
import { neighbourhoodById } from "@/lib/data/neighbourhoods";
import { formatCAD } from "@/lib/format";
import { Photo } from "@/components/Photo";
import { cn } from "@/lib/cn";

const ROWS: { label: string; cell: (p: Property) => React.ReactNode }[] = [
  {
    label: "Price",
    cell: (p) => (
      <span className="font-bold text-ink-900">
        {p.listingType === "rent" ? `${formatCAD(p.price)}/mo` : formatCAD(p.price)}
      </span>
    ),
  },
  { label: "TrueValue estimate", cell: (p) => formatCAD(valueProperty(p).estimate) },
  {
    label: "vs estimate",
    cell: (p) => {
      const d = propertySignals(p).estimateDelta;
      return (
        <span className={cn("font-semibold", d > 0 ? "text-rose-600" : d < 0 ? "text-emerald-600" : "text-ink-500")}>
          {d > 0 ? `+${d}%` : `${d}%`}
        </span>
      );
    },
  },
  { label: "AI match", cell: (p) => `${propertySignals(p).matchScore}%` },
  { label: "Type", cell: (p) => p.propertyType },
  { label: "Beds", cell: (p) => p.beds || "—" },
  { label: "Baths", cell: (p) => p.baths || "—" },
  { label: "Interior", cell: (p) => `${p.sqft.toLocaleString("en-CA")} ft²` },
  { label: "Year built", cell: (p) => p.yearBuilt },
  { label: "Condo fee", cell: (p) => (p.maintenanceFee ? `${formatCAD(p.maintenanceFee)}/mo` : "—") },
  { label: "Neighbourhood", cell: (p) => neighbourhoodById(p.address.neighbourhoodId)?.name ?? "—" },
  { label: "Area score", cell: (p) => neighbourhoodById(p.address.neighbourhoodId)?.scores.overall ?? "—" },
];

export function CompareModal({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const props = ids.map(propertyById).filter((p): p is Property => Boolean(p));
  if (!props.length) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
          <h2 className="font-display text-lg font-extrabold text-ink-900">Compare {props.length} homes</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32 p-3" />
                {props.map((p) => (
                  <th key={p.id} className="min-w-[160px] p-3 align-top">
                    <Link href={`/property/${p.slug}`} className="block">
                      <Photo seedKey={`${p.id}-0`} label={p.images[0]?.label} className="h-24 w-full rounded-xl" />
                      <p className="mt-2 line-clamp-2 text-left text-xs font-semibold text-ink-800">{p.title}</p>
                      <p className="text-left text-[11px] text-ink-500">{p.address.city}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-ink-100">
                  <th className="bg-ink-50/50 p-3 text-left text-xs font-semibold text-ink-500">{row.label}</th>
                  {props.map((p) => (
                    <td key={p.id} className="p-3 text-ink-700">
                      {row.cell(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
