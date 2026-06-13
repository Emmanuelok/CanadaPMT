import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Star, Users, BedDouble, Bath, MapPin, ShieldCheck, Check, Sparkles } from "lucide-react";
import { portfolio, unitById } from "@/lib/host/portfolio";
import { getStayDetails } from "@/lib/host/stay";
import { SPACE_TYPES, HOST_PLANS } from "@/lib/str";
import { Photo } from "@/components/Photo";
import { StayBooking } from "@/components/host/StayBooking";

export function generateStaticParams() {
  return portfolio.units.map((u) => ({ id: u.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const unit = unitById(params.id);
  if (!unit) return { title: "Stay not found" };
  return {
    title: `${unit.nickname} — ${unit.city} | MapleHaus Host`,
    description: `Book ${unit.nickname}, a professionally managed short-term rental in ${unit.city}.`,
  };
}

export default function StayPage({ params }: { params: { id: string } }) {
  const unit = unitById(params.id);
  if (!unit) notFound();
  const d = getStayDetails(unit);

  return (
    <div className="mh-container py-6">
      <Link href="/host/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Gallery */}
      <div className="mt-4 grid gap-2 sm:grid-cols-[2fr_1fr]">
        <Photo seedKey={`${unit.id}-0`} kind={d.galleryKinds[0]} className="h-64 w-full rounded-2xl sm:h-[420px]" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {d.galleryKinds.slice(1, 3).map((k, i) => (
            <Photo key={i} seedKey={`${unit.id}-${i + 1}`} kind={k} className="h-32 w-full rounded-2xl sm:h-[206px]" />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Managed by MapleHaus Host
            </span>
            {unit.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {unit.rating}
                <span className="text-zinc-500">· {unit.reviews} reviews</span>
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{unit.nickname}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-zinc-400">
            <MapPin className="h-4 w-4" /> {unit.city}, {unit.province}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-brand-400" /> {SPACE_TYPES[unit.spaceType].label}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-400" /> {d.guests} guests</span>
            {unit.spaceType !== "room" && (
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-brand-400" /> {d.baths} bath{d.baths > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content + booking */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <p className="leading-relaxed text-zinc-300">{d.description}</p>

          <h2 className="mt-8 font-display text-xl font-bold text-white">What this place offers</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {d.amenities.map((a) => (
              <div key={a} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-brand-400" /> {a}
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl font-bold text-white">House rules</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {d.houseRules.map((r) => (
              <li key={r} className="flex items-center gap-2.5 text-sm text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {r}
              </li>
            ))}
          </ul>

          {d.reviews.length > 0 && (
            <>
              <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold text-white">
                <Star className="h-5 w-5 fill-amber-300 text-amber-300" /> {unit.rating} · {unit.reviews} reviews
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {d.reviews.map((rev, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-1 text-amber-300">
                      {Array.from({ length: rev.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-300" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">“{rev.text}”</p>
                    <p className="mt-3 text-xs font-semibold text-zinc-400">
                      {rev.author} · <span className="font-normal text-zinc-500">{rev.date}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck className="h-6 w-6 shrink-0 text-brand-400" />
            <div>
              <p className="font-semibold text-white">Professionally managed · {HOST_PLANS[unit.plan].label}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Vetted guests, 24/7 support, hotel-grade cleaning between every stay, and a local team on call.{" "}
                <Link href="/host" className="font-semibold text-brand-400 hover:underline">
                  List your own place →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <StayBooking adr={unit.adr} cleaningFee={d.cleaningFee} maxGuests={d.guests} nickname={unit.nickname} />
        </div>
      </div>
    </div>
  );
}
