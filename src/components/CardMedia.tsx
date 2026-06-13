"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/types";
import { Photo } from "@/components/Photo";
import { sceneFor, type Kind } from "@/components/PropertyScene";
import { cn } from "@/lib/cn";

function baseKind(p: Property): Kind {
  if (p.category === "land") return "land";
  if (p.category === "commercial") return "commercial";
  return p.propertyType === "Condo Apartment" || p.propertyType === "Loft" ? "living" : "exterior";
}

export function CardMedia({ property, className }: { property: Property; className?: string }) {
  const slides = (property.images.length ? property.images : [{ label: "" }]).slice(0, 5);
  const [i, setI] = useState(0);
  const n = slides.length;

  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setI((prev) => (prev + dir + n) % n);
  };

  const active = slides[i];
  const kind: Kind = i === 0 ? baseKind(property) : sceneFor(active.label, i);

  return (
    <div className={cn("group/media relative overflow-hidden", className)}>
      <Photo seedKey={`${property.id}-${i}`} kind={kind} className="h-full w-full" />

      {n > 1 && (
        <>
          <button
            aria-label="Previous photo"
            onClick={(e) => go(e, -1)}
            className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 opacity-0 shadow transition group-hover/media:opacity-100 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next photo"
            onClick={(e) => go(e, 1)}
            className="absolute right-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 opacity-0 shadow transition group-hover/media:opacity-100 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "h-1.5 rounded-full bg-white transition-all",
                  idx === i ? "w-4 opacity-100" : "w-1.5 opacity-60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
