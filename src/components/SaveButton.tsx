"use client";

import { Heart } from "lucide-react";
import { useSaved } from "@/components/saved/SavedContext";
import { cn } from "@/lib/cn";

export function SaveButton({ propertyId, className }: { propertyId: string; className?: string }) {
  const { has, toggle } = useSaved();
  const saved = has(propertyId);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save home"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-sm backdrop-blur transition hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4 transition", saved && "fill-maple-500 text-maple-500")} />
    </button>
  );
}
