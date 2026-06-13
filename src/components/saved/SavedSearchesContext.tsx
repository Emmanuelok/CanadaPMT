"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Persistent saved searches — a named filter set + its restorable query string,
// kept in localStorage and shared app-wide (mirrors SavedContext for homes).

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  createdAt: number;
}

interface Ctx {
  searches: SavedSearch[];
  toggle: (label: string, query: string) => void;
  remove: (id: string) => void;
  has: (query: string) => boolean;
  count: number;
  hydrated: boolean;
}

const Context = createContext<Ctx | null>(null);
const KEY = "mh-saved-searches";

export function SavedSearchesProvider({ children }: { children: React.ReactNode }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setSearches(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(searches));
    } catch {
      /* ignore */
    }
  }, [searches, hydrated]);

  const toggle = useCallback(
    (label: string, query: string) =>
      setSearches((prev) =>
        prev.some((s) => s.query === query)
          ? prev.filter((s) => s.query !== query)
          : [{ id: `${Date.now()}`, label, query, createdAt: Date.now() }, ...prev],
      ),
    [],
  );
  const remove = useCallback((id: string) => setSearches((prev) => prev.filter((s) => s.id !== id)), []);

  return (
    <Context.Provider
      value={{ searches, toggle, remove, has: (q) => searches.some((s) => s.query === q), count: searches.length, hydrated }}
    >
      {children}
    </Context.Provider>
  );
}

export function useSavedSearches(): Ctx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useSavedSearches must be used within SavedSearchesProvider");
  return ctx;
}
