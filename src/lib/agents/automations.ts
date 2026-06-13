import { useEffect, useState } from "react";

// Persistent "set and forget" automations. When a user toggles an agent on, we
// store its id + inputs in localStorage so Autopilot can keep running it for
// them. Browser-only; safe to import anywhere (guards on window).

export interface Automation {
  agentId: string;
  inputs: Record<string, string>;
  enabledAt: number;
}

const KEY = "mh-automations";
const EVT = "mh-automations";

export function getAutomations(): Automation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(list: Automation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function enableAutomation(agentId: string, inputs: Record<string, string>) {
  const rest = getAutomations().filter((a) => a.agentId !== agentId);
  save([{ agentId, inputs, enabledAt: Date.now() }, ...rest]);
}

export function disableAutomation(agentId: string) {
  save(getAutomations().filter((a) => a.agentId !== agentId));
}

export function useAutomations(): Automation[] {
  const [list, setList] = useState<Automation[]>([]);
  useEffect(() => {
    const sync = () => setList(getAutomations());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
