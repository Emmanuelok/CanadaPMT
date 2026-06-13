import type { Property, ScamAssessment } from "@/types";
import { valueProperty } from "@/lib/valuation";

// ───────────────────────────────────────────────────────────────────────────
// ScamShield — verified listings & rental-fraud detection
//
// Canada's pain point: rental scams (fake listings, deposit theft, cloned ads)
// disproportionately hit newcomers and students, and the big portals do little
// to verify landlords. ScamShield scores every listing on identity, ownership,
// photo authenticity, price sanity and cross-platform duplication.
// ───────────────────────────────────────────────────────────────────────────

export function assessListing(property: Property): ScamAssessment {
  const t = property.trust;
  const positives: string[] = [];
  const warnings: string[] = [];
  let score = 50;

  if (t.verifiedLister) {
    score += 18;
    positives.push("Lister identity verified by MapleHaus");
  } else {
    score -= 22;
    warnings.push("Lister identity is not verified");
  }

  if (t.ownershipVerified) {
    score += 16;
    positives.push("Ownership cross-checked against the land registry");
  } else if (property.listingType === "rent") {
    score -= 20;
    warnings.push("Ownership could not be confirmed against the land registry");
  }

  if (t.photosVerified) {
    score += 10;
    positives.push("Photos passed reverse-image & duplicate checks");
  } else {
    score -= 14;
    warnings.push("Photos failed reverse-image checks (possibly copied from another listing)");
  }

  // Price sanity vs the AI valuation / market rent.
  if (t.priceSane) {
    score += 10;
    positives.push("Price is within a normal band for the area");
  } else {
    score -= 18;
    if (property.listingType === "rent") {
      warnings.push("Rent is far below market — a classic too-good-to-be-true scam signal");
    } else {
      warnings.push("Price is well outside the expected range for comparable listings");
    }
  }

  if (t.duplicateListings > 0) {
    score -= Math.min(20, t.duplicateListings * 5);
    warnings.push(
      `This unit appears on ${t.duplicateListings} other platform${t.duplicateListings > 1 ? "s" : ""} under different contacts — a cloning red flag`,
    );
  } else {
    positives.push("No duplicate or cloned listings detected");
  }

  // Language / behaviour signals (rentals).
  if (property.listingType === "rent") {
    const text = `${property.title} ${property.description}`.toLowerCase();
    const redFlags = ["e-transfer", "overseas", "abroad", "no viewing", "deposit to hold", "wire", "western union"];
    const hits = redFlags.filter((f) => text.includes(f));
    if (hits.length) {
      score -= Math.min(24, hits.length * 8);
      warnings.push("Description asks for money before a viewing — never pay a deposit to hold a unit you haven't seen");
    } else {
      positives.push("No high-pressure payment language detected");
    }
    // Cross-check rent against modelled market rent.
    const v = valueProperty(property);
    if (v.rentEstimate > 0 && property.price < v.rentEstimate * 0.6) {
      score -= 10;
      warnings.push(
        `Asking rent ($${property.price.toLocaleString("en-CA")}) is far below the modelled market rent (~$${v.rentEstimate.toLocaleString("en-CA")})`,
      );
    }
  }

  score = Math.max(2, Math.min(99, score));
  const risk = score >= 75 ? "low" : score >= 45 ? "medium" : "high";

  return { risk, score, positives, warnings };
}
