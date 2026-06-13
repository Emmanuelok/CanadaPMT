import { mulberry32, CITY_DATA } from "@/lib/data/cities";
import { PRICE_SEASON, type HostUnit } from "@/lib/host/portfolio";
import { SPACE_TYPES } from "@/lib/str";

// Public short-term-rental listing details + a booking-quote calculator, derived
// deterministically from a managed unit. Lets owners view their live listing and
// guests get an instant price.

const AMENITY_POOL = [
  "Fast WiFi", "Full kitchen", "Free parking", "In-suite laundry", "Air conditioning", "Dedicated workspace",
  "Self check-in", "Smart TV", "Coffee maker", "Heating", "Dishwasher", "Patio / balcony", "BBQ grill", "Crib available",
];
const REVIEW_TEXT = [
  "Spotless, stylish and exactly as pictured. The MapleHaus team was lightning-fast to respond.",
  "Perfect location and a seamless self check-in. Would absolutely stay again.",
  "Beautifully kept place — clearly professionally managed. Spotless on arrival.",
  "Great communication start to finish. The space was cozy and had everything we needed.",
  "Loved it. Quiet, comfortable, and the little touches made all the difference.",
  "Easy booking, immaculate unit, responsive hosts. Five stars.",
];
const REVIEWERS = ["Emily R.", "David L.", "Sophie M.", "Arjun P.", "Catherine B.", "Marco T.", "Hannah W.", "Liam O."];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface StayReview {
  author: string;
  date: string;
  rating: number;
  text: string;
}
export interface StayDetails {
  guests: number;
  baths: number;
  cleaningFee: number;
  amenities: string[];
  description: string;
  houseRules: string[];
  reviews: StayReview[];
  lat: number;
  lng: number;
  galleryKinds: ("exterior" | "living" | "kitchen" | "bedroom")[];
}

const CLEANING: Record<HostUnit["spaceType"], number> = { entire: 150, suite: 90, room: 55 };

export function getStayDetails(unit: HostUnit): StayDetails {
  const rng = mulberry32(`stay-${unit.id}`);
  const c = CITY_DATA.find((x) => x.name === unit.city) ?? CITY_DATA[0];
  const guests = unit.spaceType === "room" ? 2 : Math.max(2, unit.bedrooms * 2);
  const baths = unit.spaceType === "room" ? 1 : Math.max(1, Math.round(unit.bedrooms * 0.75));

  const amenities = [...AMENITY_POOL].sort(() => rng() - 0.5).slice(0, 9).sort();

  const reviewCount = unit.reviews > 0 ? 4 : 0;
  const reviews: StayReview[] = Array.from({ length: reviewCount }, (_, i) => ({
    author: REVIEWERS[Math.floor(rng() * REVIEWERS.length)],
    date: `${MONTHS[Math.floor(rng() * 12)]} 2026`,
    rating: rng() < 0.8 ? 5 : 4,
    text: REVIEW_TEXT[Math.floor(rng() * REVIEW_TEXT.length)],
  }));

  return {
    guests,
    baths,
    cleaningFee: CLEANING[unit.spaceType],
    amenities,
    description: `${unit.nickname} is a ${SPACE_TYPES[unit.spaceType].label.toLowerCase()} in ${unit.city}, professionally managed by MapleHaus Host. Thoughtfully furnished and immaculately kept, it’s ready for business trips, weekend getaways or longer stays — with hotel-grade linens, a fast self check-in and a local team on call 24/7.`,
    houseRules: ["Check-in after 3:00 PM", "Checkout by 11:00 AM", "No smoking", "No parties or events", "Quiet hours 10 PM – 7 AM"],
    reviews,
    lat: c.lat + (rng() - 0.5) * 0.04,
    lng: c.lng + (rng() - 0.5) * 0.06,
    galleryKinds:
      unit.spaceType === "room"
        ? ["bedroom", "living", "kitchen", "exterior"]
        : ["exterior", "living", "kitchen", "bedroom"],
  };
}

export interface Quote {
  valid: boolean;
  nights: number;
  avgNightly: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  error?: string;
}

export function quoteStay(adr: number, checkIn: string, checkOut: string, cleaningFee: number): Quote {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const empty: Quote = { valid: false, nights: 0, avgNightly: 0, subtotal: 0, cleaningFee, serviceFee: 0, total: 0 };

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { ...empty, error: "Choose your dates" };
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (nights <= 0) return { ...empty, error: "Checkout must be after check-in" };
  if (nights > 90) return { ...empty, error: "Maximum stay is 90 nights" };

  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const day = new Date(start.getTime() + i * 86_400_000);
    const weekend = day.getDay() === 5 || day.getDay() === 6; // Fri / Sat
    const nightly = adr * PRICE_SEASON[day.getMonth()] * (weekend ? 1.12 : 1);
    subtotal += nightly;
  }
  subtotal = Math.round(subtotal);
  const serviceFee = Math.round(subtotal * 0.12);
  return {
    valid: true,
    nights,
    avgNightly: Math.round(subtotal / nights),
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee,
  };
}
