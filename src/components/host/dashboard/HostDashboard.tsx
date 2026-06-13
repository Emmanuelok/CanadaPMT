"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  Star,
  BedDouble,
  Sparkles,
  Wrench,
  Brush,
  MapPin,
  Percent,
  ArrowUpRight,
  LineChart,
  MessageSquare,
  Receipt,
} from "lucide-react";
import { portfolio, aggregate, type HostUnit } from "@/lib/host/portfolio";
import { HOST_PLANS, SPACE_TYPES } from "@/lib/str";
import { formatCAD, formatCADCompact } from "@/lib/format";
import { Photo } from "@/components/Photo";
import { RevenueBars, Sparkline } from "@/components/host/dashboard/charts";
import { cn } from "@/lib/cn";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDay(isoDate: string) {
  const [, m, d] = isoDate.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}`;
}
const PLATFORM_STYLE: Record<string, string> = {
  Airbnb: "bg-rose-500/15 text-rose-300",
  Vrbo: "bg-sky-500/15 text-sky-300",
  "Booking.com": "bg-indigo-500/15 text-indigo-300",
};

export function HostDashboard() {
  const units = portfolio.units;
  const [selected, setSelected] = useState<string>("all");
  const view = useMemo(() => (selected === "all" ? units : units.filter((u) => u.id === selected)), [selected, units]);
  const agg = useMemo(() => aggregate(view), [view]);

  const grossT12 = agg.months.reduce((a, m) => a + m.gross, 0);
  const feeT12 = agg.months.reduce((a, m) => a + m.fee, 0);
  const occSeries = agg.months.map((m) => m.occupancyPct);
  const bookings = agg.bookings.slice(0, 8);
  const cleanings = agg.tasks.filter((t) => t.kind === "cleaning");
  const maintenance = agg.tasks.filter((t) => t.kind === "maintenance");
  const recentPayouts = [...agg.months].slice(-6).reverse();
  const currentKey = agg.months[agg.months.length - 1].key;

  return (
    <div className="mh-container py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-400">MapleHaus Host · Owner dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, {portfolio.owner.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-zinc-400">
            {units.length} properties under management · with MapleHaus since {portfolio.owner.since}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-brand-400/20 bg-brand-500/10 px-5 py-3">
          <Wallet className="h-7 w-7 text-brand-300" />
          <div>
            <p className="text-xs text-zinc-300">Next payout · {agg.nextPayout.date}</p>
            <p className="font-display text-2xl font-extrabold text-white">{formatCAD(agg.nextPayout.amount)}</p>
          </div>
        </div>
      </div>

      {/* Property filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill active={selected === "all"} onClick={() => setSelected("all")}>
          All properties
        </FilterPill>
        {units.map((u) => (
          <FilterPill key={u.id} active={selected === u.id} onClick={() => setSelected(u.id)}>
            {u.nickname}
          </FilterPill>
        ))}
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={TrendingUp}
          label="Net income · 2026 YTD"
          value={formatCAD(agg.ytdNet)}
          sub={`Trailing 12mo ${formatCADCompact(agg.trailing12Net)}`}
        />
        <Kpi icon={Percent} label="Occupancy · this month" value={`${agg.occupancyPct}%`}>
          <Sparkline values={occSeries} className="mt-2 h-7 w-full" />
        </Kpi>
        <Kpi icon={Wallet} label="Avg nightly rate" value={formatCAD(agg.avgAdr)} sub="Blended across stays" />
        <Kpi
          icon={CalendarDays}
          label="Nights booked · next 30d"
          value={String(agg.nightsNext30)}
          sub={`${agg.bookings.length} upcoming reservations`}
        />
      </div>

      {/* Revenue + breakdown */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Revenue · last 12 months</h2>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-brand-400" /> Your net
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-white/20" /> Our fee
              </span>
            </div>
          </div>
          <div className="mt-4">
            <RevenueBars months={agg.months} />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-bold text-white">Where it goes</h2>
          <p className="mt-1 text-xs text-zinc-500">Trailing 12 months</p>
          <dl className="mt-4 space-y-3">
            <Row label="Gross booking revenue" value={formatCAD(grossT12)} />
            <Row label="MapleHaus management" value={`− ${formatCAD(feeT12)}`} muted />
            <div className="border-t border-white/10 pt-3">
              <Row label="Your net payout" value={formatCAD(agg.trailing12Net)} strong />
            </div>
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500/10 px-3 py-2.5 text-xs text-brand-200">
            <Star className="h-4 w-4 shrink-0 fill-brand-300 text-brand-300" />
            {agg.rating ? (
              <span>
                {agg.rating}★ average across {agg.reviews} guest reviews
              </span>
            ) : (
              <span>New listing — reviews build after the first stays</span>
            )}
          </div>
        </div>
      </div>

      {/* Active automations */}
      <div className="mt-6 rounded-3xl border border-brand-400/20 bg-brand-500/[0.06] p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Sparkles className="h-4 w-4 text-brand-300" /> Active automations
          </h2>
          <Link href="/autopilot" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Manage in Autopilot →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Dynamic Pricing", Icon: LineChart, status: "Re-priced your calendar tonight" },
            { name: "Turnover Agent", Icon: Brush, status: `${cleanings.length} cleanings scheduled` },
            { name: "Guest Concierge", Icon: MessageSquare, status: `${agg.bookings.length * 2} guest messages handled` },
            { name: "Payout Agent", Icon: Receipt, status: `Next payout ${agg.nextPayout.date}` },
          ].map(({ name, Icon, status }) => (
            <Link key={name} href="/autopilot" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-brand-300" />
                <span className="text-sm font-semibold text-white">{name}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">{status}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Properties */}
      <h2 className="mt-10 font-display text-xl font-bold text-white">Your properties</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((u) => (
          <UnitCard key={u.id} unit={u} active={selected === u.id} />
        ))}
      </div>

      {/* Bookings + operations */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Upcoming bookings</h2>
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {bookings.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-zinc-500">No upcoming bookings for this selection.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <span className={cn("hidden shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold sm:inline-flex", PLATFORM_STYLE[b.platform])}>
                      {b.platform}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{b.guest}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {fmtDay(b.checkIn)} → {fmtDay(b.checkOut)} · {b.nights} nights
                        {selected === "all" ? ` · ${b.unitNickname}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-white">{formatCAD(b.payout)}</p>
                      <p className="text-[11px] text-emerald-400">{b.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-white">Operations</h2>
          <div className="mt-4 space-y-4">
            <OpsCard icon={Brush} title="Cleanings & turnovers" tasks={cleanings} accent="text-sky-300" />
            <OpsCard icon={Wrench} title="Maintenance" tasks={maintenance} accent="text-amber-300" />
          </div>
        </div>
      </div>

      {/* Payout history */}
      <h2 className="mt-10 font-display text-xl font-bold text-white">Recent payouts</h2>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-5 py-3 font-semibold">Month</th>
              <th className="px-5 py-3 font-semibold">Occupancy</th>
              <th className="px-5 py-3 font-semibold">Gross</th>
              <th className="px-5 py-3 font-semibold">Our fee</th>
              <th className="px-5 py-3 font-semibold">Your net</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentPayouts.map((m) => {
              const pending = m.key === currentKey;
              return (
                <tr key={m.key}>
                  <td className="px-5 py-3 font-medium text-white">{m.label} {m.key.startsWith("2025") ? "’25" : "’26"}</td>
                  <td className="px-5 py-3 text-zinc-300">{m.occupancyPct}%</td>
                  <td className="px-5 py-3 text-zinc-300">{formatCAD(m.gross)}</td>
                  <td className="px-5 py-3 text-zinc-500">− {formatCAD(m.fee)}</td>
                  <td className="px-5 py-3 font-bold text-white">{formatCAD(m.net)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        pending ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300",
                      )}
                    >
                      {pending ? "Projected" : "Paid"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Sample portfolio for demonstration. Figures are modelled estimates, not actual transactions.
      </p>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
        active ? "border-brand-400 bg-brand-500/15 text-white" : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="h-4 w-4 text-brand-400" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      {children}
    </div>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className={cn("text-sm", strong ? "font-display text-lg font-extrabold text-white" : muted ? "text-zinc-500" : "font-semibold text-white")}>
        {value}
      </dd>
    </div>
  );
}

function UnitCard({ unit, active }: { unit: HostUnit; active: boolean }) {
  const last = unit.months[unit.months.length - 1];
  return (
    <Link
      href={`/host/stay/${unit.id}`}
      className={cn(
        "group block overflow-hidden rounded-3xl border bg-white/[0.03] text-left transition",
        active ? "border-brand-400 ring-1 ring-brand-400/40" : "border-white/10 hover:border-white/20",
      )}
    >
      <div className="relative h-36 w-full">
        <Photo seedKey={unit.id} kind={unit.thumbKind} className="h-full w-full" />
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            unit.status === "Active" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white",
          )}
        >
          {unit.status}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-bold text-white">{unit.nickname}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3 w-3" /> {unit.city}, {unit.province} · <BedDouble className="h-3 w-3" />{" "}
          {SPACE_TYPES[unit.spaceType].label}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500">Net · last month</p>
            <p className="font-display text-xl font-extrabold text-white">
              {unit.status === "Active" ? formatCAD(last.net) : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Occupancy</p>
            <p className="font-semibold text-white">{unit.status === "Active" ? `${last.occupancyPct}%` : "Soon"}</p>
          </div>
        </div>

        <div className="mt-3">
          <Sparkline values={unit.months.map((m) => m.net)} className="h-7 w-full" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 font-semibold text-zinc-300">
            <Sparkles className="h-3 w-3 text-brand-400" /> {HOST_PLANS[unit.plan].label} · {Math.round(unit.rate * 100)}%
          </span>
          {unit.rating > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-zinc-300">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {unit.rating} ({unit.reviews})
            </span>
          )}
        </div>

        <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-400 opacity-0 transition group-hover:opacity-100">
          View public listing <ArrowUpRight className="h-3 w-3" />
        </p>
      </div>
    </Link>
  );
}

function OpsCard({
  icon: Icon,
  title,
  tasks,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tasks: { id: string; title: string; due: string; status: string; unitNickname: string }[];
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
        <Icon className={cn("h-4 w-4", accent)} /> {title}
      </h3>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">All clear — nothing scheduled.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {tasks.slice(0, 5).map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-200">{t.title}</p>
                <p className="text-xs text-zinc-500">
                  {fmtDay(t.due)} · {t.unitNickname}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300">{t.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
