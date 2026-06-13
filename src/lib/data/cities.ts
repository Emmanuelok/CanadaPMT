import type { Province } from "@/types";

// Canonical city model — drives both the listing generator and the valuation
// price-per-sqft tables, so generated prices and TrueValue estimates agree.
export interface CityMeta {
  name: string;
  province: Province;
  lat: number;
  lng: number;
  ppsfHouse: number; // blended $/living-sqft
  ppsfCondo: number;
  rentYield: number; // annual rent ÷ value
  /** 0–1 — how condo-heavy the market is. */
  condoBias: number;
  /** how many listings to generate for this city. */
  listings: number;
}

export const CITY_DATA: CityMeta[] = [
  { name: "Toronto", province: "ON", lat: 43.6532, lng: -79.3832, ppsfHouse: 720, ppsfCondo: 1300, rentYield: 0.034, condoBias: 0.6, listings: 26 },
  { name: "Mississauga", province: "ON", lat: 43.589, lng: -79.6441, ppsfHouse: 600, ppsfCondo: 900, rentYield: 0.038, condoBias: 0.45, listings: 16 },
  { name: "Brampton", province: "ON", lat: 43.7315, lng: -79.7624, ppsfHouse: 560, ppsfCondo: 780, rentYield: 0.04, condoBias: 0.25, listings: 12 },
  { name: "Hamilton", province: "ON", lat: 43.2557, lng: -79.8711, ppsfHouse: 520, ppsfCondo: 720, rentYield: 0.044, condoBias: 0.3, listings: 12 },
  { name: "London", province: "ON", lat: 42.9849, lng: -81.2453, ppsfHouse: 420, ppsfCondo: 560, rentYield: 0.05, condoBias: 0.25, listings: 12 },
  { name: "Kitchener", province: "ON", lat: 43.4516, lng: -80.4925, ppsfHouse: 470, ppsfCondo: 640, rentYield: 0.047, condoBias: 0.3, listings: 11 },
  { name: "Ottawa", province: "ON", lat: 45.4215, lng: -75.6972, ppsfHouse: 520, ppsfCondo: 600, rentYield: 0.045, condoBias: 0.35, listings: 16 },
  { name: "Vancouver", province: "BC", lat: 49.2827, lng: -123.1207, ppsfHouse: 990, ppsfCondo: 1150, rentYield: 0.032, condoBias: 0.6, listings: 22 },
  { name: "Burnaby", province: "BC", lat: 49.2488, lng: -122.9805, ppsfHouse: 760, ppsfCondo: 950, rentYield: 0.04, condoBias: 0.5, listings: 13 },
  { name: "Surrey", province: "BC", lat: 49.1913, lng: -122.849, ppsfHouse: 620, ppsfCondo: 760, rentYield: 0.043, condoBias: 0.35, listings: 13 },
  { name: "Richmond", province: "BC", lat: 49.1666, lng: -123.1336, ppsfHouse: 850, ppsfCondo: 1000, rentYield: 0.035, condoBias: 0.5, listings: 11 },
  { name: "Victoria", province: "BC", lat: 48.4284, lng: -123.3656, ppsfHouse: 720, ppsfCondo: 900, rentYield: 0.04, condoBias: 0.45, listings: 11 },
  { name: "Kelowna", province: "BC", lat: 49.888, lng: -119.496, ppsfHouse: 620, ppsfCondo: 780, rentYield: 0.042, condoBias: 0.35, listings: 10 },
  { name: "Calgary", province: "AB", lat: 51.0447, lng: -114.0719, ppsfHouse: 400, ppsfCondo: 470, rentYield: 0.052, condoBias: 0.35, listings: 18 },
  { name: "Edmonton", province: "AB", lat: 53.5461, lng: -113.4938, ppsfHouse: 360, ppsfCondo: 430, rentYield: 0.055, condoBias: 0.35, listings: 16 },
  { name: "Montreal", province: "QC", lat: 45.5019, lng: -73.5674, ppsfHouse: 440, ppsfCondo: 720, rentYield: 0.046, condoBias: 0.55, listings: 20 },
  { name: "Laval", province: "QC", lat: 45.6066, lng: -73.7124, ppsfHouse: 420, ppsfCondo: 620, rentYield: 0.047, condoBias: 0.35, listings: 11 },
  { name: "Quebec City", province: "QC", lat: 46.8139, lng: -71.208, ppsfHouse: 380, ppsfCondo: 520, rentYield: 0.05, condoBias: 0.35, listings: 12 },
  { name: "Gatineau", province: "QC", lat: 45.4765, lng: -75.7013, ppsfHouse: 400, ppsfCondo: 560, rentYield: 0.05, condoBias: 0.3, listings: 10 },
  { name: "Halifax", province: "NS", lat: 44.6488, lng: -63.5752, ppsfHouse: 380, ppsfCondo: 450, rentYield: 0.05, condoBias: 0.35, listings: 14 },
  { name: "Winnipeg", province: "MB", lat: 49.8951, lng: -97.1384, ppsfHouse: 320, ppsfCondo: 400, rentYield: 0.06, condoBias: 0.3, listings: 14 },
  { name: "Saskatoon", province: "SK", lat: 52.1332, lng: -106.67, ppsfHouse: 330, ppsfCondo: 420, rentYield: 0.058, condoBias: 0.3, listings: 10 },
  { name: "Regina", province: "SK", lat: 50.4452, lng: -104.6189, ppsfHouse: 320, ppsfCondo: 410, rentYield: 0.06, condoBias: 0.25, listings: 9 },
];

// Deterministic PRNG so generated data is stable across builds (SSG-safe).
export function mulberry32(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
