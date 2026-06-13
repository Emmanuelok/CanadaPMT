"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { quoteStay } from "@/lib/host/stay";
import { formatCAD } from "@/lib/format";

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function StayBooking({
  adr,
  cleaningFee,
  maxGuests,
  nickname,
}: {
  adr: number;
  cleaningFee: number;
  maxGuests: number;
  nickname: string;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [today, setToday] = useState("");
  const [reserved, setReserved] = useState(false);

  // Default to the next Friday for two nights (client-only to stay hydration-safe).
  useEffect(() => {
    const now = new Date();
    setToday(iso(now));
    const start = new Date(now);
    const add = ((5 - start.getDay() + 7) % 7) || 7;
    start.setDate(start.getDate() + add);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    setCheckIn(iso(start));
    setCheckOut(iso(end));
  }, []);

  const quote = useMemo(() => quoteStay(adr, checkIn, checkOut, cleaningFee), [adr, checkIn, checkOut, cleaningFee]);

  if (reserved) {
    return (
      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="mt-4 font-display text-lg font-bold text-white">Request sent!</p>
        <p className="mt-2 text-sm text-zinc-300">
          MapleHaus will confirm your {quote.nights}-night stay at {nickname} within the hour. You won&apos;t be charged
          until it&apos;s confirmed.
        </p>
        <p className="mt-3 font-display text-2xl font-extrabold text-white">{formatCAD(quote.total)}</p>
        <button onClick={() => setReserved(false)} className="mh-btn-ghost mt-5">
          Change dates
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="font-display text-xl font-extrabold text-white">
        {formatCAD(adr)} <span className="text-sm font-medium text-zinc-400">avg / night</span>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Labelled label="Check-in">
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400 [color-scheme:dark]"
          />
        </Labelled>
        <Labelled label="Checkout">
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400 [color-scheme:dark]"
          />
        </Labelled>
      </div>
      <div className="mt-2">
        <Labelled label="Guests">
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                {g} {g === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </Labelled>
      </div>

      {quote.valid ? (
        <>
          <dl className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
            <Row label={`${formatCAD(quote.avgNightly)} × ${quote.nights} nights`} value={formatCAD(quote.subtotal)} />
            <Row label="Cleaning fee" value={formatCAD(quote.cleaningFee)} />
            <Row label="Service fee" value={formatCAD(quote.serviceFee)} />
            <div className="border-t border-white/10 pt-2.5">
              <Row label="Total" value={formatCAD(quote.total)} strong />
            </div>
          </dl>
          <button onClick={() => setReserved(true)} className="mh-btn-primary mt-5 w-full">
            Reserve
          </button>
        </>
      ) : (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm text-amber-300">{quote.error}</p>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-400" /> Managed by MapleHaus · you won&apos;t be charged yet
      </p>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-zinc-400">{label}</dt>
      <dd className={strong ? "font-display text-base font-extrabold text-white" : "font-semibold text-white"}>{value}</dd>
    </div>
  );
}
