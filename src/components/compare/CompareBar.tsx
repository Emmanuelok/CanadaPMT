"use client";

import { useState } from "react";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/components/compare/CompareContext";
import { CompareModal } from "@/components/compare/CompareModal";
import { propertyById } from "@/lib/data/properties";
import type { Property } from "@/types";
import { Photo } from "@/components/Photo";

export function CompareBar() {
  const { ids, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);
  if (!ids.length) return null;

  const items = ids.map(propertyById).filter((p): p is Property => Boolean(p));

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-40 w-[min(94vw,640px)] -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 pl-3 shadow-lift">
          <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-700 sm:flex">
            <Scale className="h-4 w-4 text-brand-700" /> Compare
          </span>
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
            {items.map((p) => (
              <div key={p.id} className="relative shrink-0">
                <Photo seedKey={`${p.id}-0`} label={undefined} className="h-11 w-16 rounded-lg" />
                <button
                  onClick={() => remove(p.id)}
                  aria-label="Remove"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-white shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={clear} className="hidden text-xs font-semibold text-ink-500 hover:text-maple-600 sm:block">
            Clear
          </button>
          <button
            onClick={() => setOpen(true)}
            disabled={items.length < 2}
            className="shrink-0 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
          >
            Compare {items.length}
          </button>
        </div>
      </div>
      {open && <CompareModal ids={ids} onClose={() => setOpen(false)} />}
    </>
  );
}
