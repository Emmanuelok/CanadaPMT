// ── MapleHaus Autopilot — agent framework ────────────────────────────────────
// A lightweight, deterministic agent runtime. Each agent composes the platform's
// real engines (valuation, ScamShield, affordability, the STR model, the managed
// portfolio) into an automated workflow that returns structured, renderable
// results — not canned text. When ANTHROPIC_API_KEY is set, narration upgrades
// to Claude; the computations stay real either way.

export type Tone = "good" | "warn" | "bad" | "neutral";
export type Audience = "consumer" | "host" | "all";

export interface AgentStep {
  label: string;
  detail?: string;
}

export interface Metric {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
}

export interface ListingRef {
  slug: string;
  title: string;
  city: string;
  price: string;
  note?: string;
  tone?: Tone;
}

export interface RunRow {
  cells: string[];
  tone?: Tone;
}

export interface ActionLink {
  label: string;
  href: string;
}

export interface AgentRun {
  agentId: string;
  title: string;
  /** The plan the agent executed, shown as a streamed checklist. */
  steps: AgentStep[];
  /** Short plain-language conclusion (supports **bold**). */
  summary: string;
  metrics?: Metric[];
  listings?: ListingRef[];
  table?: { head: string[]; rows: RunRow[] };
  /** A drafted message / document the agent produced. */
  draft?: { title: string; body: string };
  actions?: ActionLink[];
}

export type AgentInputType = "text" | "number" | "select" | "city" | "property" | "unit";

export interface AgentInputDef {
  key: string;
  label: string;
  type: AgentInputType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  default?: string;
  suffix?: string;
}

export interface AgentDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name
  audience: Audience;
  category: string;
  /** What it keeps running on autopilot, present tense. */
  automates: string;
  inputs: AgentInputDef[];
  run: (input: Record<string, string>) => AgentRun;
}

export const num = (v: string | undefined, fallback = 0): number => {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
