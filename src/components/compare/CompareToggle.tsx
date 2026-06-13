"use client";

import { Scale, Check } from "lucide-react";
import { useCompare } from "@/components/compare/CompareContext";
import { cn } from "@/lib/cn";

export function CompareToggle({ id }: { id: string }) {
  const { has, toggle } = useCompare();
  const on = has(id);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from compare" : "Add to compare"}
      title="Compare"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition",
        on ? "bg-brand-700 text-white" : "bg-white/90 text-ink-600 hover:bg-white",
      )}
    >
      {on ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
    </button>
  );
}
