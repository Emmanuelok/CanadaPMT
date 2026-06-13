import { CITY_DATA } from "@/lib/data/cities";

// Deterministic short-term-rental earnings model for the managed-hosting
// offering. Derived from the same city data that powers valuations, so the
// numbers stay consistent across the product. Educational estimate only.

export type SpaceType = "entire" | "suite" | "room";
export type HostPlan = "full" | "cohost";

export const HOST_PLANS: Record<HostPlan, { label: string; rate: number; blurb: string }> = {
  full: { label: "Full-service", rate: 0.2, blurb: "We run everything end-to-end — you just collect payouts." },
  cohost: { label: "Co-hosting", rate: 0.12, blurb: "You handle your own turnovers; we do listing, pricing & guests." },
};

export const SPACE_TYPES: Record<SpaceType, { label: string; adrFactor: number; usesCondoPpsf: boolean; maxBeds: number; sqft: (beds: number) => number }> = {
  entire: {
    label: "Entire home",
    adrFactor: 1,
    usesCondoPpsf: false,
    maxBeds: 5,
    sqft: (b) => [600, 600, 850, 1150, 1500, 1900][Math.min(Math.max(b, 0), 5)],
  },
  suite: {
    label: "Private suite / basement apt.",
    adrFactor: 0.72,
    usesCondoPpsf: true,
    maxBeds: 3,
    sqft: (b) => [450, 450, 650, 850][Math.min(Math.max(b, 0), 3)],
  },
  room: {
    label: "Private room",
    adrFactor: 0.5,
    usesCondoPpsf: true,
    maxBeds: 1,
    sqft: () => 280,
  },
};

export const HOST_CITIES = CITY_DATA.map((c) => c.name);

function cityMeta(city: string) {
  return CITY_DATA.find((c) => c.name === city) ?? CITY_DATA[0];
}

// Average daily rate for a 1-bed entire place, scaled off the city's housing tier.
function adrOneBed(ppsfHouse: number) {
  return Math.round((70 + ppsfHouse * 0.12) / 5) * 5;
}

function occupancy(ppsfHouse: number) {
  return Math.min(0.78, Math.max(0.55, 0.58 + (ppsfHouse - 300) / 3000));
}

export interface StrResult {
  city: string;
  adr: number;
  occupancyPct: number;
  grossMonthly: number;
  mgmtRate: number;
  mgmtFee: number;
  ownerNetMonthly: number;
  ownerNetAnnual: number;
  longTermRent: number;
  upliftMonthly: number;
}

export function estimateStr(city: string, spaceType: SpaceType, bedrooms: number, plan: HostPlan): StrResult {
  const c = cityMeta(city);
  const sp = SPACE_TYPES[spaceType];
  const beds = Math.min(Math.max(bedrooms, 0), sp.maxBeds);

  const occ = occupancy(c.ppsfHouse);
  const bedFactor = spaceType === "room" ? 1 : 1 + 0.26 * Math.max(0, beds - 1);
  const adr = Math.round((adrOneBed(c.ppsfHouse) * sp.adrFactor * bedFactor) / 5) * 5;

  const grossMonthly = Math.round(adr * 30.4 * occ);
  const rate = HOST_PLANS[plan].rate;
  const mgmtFee = Math.round(grossMonthly * rate);
  const ownerNetMonthly = grossMonthly - mgmtFee;

  // Long-term-lease comparison from the same value model used elsewhere.
  const ppsf = sp.usesCondoPpsf ? c.ppsfCondo : c.ppsfHouse;
  const longTermRent = Math.round((sp.sqft(beds) * ppsf * c.rentYield) / 12);

  return {
    city: c.name,
    adr,
    occupancyPct: Math.round(occ * 100),
    grossMonthly,
    mgmtRate: rate,
    mgmtFee,
    ownerNetMonthly,
    ownerNetAnnual: ownerNetMonthly * 12,
    longTermRent,
    upliftMonthly: ownerNetMonthly - longTermRent,
  };
}
