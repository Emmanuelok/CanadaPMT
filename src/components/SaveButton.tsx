"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";

export function SaveButton({ className }: { className?: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save home"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
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
