import type { Neighbourhood, Property, PropertyType } from "@/types";
import { CITY_DATA, mulberry32, type CityMeta } from "@/lib/data/cities";
import { agents } from "@/lib/data/agents";

// Deterministic synthetic listings + neighbourhoods, generated from CITY_DATA so
// the map and search feel like a real, full platform (not a 24-row demo).

const NBHD_NAMES = [
  "Riverside", "The Heights", "Oakridge", "Westwood", "Parkdale", "Highland Park",
  "Lakeview", "Maple Grove", "Cedar Ridge", "Brookside", "Sunnyside", "Fairview",
  "Kingsway", "Bridgeport", "Hillcrest", "Northgate", "Crescent Heights", "Glenwood",
  "Stonebridge", "Harbourfront",
];
const STREET_NAMES = ["Maple", "Oak", "King", "Queen", "Birch", "Cedar", "Elm", "Pine", "Lakeshore", "River", "Park", "Main", "Spruce", "Willow", "Wellington", "Bloor", "Granville", "Memorial", "Centre", "Aspen"];
const STREET_SUFFIX = ["St", "Ave", "Rd", "Cres", "Blvd", "Dr", "Way", "Lane", "Terrace", "Pl"];
const ADJ = ["Bright", "Modern", "Spacious", "Updated", "Stylish", "Sun-filled", "Move-in-ready", "Renovated", "Cozy", "Sleek"];
const HOUSE_FEATURES = ["Finished basement", "Renovated kitchen", "Private backyard", "Attached garage", "Hardwood floors", "Walk to transit", "Quiet family street", "Newer roof & windows", "Open-concept main floor", "Mudroom & storage"];
const CONDO_FEATURES = ["Floor-to-ceiling windows", "Stainless appliances", "Gym & party room", "24-hr concierge", "In-suite laundry", "Private balcony", "Locker & parking", "Steps to transit", "Pet friendly", "Rooftop terrace"];

const HOUSE_TYPES: PropertyType[] = ["Detached", "Semi-Detached", "Townhouse", "Bungalow"];
const CONDO_TYPES: PropertyType[] = ["Condo Apartment", "Loft"];
const isHouse = (t: PropertyType) => HOUSE_TYPES.includes(t);

const BASE_DATE = new Date("2026-06-13").getTime();

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}
function citySlug(name: string) {
  return name.toLowerCase().replace(/[^a-z]+/g, "-");
}
function isoDaysAgo(days: number) {
  return new Date(BASE_DATE - days * 86_400_000).toISOString().slice(0, 10);
}

// ── Neighbourhoods ──────────────────────────────────────────────────────────
function buildNeighbourhoods(city: CityMeta): Neighbourhood[] {
  const rng = mulberry32(`nb-${city.name}`);
  const names = pickN(rng, NBHD_NAMES, 3);
  return names.map((nm, i) => {
    const s = (lo: number, hi: number) => Math.round(lo + rng() * (hi - lo));
    const medianPrice = Math.round((city.ppsfHouse * 1650 * (0.85 + rng() * 0.4)) / 1000) * 1000;
    return {
      id: `gnb-${citySlug(city.name)}-${i}`,
      name: nm,
      city: city.name,
      province: city.province,
      scores: {
        overall: s(64, 90),
        schools: s(62, 92),
        transit: s(58, 92),
        safety: s(66, 92),
        walkability: s(60, 95),
        affordability: s(35, 82),
        growth: s(62, 90),
        climateResilience: s(60, 88),
      },
      medianPrice,
      medianRent: Math.round((medianPrice * city.rentYield) / 12 / 50) * 50,
      priceYoY: Math.round((rng() * 10 - 2) * 10) / 10,
      inventory: s(18, 130),
      avgDaysOnMarket: s(12, 34),
      summary: `${nm} is one of ${city.name}'s most sought-after pockets, balancing access, amenities and value.`,
      highlights: pickN(rng, ["Walk to transit", "Strong schools", "Café & retail strip", "Parks & trails", "Fast-growing", "Family-friendly"], 3),
    };
  });
}

export const generatedNeighbourhoods: Neighbourhood[] = CITY_DATA.flatMap(buildNeighbourhoods);

const nbhdsByCity: Record<string, Neighbourhood[]> = {};
for (const nb of generatedNeighbourhoods) (nbhdsByCity[nb.city] ??= []).push(nb);

// ── Listings ────────────────────────────────────────────────────────────────
function buildListing(city: CityMeta, i: number): Property {
  const rng = mulberry32(`${city.name}-listing-${i}`);
  const nbhd = pick(rng, nbhdsByCity[city.name]);
  const condo = rng() < city.condoBias;
  const type: PropertyType = condo ? pick(rng, CONDO_TYPES) : pick(rng, HOUSE_TYPES);
  const house = isHouse(type);

  const r = rng();
  const listingType: Property["listingType"] = r < 0.7 ? "sale" : r < 0.85 ? "rent" : r < 0.94 ? "sold" : "preconstruction";

  const beds = house ? 2 + Math.floor(rng() * 4) : 1 + Math.floor(rng() * 2);
  const baths = Math.max(1, beds - Math.floor(rng() * 2));
  const sqft = house ? 1200 + Math.floor(rng() * 2000) : 480 + Math.floor(rng() * 700);
  const ppsf = house ? city.ppsfHouse : city.ppsfCondo;
  const value = sqft * ppsf * (0.9 + rng() * 0.22);

  let price: number;
  if (listingType === "rent") price = Math.round((value * city.rentYield) / 12 / 50) * 50;
  else if (listingType === "preconstruction") price = Math.round((value * 0.85) / 1000) * 1000;
  else price = Math.round(value / 1000) * 1000;

  const dom = 2 + Math.floor(rng() * 58);
  const listedDate = isoDaysAgo(dom);
  const reduced = listingType === "sale" && rng() < 0.22;
  const priceHistory: Property["priceHistory"] = [];
  if (listingType === "sold") {
    priceHistory.push({ date: isoDaysAgo(dom + 9), price: Math.round((price * 0.98) / 1000) * 1000, event: "Listed" });
    priceHistory.push({ date: listedDate, price, event: "Sold" });
  } else if (reduced) {
    const orig = Math.round((price * 1.05) / 1000) * 1000;
    priceHistory.push({ date: isoDaysAgo(dom), price: orig, event: "Listed" });
    priceHistory.push({ date: isoDaysAgo(Math.floor(dom / 2)), price, event: "Price change" });
  } else {
    priceHistory.push({ date: listedDate, price, event: "Listed" });
  }

  const provAgents = agents.filter((a) => a.province === city.province);
  const agent = (provAgents.length ? provAgents : agents)[Math.floor(rng() * (provAgents.length || agents.length))];

  const typeWord = house ? (type === "Detached" ? "home" : type.toLowerCase()) : "condo";
  const adj = pick(rng, ADJ);

  return {
    id: `gen-${citySlug(city.name)}-${i}`,
    slug: `gen-${citySlug(city.name)}-${i}`,
    listingType,
    propertyType: type,
    title: `${adj} ${beds}-bed ${typeWord} in ${nbhd.name}`,
    address: {
      street: `${100 + Math.floor(rng() * 8800)} ${pick(rng, STREET_NAMES)} ${pick(rng, STREET_SUFFIX)}`,
      city: city.name,
      province: city.province,
      postalCode: `${city.province[0]}${Math.floor(rng() * 9)}${String.fromCharCode(65 + Math.floor(rng() * 26))} ${Math.floor(rng() * 9)}${String.fromCharCode(65 + Math.floor(rng() * 26))}${Math.floor(rng() * 9)}`,
      neighbourhoodId: nbhd.id,
    },
    coords: { lat: city.lat + (rng() - 0.5) * 0.09, lng: city.lng + (rng() - 0.5) * 0.12 },
    price,
    beds,
    baths,
    sqft,
    lotSqft: house ? 2200 + Math.floor(rng() * 4200) : undefined,
    parking: house ? 1 + Math.floor(rng() * 2) : Math.floor(rng() * 2),
    yearBuilt: listingType === "preconstruction" ? 2026 + Math.floor(rng() * 2) : 1955 + Math.floor(rng() * 70),
    description: `${adj} ${beds}-bedroom ${typeWord} in ${nbhd.name}, ${city.name}. Thoughtfully laid out with quality finishes and an unbeatable location close to transit, shops and parks.`,
    features: pickN(rng, house ? HOUSE_FEATURES : CONDO_FEATURES, 5),
    images: house
      ? [{ label: "Exterior" }, { label: "Living room" }, { label: "Kitchen" }, { label: "Backyard" }]
      : [{ label: "Living room" }, { label: "Kitchen" }, { label: "Primary bedroom" }, { label: "Building" }],
    priceHistory,
    daysOnMarket: dom,
    listedDate,
    maintenanceFee: condo ? Math.round((300 + rng() * 600) / 10) * 10 : undefined,
    propertyTaxAnnual: listingType === "rent" ? undefined : Math.round((price * 0.0085) / 10) * 10,
    agentId: agent.id,
    trust: { verifiedLister: true, ownershipVerified: true, photosVerified: true, priceSane: true, duplicateListings: 0 },
    transparentBidding: rng() < 0.3,
    newcomerFriendly: rng() < 0.25,
    mls: `G${city.province}${100000 + Math.floor(rng() * 899999)}`,
  };
}

export const generatedProperties: Property[] = CITY_DATA.flatMap((city) =>
  Array.from({ length: city.listings }, (_, i) => buildListing(city, i)),
);
