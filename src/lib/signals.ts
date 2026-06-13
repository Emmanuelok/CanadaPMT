import type { Property } from "@/types";
import { valueProperty } from "@/lib/valuation";

// ───────────────────────────────────────────────────────────────────────────
// Listing signals — the dense, colour-coded intelligence shown on each card:
// AI match score, market position vs TrueValue, price-drop / hot / may-drop
// flags, and lifestyle tags used by the quick-filter chips.
// ───────────────────────────────────────────────────────────────────────────

export type BadgeTone = "emerald" | "rose" | "amber" | "sky" | "violet" | "slate" | "brand";

export interface Badge {
  label: string;
  tone: BadgeTone;
}

export interface PropertySignals {
  matchScore: number; // 0–100, "ranked for you"
  /** asking vs TrueValue, %. Negative = listed below the AI estimate. */
  estimateDelta: number;
  estimatePill: Badge | null;
  badges: Badge[]; // stacked status badges (top-left of the card)
  isDeal: boolean;
  reducedPct: number;
  lifestyle: string[];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const LIFESTYLE_CHIPS = [
  "Find me a deal",
  "Luxury",
  "Family-friendly",
  "Investor-grade",
  "First-time buyer",
  "Newcomer-ready",
  "Waterfront",
  "Designer-led",
  "New build",
] as const;

export function lifestyleTags(p: Property): string[] {
  const text = `${p.title} ${p.description} ${p.features.join(" ")}`.toLowerCase();
  const tags: string[] = [];
  const isSale = p.listingType !== "rent";

  if (isSale && p.price >= 1_800_000) tags.push("Luxury");
  if (p.beds >= 3 && p.propertyType !== "Condo Apartment" && p.propertyType !== "Loft") tags.push("Family-friendly");
  if (p.propertyType === "Duplex" || /income|laneway|rental|plex|mortgage.?helper|two self/.test(text)) tags.push("Investor-grade");
  if (p.newcomerFriendly) tags.push("Newcomer-ready");
  if ((isSale && p.price <= 600_000) || p.newcomerFriendly) tags.push("First-time buyer");
  if (/water|lake|marina|seawall|canal|harbour|waterfront|river/.test(text)) tags.push("Waterfront");
  if (/renovated|chef|heated|smart|design|loft|bespoke|custom|finishes/.test(text)) tags.push("Designer-led");
  if (p.yearBuilt >= 2019 || p.listingType === "preconstruction") tags.push("New build");

  return Array.from(new Set(tags));
}

export function propertySignals(p: Property): PropertySignals {
  const v = valueProperty(p);
  const isRent = p.listingType === "rent";

  // Estimate delta — for rentals, compare asking rent to modelled market rent.
  const estimateDelta = isRent
    ? v.rentEstimate > 0
      ? Number((((p.price - v.rentEstimate) / v.rentEstimate) * 100).toFixed(0))
      : 0
    : v.askingDelta;

  let estimatePill: Badge | null = null;
  if (p.listingType !== "sold") {
    const d = Math.round(estimateDelta);
    if (d <= -2) estimatePill = { label: `${Math.abs(d)}% below estimate`, tone: "emerald" };
    else if (d >= 2) estimatePill = { label: `${d}% above estimate`, tone: "rose" };
    else estimatePill = { label: "At market value", tone: "slate" };
  }

  const badges: Badge[] = [];

  // Market position
  if (p.listingType !== "sold") {
    if (estimateDelta <= -8) badges.push({ label: "Way below market", tone: "emerald" });
    else if (estimateDelta >= 9) badges.push({ label: "Above market", tone: "rose" });
  }

  // Price drop
  const first = p.priceHistory[0]?.price;
  const reducedPct =
    first && first > p.price && p.listingType !== "sold"
      ? Math.round(((first - p.price) / first) * 100)
      : 0;
  if (reducedPct >= 1) badges.push({ label: `Reduced ${reducedPct}%`, tone: "amber" });

  // Hot / may-drop
  if (p.listingType !== "sold" && p.daysOnMarket <= 12) badges.push({ label: "Hot home", tone: "rose" });
  else if (p.listingType !== "sold" && p.daysOnMarket >= 35 && estimateDelta >= 4)
    badges.push({ label: "May drop", tone: "amber" });

  // Verification / status
  if (isRent && !p.trust.ownershipVerified) badges.push({ label: "Ownership unverified", tone: "rose" });

  if (p.featured) badges.push({ label: "Featured", tone: "brand" });

  // Match score — deterministic, nudged by quality signals.
  let matchScore = 58 + (hash(p.id) % 26); // 58–83
  if (p.featured) matchScore += 7;
  if (p.trust.verifiedLister) matchScore += 4;
  if (p.daysOnMarket <= 12 && p.listingType !== "sold") matchScore += 4;
  if (estimateDelta <= -6) matchScore += 6;
  if (!p.trust.verifiedLister) matchScore -= 18;
  matchScore = clamp(matchScore, 24, 98);

  return {
    matchScore,
    estimateDelta,
    estimatePill,
    badges: badges.slice(0, 3),
    isDeal: estimateDelta <= -5 || reducedPct >= 3,
    reducedPct,
    lifestyle: lifestyleTags(p),
  };
}

export function matchesLifestyle(p: Property, chip: string): boolean {
  if (chip === "Find me a deal") return propertySignals(p).isDeal;
  return lifestyleTags(p).includes(chip);
}
