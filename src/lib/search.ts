import type { ListingType, Property, PropertyType } from "@/types";
import { properties } from "@/lib/data/properties";

export interface PropertyFilters {
  listingType: ListingType;
  city: string; // "" = all
  propertyType: string; // "" = all
  minBeds: number;
  maxPrice: number; // 0 = no cap
  newcomerOnly: boolean;
  transparentOnly: boolean;
  query: string;
  sort: "relevant" | "price-asc" | "price-desc" | "newest";
}

export const defaultFilters = (listingType: ListingType = "sale"): PropertyFilters => ({
  listingType,
  city: "",
  propertyType: "",
  minBeds: 0,
  maxPrice: 0,
  newcomerOnly: false,
  transparentOnly: false,
  query: "",
  sort: "relevant",
});

export function applyFilters(filters: PropertyFilters): Property[] {
  let result = properties.filter((p) => p.listingType === filters.listingType);

  if (filters.city) result = result.filter((p) => p.address.city === filters.city);
  if (filters.propertyType) result = result.filter((p) => p.propertyType === (filters.propertyType as PropertyType));
  if (filters.minBeds > 0) result = result.filter((p) => p.beds >= filters.minBeds);
  if (filters.maxPrice > 0) result = result.filter((p) => p.price <= filters.maxPrice);
  if (filters.newcomerOnly) result = result.filter((p) => p.newcomerFriendly);
  if (filters.transparentOnly) result = result.filter((p) => p.transparentBidding);

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    result = result.filter((p) =>
      [p.title, p.address.street, p.address.city, p.propertyType, p.description]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result = [...result].sort((a, b) => +new Date(b.listedDate) - +new Date(a.listedDate));
      break;
    default:
      result = [...result].sort(
        (a, b) => Number(b.featured) - Number(a.featured) || a.daysOnMarket - b.daysOnMarket,
      );
  }

  return result;
}

export const PROPERTY_TYPES: PropertyType[] = [
  "Detached",
  "Semi-Detached",
  "Townhouse",
  "Condo Apartment",
  "Bungalow",
  "Loft",
  "Duplex",
];
