import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";

export const metadata: Metadata = {
  title: "Search listings",
  description: "Search homes for sale, rentals, pre-construction and sold listings across Canada with AI valuations and fraud-checked trust scores.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mh-container py-24 text-center text-ink-500">Loading listings…</div>}>
      <SearchExperience />
    </Suspense>
  );
}
