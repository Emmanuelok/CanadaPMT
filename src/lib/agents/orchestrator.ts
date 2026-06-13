import type { AgentRun } from "./types";
import * as R from "./runners";
import { CITY_DATA } from "@/lib/data/cities";
import { properties } from "@/lib/data/properties";
import { portfolio } from "@/lib/host/portfolio";

// MapleHaus Autopilot orchestrator: turns a plain-language goal into a chained
// plan of agents, runs them, and threads each one's output into the next.

export type FlowIntent = "buy" | "afford" | "verify" | "newcomer" | "host-prospect" | "host-ops";

export interface FlowResult {
  goal: string;
  intent: FlowIntent;
  city: string;
  runs: AgentRun[];
  summary: string;
}

function parseAmount(raw: string | undefined, unit: string | undefined): number {
  if (!raw) return 0;
  let n = parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  if (/m/i.test(unit ?? "")) n *= 1_000_000;
  else if (/k/i.test(unit ?? "")) n *= 1_000;
  return Math.round(n);
}

function moneyNear(g: string, keys: string): number {
  const re = new RegExp(`(?:${keys})\\D{0,12}\\$?\\s*([\\d,.]+)\\s*(k|m)?`, "i");
  const m = g.match(re);
  return m ? parseAmount(m[1], m[2]) : 0;
}

function detectIntent(g: string): FlowIntent {
  if (/\b(my (rental|listing|propert|place|unit|airbnb|portfolio)|manage my|optimi[sz]e my|my bookings|my payout)\b/.test(g)) return "host-ops";
  if (/\b(rent (?:it|my|out)|start hosting|become a host|host my|airbnb my|list my (?:place|home|condo|house)|put it to work|could i earn|earn from|make money (?:from|with) my)\b/.test(g) || /\bhost(?:ing)?\b/.test(g))
    return "host-prospect";
  if (/\b(newcomer|new to canada|immigrant|just moved|relocat|moving to canada)\b/.test(g)) return "newcomer";
  if (/\b(afford|qualif|mortgage|budget|pre-?approv|how much can i (?:spend|afford|borrow))\b/.test(g)) return "afford";
  if (/\b(scam|verify|legit|safe|fraud|too good|trust)\b/.test(g)) return "verify";
  return "buy";
}

function pickRentalSlug(city: string): string {
  const inCity = properties.find((p) => p.listingType === "rent" && (!city || p.address.city === city));
  return (inCity ?? properties.find((p) => p.listingType === "rent") ?? properties[0]).slug;
}

export function runFlow(goal: string): FlowResult {
  const g = goal.toLowerCase();
  const city = CITY_DATA.find((c) => g.includes(c.name.toLowerCase()))?.name ?? "";
  const maxPriceM = g.match(/(?:under|below|up to|max|<)\s*\$?\s*([\d,.]+)\s*(k|m)?/) || g.match(/\$\s*([\d,.]+)\s*(k|m)?/);
  const maxPrice = maxPriceM ? String(parseAmount(maxPriceM[1], maxPriceM[2])) : "";
  const bedsM = g.match(/(\d+)\s*(?:\+)?\s*(?:bed|bd|br|bedroom)/);
  const beds = bedsM ? bedsM[1] : "";
  const spaceType = /\bspare room|private room|a room\b/.test(g) ? "room" : /\bbasement|suite|in-law\b/.test(g) ? "suite" : "entire";
  const income = moneyNear(g, "income|earn|salary|make|making|making about");
  const down = moneyNear(g, "down|deposit|savings|saved|put down");

  const intent = detectIntent(g);
  const runs: AgentRun[] = [];
  let lastSlug = "";
  const add = (run: AgentRun) => {
    runs.push(run);
    if (run.listings?.length) lastSlug = run.listings[0].slug;
  };

  if (intent === "host-ops") {
    add(R.payoutReport());
    add(R.dynamicPricing({ unit: portfolio.units[0].id }));
    add(R.turnoverOps({ unit: "all" }));
  } else if (intent === "host-prospect") {
    add(R.earningsEstimator({ city, spaceType, bedrooms: beds }));
    add(R.complianceAgent({ city }));
  } else if (intent === "afford") {
    const aff = R.affordabilityAgent({ income: String(income || ""), downPayment: String(down || ""), city, firstTimeBuyer: "yes" });
    add(aff);
    const maxFromAff = (aff.metrics?.find((m) => m.label === "Max price")?.value ?? "").replace(/[^\d]/g, "");
    add(R.dealHunter({ city, maxPrice: maxFromAff, minBeds: beds }));
  } else if (intent === "verify") {
    add(R.scamShieldAgent({ property: pickRentalSlug(city) }));
  } else if (intent === "newcomer") {
    add(R.relocationConcierge({ city, monthlyBudget: String(down || maxPrice || "") }));
  } else {
    // buy
    add(R.dealHunter({ city, maxPrice, minBeds: beds }));
    if (lastSlug) {
      add(R.offerStrategist({ property: lastSlug }));
      add(R.scamShieldAgent({ property: lastSlug }));
    }
    if (income) add(R.affordabilityAgent({ income: String(income), downPayment: String(down || ""), city, firstTimeBuyer: "yes" }));
  }

  return { goal, intent, city, runs, summary: overview(intent, city, runs) };
}

function overview(intent: FlowIntent, city: string, runs: AgentRun[]): string {
  const where = city ? ` in ${city}` : "";
  const n = runs.length;
  const m = (run: AgentRun | undefined, label: string) => run?.metrics?.find((x) => x.label === label)?.value ?? "";
  switch (intent) {
    case "buy": {
      const under = m(runs[0], "Below AI value");
      const offer = m(runs[1], "Suggested offer");
      return `Ran **${n}** agents end-to-end${where}: found **${under || "0"}** homes priced below AI value${offer ? `, drafted an opening offer of **${offer}** on the top pick,` : ""} and ran a ScamShield trust check — automatically.`;
    }
    case "afford": {
      const max = m(runs[0], "Max price");
      return `Ran **${n}** agents${where}: pre-approved you up to **${max}** and surfaced homes within budget.`;
    }
    case "host-prospect": {
      const net = m(runs[0], "Net / month");
      return `Ran **${n}** agents${where}: estimated **${net}/mo** take-home and checked the local short-term-rental rules.`;
    }
    case "host-ops": {
      const net = m(runs[0], "Net payout");
      return `Ran **${n}** agents across your portfolio: closed the books (**${net}** net), re-priced your calendar and scheduled turnovers.`;
    }
    case "verify":
      return `Ran ScamShield on a representative ${city || ""} listing and scored its trustworthiness.`;
    case "newcomer":
      return `Built your full relocation plan${where} and shortlisted safe, newcomer-friendly rentals.`;
    default:
      return `Ran ${n} agents for you.`;
  }
}

export const FLOW_EXAMPLES = [
  "Find me an undervalued 2-bed condo in Toronto under $800k",
  "How much can I afford on $140k income with $90k down in Calgary?",
  "I want to rent out my basement suite in Ottawa",
  "I just moved to Canada — find safe rentals in Vancouver under $2,400",
  "Manage my rental portfolio for this month",
];
