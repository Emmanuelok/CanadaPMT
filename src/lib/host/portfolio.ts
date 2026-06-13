import { mulberry32 } from "@/lib/data/cities";
import { estimateStr, type HostPlan, type SpaceType } from "@/lib/str";
import type { Province } from "@/types";

// A deterministic sample of an owner's managed short-term-rental portfolio —
// monthly payouts, upcoming bookings and operations — used to make the
// "we run it, you collect payouts" promise tangible on the Host dashboard.

const BASE = new Date("2026-06-13");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Seasonality (calendar-month indexed): Canadian STR demand peaks in summer with
// a December holiday bump; winter shoulders are softer.
const OCC_SEASON = [0.82, 0.8, 0.85, 0.92, 0.98, 1.08, 1.15, 1.14, 1.02, 0.95, 0.88, 0.96];
export const PRICE_SEASON = [0.92, 0.9, 0.93, 0.98, 1.02, 1.1, 1.18, 1.16, 1.04, 0.98, 0.94, 1.06];

const PLATFORMS: { name: string; weight: number }[] = [
  { name: "Airbnb", weight: 0.6 },
  { name: "Vrbo", weight: 0.25 },
  { name: "Booking.com", weight: 0.15 },
];
const GUESTS = ["Sarah & Tom", "The Nguyen family", "Marc Dubois", "Aisha K.", "James P.", "Priya & Raj", "Chen family", "Olivia R.", "The Murphys", "Diego S.", "Hannah L.", "Yuki T.", "Fatima & Sam", "Ben Carter", "Sofia M."];
const MAINTENANCE = ["Dishwasher service call", "Repaint scuffed hallway", "Replace HVAC filter", "Fix dripping faucet", "Smart-lock battery swap", "Annual furnace inspection", "Regrout master bath", "Patio furniture restock"];

export interface MonthStat {
  key: string;
  label: string;
  gross: number;
  fee: number;
  net: number;
  nights: number;
  occupancyPct: number;
}
export interface Booking {
  id: string;
  unitId: string;
  unitNickname: string;
  platform: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightly: number;
  payout: number;
  status: "Confirmed";
}
export interface Task {
  id: string;
  unitId: string;
  unitNickname: string;
  kind: "cleaning" | "maintenance";
  title: string;
  due: string;
  status: "Scheduled" | "Open" | "In progress" | "Booked";
}
export interface HostUnit {
  id: string;
  nickname: string;
  city: string;
  province: Province;
  spaceType: SpaceType;
  bedrooms: number;
  plan: HostPlan;
  rate: number;
  status: "Active" | "Onboarding";
  rating: number;
  reviews: number;
  adr: number;
  thumbKind: "exterior" | "living" | "bedroom";
  months: MonthStat[];
  bookings: Booking[];
  tasks: Task[];
}

interface Seed {
  id: string;
  nickname: string;
  city: string;
  province: Province;
  spaceType: SpaceType;
  bedrooms: number;
  plan: HostPlan;
  status: "Active" | "Onboarding";
}

const SEEDS: Seed[] = [
  { id: "u-yorkville", nickname: "Yorkville 2BR Loft", city: "Toronto", province: "ON", spaceType: "entire", bedrooms: 2, plan: "full", status: "Active" },
  { id: "u-glebe", nickname: "The Glebe Garden Suite", city: "Ottawa", province: "ON", spaceType: "suite", bedrooms: 1, plan: "full", status: "Active" },
  { id: "u-okanagan", nickname: "Okanagan Lake House", city: "Kelowna", province: "BC", spaceType: "entire", bedrooms: 3, plan: "cohost", status: "Active" },
  { id: "u-plateau", nickname: "Plateau Pied-à-terre", city: "Montreal", province: "QC", spaceType: "room", bedrooms: 1, plan: "full", status: "Onboarding" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function iso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function pickWeighted(rng: () => number, opts: { name: string; weight: number }[]) {
  let r = rng();
  for (const o of opts) {
    if (r < o.weight) return o.name;
    r -= o.weight;
  }
  return opts[0].name;
}

function buildUnit(seed: Seed): HostUnit {
  const est = estimateStr(seed.city, seed.spaceType, seed.bedrooms, seed.plan);
  const rng = mulberry32(`unit-${seed.id}`);
  const baseAdr = est.adr;
  const baseOcc = est.occupancyPct / 100;
  const rate = est.mgmtRate;

  // 12 trailing months: Jul 2025 → Jun 2026.
  const months: MonthStat[] = [];
  for (let k = 0; k < 12; k++) {
    const m = (6 + k) % 12;
    const year = 2025 + Math.floor((6 + k) / 12);
    const mr = mulberry32(`${seed.id}-m-${k}`);
    const onboarding = seed.status === "Onboarding" && k < 11; // onboarding unit only just went live
    const occ = onboarding ? 0 : Math.min(0.98, Math.max(0.35, baseOcc * OCC_SEASON[m] * (0.94 + mr() * 0.12)));
    const adrM = baseAdr * PRICE_SEASON[m] * (0.95 + mr() * 0.1);
    const nights = Math.round(30.4 * occ);
    const gross = Math.round(adrM * nights);
    const fee = Math.round(gross * rate);
    months.push({ key: `${year}-${pad(m + 1)}`, label: MONTHS[m], gross, fee, net: gross - fee, nights, occupancyPct: Math.round(occ * 100) });
  }

  // Upcoming bookings from "today" forward (skip for onboarding units).
  const bookings: Booking[] = [];
  if (seed.status === "Active") {
    let cursor = addDays(BASE, 1 + Math.floor(rng() * 4));
    for (let j = 0; j < 9; j++) {
      const gap = Math.floor(rng() * 4);
      const nights = 2 + Math.floor(rng() * 6);
      const checkIn = addDays(cursor, gap);
      if (checkIn > addDays(BASE, 95)) break;
      const checkOut = addDays(checkIn, nights);
      const nightly = Math.round((baseAdr * (0.92 + rng() * 0.22)) / 5) * 5;
      bookings.push({
        id: `${seed.id}-b${j}`,
        unitId: seed.id,
        unitNickname: seed.nickname,
        platform: pickWeighted(rng, PLATFORMS),
        guest: GUESTS[Math.floor(rng() * GUESTS.length)],
        checkIn: iso(checkIn),
        checkOut: iso(checkOut),
        nights,
        nightly,
        payout: Math.round(nights * nightly * (1 - rate)),
        status: "Confirmed",
      });
      cursor = checkOut;
    }
  }

  // Operations: a cleaning after each of the next few checkouts + occasional maintenance.
  const tasks: Task[] = [];
  bookings.slice(0, 3).forEach((b, i) => {
    tasks.push({
      id: `${seed.id}-clean-${i}`,
      unitId: seed.id,
      unitNickname: seed.nickname,
      kind: "cleaning",
      title: `Turnover clean after ${b.guest}`,
      due: b.checkOut,
      status: "Scheduled",
    });
  });
  if (rng() < 0.7) {
    tasks.push({
      id: `${seed.id}-mtn`,
      unitId: seed.id,
      unitNickname: seed.nickname,
      kind: "maintenance",
      title: MAINTENANCE[Math.floor(rng() * MAINTENANCE.length)],
      due: iso(addDays(BASE, 2 + Math.floor(rng() * 18))),
      status: rng() < 0.5 ? "Open" : "In progress",
    });
  }

  return {
    ...seed,
    rate,
    rating: seed.status === "Onboarding" ? 0 : Math.round((4.6 + rng() * 0.35) * 100) / 100,
    reviews: seed.status === "Onboarding" ? 0 : 18 + Math.floor(rng() * 160),
    adr: baseAdr,
    thumbKind: seed.spaceType === "entire" ? "exterior" : seed.spaceType === "suite" ? "living" : "bedroom",
    months,
    bookings,
    tasks,
  };
}

export const portfolio = {
  owner: { name: "Jordan Avery", since: "2024", email: "jordan@example.com" },
  units: SEEDS.map(buildUnit),
};

export const unitById = (id: string): HostUnit | undefined => portfolio.units.find((u) => u.id === id);

// ── Aggregation over an arbitrary subset of units ────────────────────────────
export interface Aggregate {
  months: MonthStat[];
  ytdNet: number;
  trailing12Net: number;
  occupancyPct: number;
  avgAdr: number;
  rating: number;
  reviews: number;
  nightsNext30: number;
  nextPayout: { amount: number; date: string };
  bookings: Booking[];
  tasks: Task[];
  activeUnits: number;
}

export function aggregate(units: HostUnit[]): Aggregate {
  const n = Math.max(1, units.length);
  const months: MonthStat[] = MONTHS.map(() => ({ key: "", label: "", gross: 0, fee: 0, net: 0, nights: 0, occupancyPct: 0 }));
  units.forEach((u) =>
    u.months.forEach((m, i) => {
      months[i].key = m.key;
      months[i].label = m.label;
      months[i].gross += m.gross;
      months[i].fee += m.fee;
      months[i].net += m.net;
      months[i].nights += m.nights;
    }),
  );
  months.forEach((m) => (m.occupancyPct = Math.round(m.nights / (n * 30.4) * 100)));

  const ytdNet = months.filter((m) => m.key.startsWith("2026")).reduce((a, m) => a + m.net, 0);
  const trailing12Net = months.reduce((a, m) => a + m.net, 0);

  const bookings = units.flatMap((u) => u.bookings).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const tasks = units.flatMap((u) => u.tasks).sort((a, b) => a.due.localeCompare(b.due));

  const in30 = iso(addDays(BASE, 30));
  const nightsNext30 = bookings.filter((b) => b.checkIn <= in30).reduce((a, b) => a + b.nights, 0);

  const ratedUnits = units.filter((u) => u.reviews > 0);
  const reviews = ratedUnits.reduce((a, u) => a + u.reviews, 0);
  const rating = reviews ? Math.round((ratedUnits.reduce((a, u) => a + u.rating * u.reviews, 0) / reviews) * 100) / 100 : 0;

  return {
    months,
    ytdNet,
    trailing12Net,
    occupancyPct: months[11].occupancyPct,
    avgAdr: Math.round(units.reduce((a, u) => a + u.adr, 0) / n),
    rating,
    reviews,
    nightsNext30,
    nextPayout: { amount: months[11].net, date: "Jul 1, 2026" },
    bookings,
    tasks,
    activeUnits: units.filter((u) => u.status === "Active").length,
  };
}
