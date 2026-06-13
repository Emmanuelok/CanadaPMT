// ───────────────────────────────────────────────────────────────────────────
// MapleHaus core domain types
// ───────────────────────────────────────────────────────────────────────────

export type Province =
  | "ON"
  | "BC"
  | "AB"
  | "QC"
  | "MB"
  | "NS"
  | "SK";

export type ListingType = "sale" | "rent" | "preconstruction" | "sold";

export type PropertyType =
  | "Detached"
  | "Semi-Detached"
  | "Townhouse"
  | "Condo Apartment"
  | "Bungalow"
  | "Loft"
  | "Duplex";

export type ScamRisk = "low" | "medium" | "high";

export interface PriceEvent {
  date: string; // ISO
  price: number;
  event: "Listed" | "Price change" | "Sold" | "Relisted" | "Delisted";
}

export interface PropertyPhoto {
  label: string;
}

export interface TrustSignals {
  /** Identity of the lister has been verified by MapleHaus. */
  verifiedLister: boolean;
  /** For rentals: ownership/title cross-checked against land registry. */
  ownershipVerified: boolean;
  /** Photos passed reverse-image / duplicate-listing checks. */
  photosVerified: boolean;
  /** Price is within a sane band of the AI valuation. */
  priceSane: boolean;
  /** Number of other live platforms this exact unit appears on (duplication is a scam signal for rentals). */
  duplicateListings: number;
}

export interface Property {
  id: string;
  slug: string;
  listingType: ListingType;
  propertyType: PropertyType;
  title: string;
  address: {
    street: string;
    city: string;
    province: Province;
    postalCode: string;
    neighbourhoodId: string;
  };
  coords: { lat: number; lng: number };
  /** Asking price (CAD) for sale/preconstruction; monthly rent for rentals. */
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft?: number;
  parking: number;
  yearBuilt: number;
  description: string;
  features: string[];
  images: PropertyPhoto[];
  priceHistory: PriceEvent[];
  daysOnMarket: number;
  listedDate: string; // ISO
  maintenanceFee?: number; // monthly, condos
  propertyTaxAnnual?: number;
  openHouse?: string;
  agentId: string;
  trust: TrustSignals;
  /** True when the seller has opted into MapleHaus OfferIQ transparent bidding. */
  transparentBidding: boolean;
  /** Newcomer-friendly: lister accepts alternative credit / guarantor programs. */
  newcomerFriendly: boolean;
  mls: string;
  featured?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  brokerage: string;
  city: string;
  province: Province;
  rating: number; // 0–5
  reviewsCount: number;
  dealsClosed12mo: number;
  /** Average % of list price achieved for sellers — a real performance signal. */
  listToSoldRatio: number;
  avgDaysOnMarket: number;
  specialties: string[];
  languages: string[];
  verified: boolean;
  trustScore: number; // 0–100
  responseTimeHours: number;
  bio: string;
}

export interface NeighbourhoodScores {
  overall: number;
  schools: number;
  transit: number;
  safety: number;
  walkability: number;
  affordability: number;
  growth: number;
  /** Higher = more resilient to flood/wildfire/heat risk. */
  climateResilience: number;
}

export interface Neighbourhood {
  id: string;
  name: string;
  city: string;
  province: Province;
  scores: NeighbourhoodScores;
  medianPrice: number;
  medianRent: number;
  priceYoY: number; // %, can be negative
  inventory: number;
  avgDaysOnMarket: number;
  summary: string;
  highlights: string[];
}

// ── Derived / computed shapes (not stored) ────────────────────────────────

export interface Valuation {
  estimate: number;
  low: number;
  high: number;
  confidence: number; // 0–100
  rentEstimate: number;
  /** Plain-language drivers behind the number. */
  drivers: { label: string; impact: number }[];
  comparableIds: string[];
  pricePerSqft: number;
  /** asking vs estimate, % (positive = listed above AI value). */
  askingDelta: number;
}

export interface AffordabilityResult {
  maxPurchasePrice: number;
  maxMortgage: number;
  monthlyPayment: number;
  stressTestRate: number;
  qualifyingIncomeNeeded: number;
  cmhcPremium: number;
  downPaymentPct: number;
  passesStressTest: boolean;
  landTransferTax: number;
  firstTimeBuyerRebate: number;
  notes: string[];
}

export interface ScamAssessment {
  risk: ScamRisk;
  score: number; // 0–100, higher = safer
  positives: string[];
  warnings: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
