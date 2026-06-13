import type { PropertyFilters } from "@/lib/search";

// Shared encoders so the search page, the "save search" button and the /saved
// page all agree on a saved search's URL and human label. The query string is
// the exact set of params the search page knows how to restore.

const TYPE_WORD: Record<string, string> = {
  sale: "Buy",
  rent: "Rent",
  preconstruction: "Pre-construction",
  sold: "Sold",
};

function shortCAD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  return `$${Math.round(n / 1000)}k`;
}

export function searchQueryString(f: PropertyFilters, chips: string[]): string {
  const sp = new URLSearchParams();
  sp.set("type", f.listingType);
  if (f.category) sp.set("cat", f.category);
  if (f.query) sp.set("q", f.query);
  if (f.city) sp.set("city", f.city);
  if (f.maxPrice) sp.set("max", String(f.maxPrice));
  if (f.minBeds) sp.set("beds", String(f.minBeds));
  if (f.newcomerOnly) sp.set("newcomer", "1");
  if (f.transparentOnly) sp.set("offeriq", "1");
  if (chips.includes("Find me a deal")) sp.set("deal", "1");
  return sp.toString();
}

export function searchLabel(f: PropertyFilters, chips: string[]): string {
  const parts: string[] = [];
  parts.push(
    f.category === "land" ? "Land" : f.category === "commercial" ? "Commercial" : TYPE_WORD[f.listingType] ?? "Homes",
  );
  if (f.city) parts.push(f.city);
  if (f.query) parts.push(`“${f.query}”`);
  if (f.maxPrice) parts.push(`≤ ${shortCAD(f.maxPrice)}`);
  if (f.minBeds) parts.push(`${f.minBeds}+ bed`);
  if (f.newcomerOnly) parts.push("Newcomer");
  if (f.transparentOnly) parts.push("OfferIQ");
  if (chips.includes("Find me a deal")) parts.push("Deals");
  return parts.join(" · ");
}
