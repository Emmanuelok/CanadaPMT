"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Persistent "saved homes" — favourited listings survive navigation and reloads
// (localStorage), shared app-wide through one provider so the header count, the
// /saved page and every save button stay in sync.

interface SavedCtx {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  hydrated: boolean;
}

const Ctx = createContext<SavedCtx | null>(null);
const KEY = "mh-saved";

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client only) — keeps SSR markup stable, then hydrates.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so we never clobber storage with the initial [].
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  const toggle = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
    [],
  );
  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);

  return (
    <Ctx.Provider value={{ ids, toggle, remove, clear, has: (id) => ids.includes(id), count: ids.length, hydrated }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSaved(): SavedCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
