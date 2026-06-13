"use client";

import { useMemo, useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { estimateStr, HOST_CITIES, HOST_PLANS, SPACE_TYPES, type HostPlan, type SpaceType } from "@/lib/str";
import { formatCAD } from "@/lib/format";
import { cn } from "@/lib/cn";

const SPACE_ORDER: SpaceType[] = ["entire", "suite", "room"];
const PLAN_ORDER: HostPlan[] = ["full", "cohost"];

export function EarningsEstimator() {
  const [city, setCity] = useState("Toronto");
  const [spaceType, setSpaceType] = useState<SpaceType>("entire");
  const [beds, setBeds] = useState(2);
  const [plan, setPlan] = useState<HostPlan>("full");

  const maxBeds = SPACE_TYPES[spaceType].maxBeds;
  const safeBeds = Math.min(beds, maxBeds);
  const r = useMemo(() => estimateStr(city, spaceType, safeBeds, plan), [city, spaceType, safeBeds, plan]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Controls */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-display text-lg font-bold text-white">Your space</h3>

        <div className="mt-5 space-y-5">
          <Field label="City">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
            >
              {HOST_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="What are you renting?">
            <div className="grid gap-1.5">
              {SPACE_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpaceType(s)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
                    spaceType === s
                      ? "border-brand-400 bg-brand-500/15 text-white"
                      : "border-white/10 bg-night-850 text-zinc-400 hover:text-white",
                  )}
                >
                  {SPACE_TYPES[s].label}
                </button>
              ))}
            </div>
          </Field>

          {spaceType !== "room" && (
            <Field label="Bedrooms">
              <select
                value={safeBeds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
              >
                {Array.from({ length: maxBeds + 1 }, (_, i) => i).map((b) => (
                  <option key={b} value={b}>
                    {b === 0 ? "Studio" : `${b} bedroom${b > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Management plan">
            <div className="grid grid-cols-2 gap-1.5">
              {PLAN_ORDER.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                    plan === p
                      ? "border-brand-400 bg-brand-500/15 text-white"
                      : "border-white/10 bg-night-850 text-zinc-400 hover:text-white",
                  )}
                >
                  {HOST_PLANS[p].label}
                  <span className="block text-[11px] font-normal text-zinc-500">{Math.round(HOST_PLANS[p].rate * 100)}% fee</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-7 text-white shadow-lift sm:p-8">
          <p className="text-sm text-white/80">Your estimated take-home, after our {Math.round(r.mgmtRate * 100)}% fee</p>
          <p className="font-display text-5xl font-extrabold tracking-tight">
            {formatCAD(r.ownerNetMonthly)}
            <span className="text-2xl font-bold text-white/70">/mo</span>
          </p>
          <p className="mt-1 text-sm text-white/80">≈ {formatCAD(r.ownerNetAnnual)} per year</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Nightly rate" value={formatCAD(r.adr)} />
            <Stat label="Occupancy" value={`${r.occupancyPct}%`} />
            <Stat label="Gross / mo" value={formatCAD(r.grossMonthly)} />
            <Stat label="Our fee / mo" value={formatCAD(r.mgmtFee)} />
          </div>
        </div>

        {r.upliftMonthly > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
            <TrendingUp className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-emerald-100">
              That&apos;s about <span className="font-bold text-white">{formatCAD(r.upliftMonthly)}/mo more</span> than a
              standard long-term lease (~{formatCAD(r.longTermRent)}/mo) for the same space.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-sm text-zinc-400">
            Want the real number for <span className="font-semibold text-white">{r.city}</span>? We&apos;ll build a custom
            projection from comparable listings.
          </p>
          <a href="#start" className="mh-btn-primary shrink-0">
            Get my custom estimate <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="text-xs text-zinc-500">
          Educational estimate based on {r.city} market averages — nightly rates, occupancy and seasonality vary. Cleaning
          fees are billed to guests, not deducted here. Not a guarantee of income.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs text-white/70">{label}</p>
      <p className="font-display text-lg font-extrabold">{value}</p>
    </div>
  );
}
