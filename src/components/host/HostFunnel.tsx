"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { HostPlan, SpaceType } from "@/lib/str";

// Shares the estimator selection with the lead form so "Get my custom estimate"
// carries the owner's city / space / plan straight into the enquiry.

export interface HostSelection {
  city: string;
  spaceType: SpaceType;
  bedrooms: number;
  plan: HostPlan;
}

interface Ctx {
  sel: HostSelection;
  update: (patch: Partial<HostSelection>) => void;
}

const Context = createContext<Ctx | null>(null);
const DEFAULT: HostSelection = { city: "Toronto", spaceType: "entire", bedrooms: 2, plan: "full" };

export function HostFunnel({ children }: { children: React.ReactNode }) {
  const [sel, setSel] = useState<HostSelection>(DEFAULT);
  const update = useCallback((patch: Partial<HostSelection>) => setSel((s) => ({ ...s, ...patch })), []);
  return <Context.Provider value={{ sel, update }}>{children}</Context.Provider>;
}

export function useHostFunnel(): Ctx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useHostFunnel must be used within HostFunnel");
  return ctx;
}
