import Link from "next/link";
import { LineChart, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Property } from "@/types";
import { valueProperty } from "@/lib/valuation";
import { propertyById } from "@/lib/data/properties";
import { Pill } from "@/components/ui";
import { formatCAD, formatCADCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ValuationPanel({ property }: { property: Property }) {
  const v = valueProperty(property);
  const isRent = property.listingType === "rent";

  // Position markers within the [low, high] band.
  const span = Math.max(1, v.high - v.low);
  const pct = (val: number) => Math.max(0, Math.min(100, ((val - v.low) / span) * 100));
  const askingPct = pct(property.price);

  const comparables = v.comparableIds
    .map((id) => propertyById(id))
    .filter((p): p is Property => Boolean(p))
    .slice(0, 3);

  return (
    <section className="mh-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <LineChart className="h-4 w-4" />
          </span>
          TrueValue AI estimate
        </h2>
        <Pill tone="brand">{v.confidence}% confidence</Pill>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-sm text-ink-500">Estimated {isRent ? "value" : "market value"}</p>
          <p className="font-display text-4xl font-extrabold text-ink-900">{formatCAD(v.estimate)}</p>
        </div>
        {!isRent && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
              Math.abs(v.askingDelta) < 2
                ? "bg-ink-100 text-ink-600"
                : v.askingDelta > 0
                  ? "bg-maple-50 text-maple-700"
                  : "bg-brand-50 text-brand-700",
            )}
          >
            {v.askingDelta > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            Listed {v.askingDelta > 0 ? `${v.askingDelta}% above` : `${Math.abs(v.askingDelta)}% below`} estimate
          </div>
        )}
      </div>

      {/* Range bar */}
      <div className="mt-6">
        <div className="relative h-2.5 rounded-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200">
          {!isRent && (
            <div
              className="absolute -top-1.5 z-10 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${askingPct}%` }}
            >
              <span className="h-5 w-0.5 bg-ink-900" />
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-ink-500">
          <span>{formatCADCompact(v.low)}</span>
          <span className="text-brand-700">Estimate {formatCADCompact(v.estimate)}</span>
          <span>{formatCADCompact(v.high)}</span>
        </div>
        {!isRent && (
          <p className="mt-1 text-center text-xs text-ink-500">
            ▲ Asking price {formatCAD(property.price)}
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Price / sq ft" value={`$${v.pricePerSqft.toLocaleString("en-CA")}`} />
        <Metric label="Est. monthly rent" value={`${formatCAD(v.rentEstimate)}`} />
        <Metric label="Comparables used" value={`${v.comparableIds.length}`} />
      </div>

      {/* Drivers */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-ink-700">What drives this estimate</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {v.drivers.map((d) => (
            <span
              key={d.label}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                d.impact > 0
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : d.impact < 0
                    ? "border-maple-200 bg-maple-50 text-maple-700"
                    : "border-ink-200 bg-ink-50 text-ink-600",
              )}
            >
              {d.label}
              {d.impact !== 0 && <span className="font-bold">{d.impact > 0 ? `+${d.impact}%` : `${d.impact}%`}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Comparables */}
      {comparables.length > 0 && (
        <div className="mt-6 border-t border-ink-100 pt-5">
          <p className="text-sm font-semibold text-ink-700">Comparable listings</p>
          <div className="mt-2 space-y-2">
            {comparables.map((c) => (
              <Link
                key={c.id}
                href={`/property/${c.slug}`}
                className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2 text-sm transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <span className="line-clamp-1 text-ink-700">{c.title}</span>
                <span className="ml-3 shrink-0 font-semibold text-ink-900">
                  {c.listingType === "sold" ? "Sold " : ""}
                  {formatCADCompact(c.price)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 flex items-start gap-1.5 text-xs text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        TrueValue blends living area, location, condition, comparable sales and neighbourhood momentum. It&apos;s an
        estimate, not an appraisal —{" "}
        <Link href="/valuation" className="mh-link">
          see how it works
        </Link>
        .
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3 text-center">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-0.5 font-display text-lg font-extrabold text-ink-900">{value}</p>
    </div>
  );
}
