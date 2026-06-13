import type { Metadata } from "next";
import { Sparkles, Bot, ShoppingBag, KeyRound, Home } from "lucide-react";
import { AutopilotConsole } from "@/components/autopilot/AutopilotConsole";
import { AGENTS } from "@/lib/agents/registry";

export const metadata: Metadata = {
  title: "Autopilot — AI agents that run everything | MapleHaus",
  description:
    "MapleHaus Autopilot is a fleet of AI agents that automate the whole journey — hunting deals, strategizing offers, verifying listings, qualifying you, and running your short-term rentals end-to-end.",
};

const PILLARS = [
  { icon: ShoppingBag, title: "Buy on autopilot", body: "Deal Hunter, Offer Strategist and Pre-Approval agents do the analysis for you." },
  { icon: KeyRound, title: "Rent safely", body: "ScamShield and the Newcomer Concierge vet every listing and plan your move." },
  { icon: Home, title: "Host hands-free", body: "Pricing, guests, turnovers, payouts and compliance — all run by agents." },
];

export default function AutopilotPage() {
  return (
    <div>
      <section className="mh-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> MapleHaus Autopilot · {AGENTS.length} AI agents
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Put your whole move<br />
            <span className="gradient-text">on autopilot.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Tell Autopilot a goal in plain language. It plans the right agents, runs them end-to-end on real MapleHaus
            data, and hands you the result — whether you&apos;re buying, renting, or hosting.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-white">{p.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mh-container pb-24">
        <AutopilotConsole />

        <p className="mx-auto mt-10 flex max-w-3xl items-start gap-2 text-xs text-zinc-500">
          <Bot className="mt-0.5 h-4 w-4 shrink-0" />
          Agents compute on real platform data (valuations, ScamShield, affordability, the STR model and your managed
          portfolio). Results are educational estimates. With an Anthropic API key configured, agent narration upgrades
          to Claude; the underlying numbers stay the same.
        </p>
      </section>
    </div>
  );
}
