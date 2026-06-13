import type { Metadata } from "next";
import { SavedHomes } from "@/components/saved/SavedHomes";

export const metadata: Metadata = {
  title: "Saved homes",
  description: "Your saved MapleHaus listings, kept together in one place on this device.",
};

export default function SavedPage() {
  return <SavedHomes />;
}
