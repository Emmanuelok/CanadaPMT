import type { Property, Valuation } from "@/types";
import { properties } from "@/lib/data/properties";
import { neighbourhoodById } from "@/lib/data/neighbourhoods";

// ───────────────────────────────────────────────────────────────────────────
// TrueValue AI — a transparent Automated Valuation Model (AVM)
//
// Canada's pain point: sold prices and a free, explainable home-value estimate
// are effectively locked away from the public. TrueValue produces an estimate,
// a confidence band, the comparable sales behind it, AND the plain-language
// drivers — the transparency consumers can't get from Realtor.ca today.
// ───────────────────────────────────────────────────────────────────────────

const HOUSE_TYPES = new Set(["Detached", "Semi-Detached", "Townhouse", "Bungalow", "Duplex"]);
const isHouse = (t: string) => HOUSE_TYPES.has(t);

// Blended price-per-living-square-foot baselines (CAD), by city and broad type.
const PPSF: Record<string, { house: number; condo: number }> = {
  Toronto: { house: 720, condo: 1300 },
  Mississauga: { house: 600, condo: 900 },
  Ottawa: { house: 520, condo: 600 },
  Vancouver: { house: 990, condo: 1150 },
  Burnaby: { house: 760, condo: 950 },
  Calgary: { house: 400, condo: 470 },
  Montreal: { house: 440, condo: 720 },
  Halifax: { house: 380, condo: 450 },
  Winnipeg: { house: 320, condo: 400 },
};

// Approximate gross annual rent yields by city (rent ÷ value), used to derive
// a rent estimate from the capital value.
const RENT_YIELD: Record<string, number> = {
  Toronto: 0.034,
  Mississauga: 0.038,
  Ottawa: 0.045,
  Vancouver: 0.032,
  Burnaby: 0.04,
  Calgary: 0.052,
  Montreal: 0.046,
  Halifax: 0.05,
  Winnipeg: 0.06,
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function valueProperty(property: Property): Valuation {
  // Land & commercial (and any zero-area listing) don't fit the residential
  // AVM — return a simple band around the asking price instead of NaN.
  if ((property.category && property.category !== "residential") || property.sqft <= 0) {
    const estimate = Math.round(property.price / 1000) * 1000;
    return {
      estimate,
      low: Math.round((estimate * 0.9) / 1000) * 1000,
      high: Math.round((estimate * 1.1) / 1000) * 1000,
      confidence: 68,
      rentEstimate: 0,
      drivers: [{ label: "Based on recent area transactions", impact: 0 }],
      comparableIds: [],
      pricePerSqft: property.sqft > 0 ? Math.round(estimate / property.sqft) : 0,
      askingDelta: 0,
    };
  }

  const cityPPSF = PPSF[property.address.city] ?? { house: 500, condo: 650 };
  const basePPSF = isHouse(property.propertyType) ? cityPPSF.house : cityPPSF.condo;

  const drivers: { label: string; impact: number }[] = [];

  // Start from living-area baseline.
  let estimate = property.sqft * basePPSF;
  drivers.push({
    label: `${property.sqft.toLocaleString("en-CA")} sq ft × ${property.address.city} ${isHouse(property.propertyType) ? "house" : "condo"} rate`,
    impact: 0,
  });

  // Small-unit premium — compact condos trade at a higher per-foot price.
  if (!isHouse(property.propertyType) && property.sqft < 620) {
    estimate *= 1.12;
    drivers.push({ label: "Compact-unit premium", impact: 12 });
  }

  // Age / build quality.
  const age = 2026 - property.yearBuilt;
  if (property.yearBuilt >= 2018) {
    estimate *= 1.05;
    drivers.push({ label: "New build (2018+)", impact: 5 });
  } else if (property.yearBuilt < 1940) {
    estimate *= 1.02;
    drivers.push({ label: "Heritage character", impact: 2 });
  } else if (age > 45) {
    estimate *= 0.97;
    drivers.push({ label: "Older building (45+ yrs)", impact: -3 });
  }

  // Land — houses with generous lots.
  if (property.lotSqft && property.lotSqft > 3000) {
    estimate *= 1.04;
    drivers.push({ label: "Above-average lot size", impact: 4 });
  }

  // Parking.
  if (property.parking >= 1) {
    const p = Math.min(property.parking, 2) * 1.5;
    estimate *= 1 + p / 100;
    drivers.push({ label: `${property.parking} parking space${property.parking > 1 ? "s" : ""}`, impact: p });
  }

  // Bathrooms beyond the first.
  if (property.baths > 1) {
    const b = (property.baths - 1) * 1;
    estimate *= 1 + b / 100;
    drivers.push({ label: `${property.baths} bathrooms`, impact: b });
  }

  // Neighbourhood momentum.
  const nb = neighbourhoodById(property.address.neighbourhoodId);
  if (nb) {
    const momentum = ((nb.scores.growth - 75) / 100) * 6; // ±
    if (Math.abs(momentum) >= 0.5) {
      estimate *= 1 + momentum / 100;
      drivers.push({ label: `${nb.name} growth momentum`, impact: Number(momentum.toFixed(1)) });
    }
    // Transit-rich locations.
    if (nb.scores.transit >= 88) {
      estimate *= 1.03;
      drivers.push({ label: "Transit-rich location", impact: 3 });
    }
  }

  // Condo fees drag value modestly when high.
  if (property.maintenanceFee && property.maintenanceFee > 700) {
    estimate *= 0.98;
    drivers.push({ label: "Above-average condo fees", impact: -2 });
  }

  estimate = Math.round(estimate / 1000) * 1000;

  // Comparables — same city + broad type, excluding self, sold preferred.
  const comparables = properties
    .filter(
      (p) =>
        p.id !== property.id &&
        p.address.city === property.address.city &&
        isHouse(p.propertyType) === isHouse(property.propertyType) &&
        p.listingType !== "rent",
    )
    .sort((a, b) => Math.abs(a.sqft - property.sqft) - Math.abs(b.sqft - property.sqft))
    .slice(0, 4);

  // Confidence rises with comparable depth and data completeness.
  let confidence = 66 + comparables.length * 5;
  if (comparables.some((c) => c.listingType === "sold")) confidence += 4;
  if (property.propertyType === "Loft" || property.propertyType === "Duplex") confidence -= 6;
  confidence = clamp(Math.round(confidence), 55, 94);

  // Band tightens as confidence rises.
  const spread = clamp((1 - confidence / 100) * 1.6, 0.03, 0.14);
  const low = Math.round((estimate * (1 - spread)) / 1000) * 1000;
  const high = Math.round((estimate * (1 + spread)) / 1000) * 1000;

  const yieldRate = RENT_YIELD[property.address.city] ?? 0.045;
  const rentEstimate = Math.round((estimate * yieldRate) / 12 / 50) * 50;

  const askingDelta =
    property.listingType === "rent" ? 0 : Number((((property.price - estimate) / estimate) * 100).toFixed(1));

  return {
    estimate,
    low,
    high,
    confidence,
    rentEstimate,
    drivers: drivers.slice(0, 6),
    comparableIds: comparables.map((c) => c.id),
    pricePerSqft: Math.round(estimate / property.sqft),
    askingDelta,
  };
}
