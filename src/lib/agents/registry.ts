import type { AgentDef } from "./types";
import * as R from "./runners";
import { CITY_DATA } from "@/lib/data/cities";
import { properties } from "@/lib/data/properties";
import { portfolio } from "@/lib/host/portfolio";

const cityOptions = (withAny = true) => [
  ...(withAny ? [{ value: "any", label: "Any city" }] : []),
  ...CITY_DATA.map((c) => ({ value: c.name, label: c.name })),
];

const saleSlugs = properties.filter((p) => p.listingType === "sale").slice(0, 8).map((p) => p.slug);

const propertyOptions = () => {
  const sale = properties.filter((p) => p.listingType === "sale").slice(0, 8);
  const rent = properties.filter((p) => p.listingType === "rent").slice(0, 6);
  return [...sale, ...rent].map((p) => ({
    value: p.slug,
    label: `${p.title.length > 42 ? p.title.slice(0, 42) + "…" : p.title} — ${p.address.city}`,
  }));
};

const unitOptions = (withAll = false) => [
  ...(withAll ? [{ value: "all", label: "All properties" }] : []),
  ...portfolio.units.map((u) => ({ value: u.id, label: u.nickname })),
];

export const AGENTS: AgentDef[] = [
  {
    id: "deal-hunter",
    name: "Deal Hunter",
    tagline: "Finds homes priced below their AI value",
    description: "Continuously scans the market, runs TrueValue on every listing, and surfaces the most under-priced homes for your criteria.",
    icon: "Radar",
    audience: "consumer",
    category: "Buying",
    automates: "watches your search and alerts you to under-priced homes & price drops",
    inputs: [
      { key: "city", label: "City", type: "select", options: cityOptions(), default: "Toronto" },
      { key: "maxPrice", label: "Max price", type: "number", placeholder: "900000", default: "900000", suffix: "$" },
      { key: "minBeds", label: "Min beds", type: "number", placeholder: "2", default: "2" },
    ],
    run: R.dealHunter,
  },
  {
    id: "offer-strategist",
    name: "Offer Strategist",
    tagline: "Tells you exactly what to offer",
    description: "Analyzes value, price history, days on market and bidding type to recommend a precise offer and negotiation strategy.",
    icon: "Gavel",
    audience: "consumer",
    category: "Buying",
    automates: "recomputes your offer as the listing's price history and competition change",
    inputs: [{ key: "property", label: "Listing", type: "select", options: propertyOptions() }],
    run: R.offerStrategist,
  },
  {
    id: "scam-shield",
    name: "ScamShield",
    tagline: "Verifies a listing before you pay a cent",
    description: "Checks identity, ownership against the land registry, photo authenticity and price sanity, then scores overall trust.",
    icon: "ShieldCheck",
    audience: "consumer",
    category: "Renting & newcomers",
    automates: "auto-screens every listing you view and flags fraud risk",
    inputs: [{ key: "property", label: "Listing", type: "select", options: propertyOptions() }],
    run: R.scamShieldAgent,
  },
  {
    id: "comparison",
    name: "Listing Comparison",
    tagline: "Compares listings and picks a winner",
    description: "Lines up two or three homes on price, AI value, $/sqft, demand and trust, then scores a clear overall winner.",
    icon: "GitCompare",
    audience: "consumer",
    category: "Buying",
    automates: "side-by-side compares your shortlist and ranks them",
    inputs: [
      { key: "propertyA", label: "Listing A", type: "select", options: propertyOptions(), default: saleSlugs[0] },
      { key: "propertyB", label: "Listing B", type: "select", options: propertyOptions(), default: saleSlugs[1] },
      { key: "propertyC", label: "Listing C (optional)", type: "select", options: [{ value: "", label: "— none —" }, ...propertyOptions()], default: "" },
    ],
    run: R.comparison,
  },
  {
    id: "affordability",
    name: "Pre-Approval Agent",
    tagline: "Your real budget, lender-accurate",
    description: "Applies the B-20 stress test, CMHC insurance and land-transfer tax to solve your true maximum price — then finds homes in range.",
    icon: "Calculator",
    audience: "consumer",
    category: "Buying",
    automates: "re-qualifies you as rates change and matches new listings to your budget",
    inputs: [
      { key: "income", label: "Household income", type: "number", placeholder: "130000", default: "130000", suffix: "$" },
      { key: "downPayment", label: "Down payment", type: "number", placeholder: "100000", default: "100000", suffix: "$" },
      { key: "city", label: "City", type: "select", options: cityOptions(false), default: "Toronto" },
      { key: "firstTimeBuyer", label: "First-time buyer?", type: "select", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], default: "yes" },
    ],
    run: R.affordabilityAgent,
  },
  {
    id: "relocation-concierge",
    name: "Newcomer Concierge",
    tagline: "A full settlement plan + safe rentals",
    description: "Builds your step-by-step relocation timeline and shortlists newcomer-friendly, ScamShield-checked rentals under budget.",
    icon: "Compass",
    audience: "consumer",
    category: "Renting & newcomers",
    automates: "guides your whole move and keeps a safe rental shortlist fresh",
    inputs: [
      { key: "city", label: "Destination city", type: "select", options: cityOptions(false), default: "Toronto" },
      { key: "monthlyBudget", label: "Monthly rent budget", type: "number", placeholder: "2500", default: "2500", suffix: "$" },
    ],
    run: R.relocationConcierge,
  },
  {
    id: "listing-optimizer",
    name: "Listing Optimizer",
    tagline: "Rewrites your listing to convert",
    description: "Audits your listing and generates a high-converting title, description, amenity list and a photography shot list.",
    icon: "PenLine",
    audience: "host",
    category: "Hosting",
    automates: "keeps your listing copy & keywords optimised across platforms",
    inputs: [{ key: "unit", label: "Property", type: "select", options: unitOptions() }],
    run: R.listingOptimizer,
  },
  {
    id: "dynamic-pricing",
    name: "Dynamic Pricing",
    tagline: "Prices every night for max revenue",
    description: "Sets nightly rates from seasonality, weekends and demand across your calendar — and updates them automatically.",
    icon: "LineChart",
    audience: "host",
    category: "Hosting",
    automates: "re-prices your calendar every night to capture demand",
    inputs: [
      { key: "unit", label: "Property", type: "select", options: unitOptions() },
      { key: "nights", label: "Nights ahead", type: "number", placeholder: "14", default: "14" },
    ],
    run: R.dynamicPricing,
  },
  {
    id: "turnover-ops",
    name: "Turnover Agent",
    tagline: "Schedules cleanings & restock",
    description: "Reads your checkout calendar and auto-schedules vetted cleaners, linens and restock after every stay.",
    icon: "Brush",
    audience: "host",
    category: "Hosting",
    automates: "schedules a clean the moment each booking is confirmed",
    inputs: [{ key: "unit", label: "Property", type: "select", options: unitOptions(true), default: "all" }],
    run: R.turnoverOps,
  },
  {
    id: "guest-concierge",
    name: "Guest Concierge",
    tagline: "Screens guests & drafts replies",
    description: "Detects the message type, screens the guest, and drafts an on-brand reply — ready to send or fully automated.",
    icon: "MessageSquare",
    audience: "host",
    category: "Hosting",
    automates: "answers guests 24/7 and screens every booking",
    inputs: [
      { key: "unit", label: "Property", type: "select", options: unitOptions() },
      { key: "scenario", label: "Message type", type: "select", options: [{ value: "inquiry", label: "New inquiry" }, { value: "checkin", label: "Check-in info" }, { value: "review", label: "Review request" }], default: "inquiry" },
    ],
    run: R.guestConcierge,
  },
  {
    id: "payout-report",
    name: "Payout Agent",
    tagline: "Reconciles & reports your earnings",
    description: "Reconciles every booking and fee, computes each property's net, flags anomalies and compiles your monthly statement.",
    icon: "Receipt",
    audience: "host",
    category: "Hosting",
    automates: "closes the books and pays you out every month",
    inputs: [],
    run: () => R.payoutReport(),
  },
  {
    id: "portfolio-growth",
    name: "Portfolio Growth",
    tagline: "Where to buy your next rental",
    description: "Models short-term-rental yields across every market and recommends where your next investment earns the most.",
    icon: "TrendingUp",
    audience: "host",
    category: "Hosting",
    automates: "scouts the highest-yield markets for your next purchase",
    inputs: [
      { key: "budget", label: "Investment budget", type: "number", placeholder: "600000", default: "600000", suffix: "$" },
      { key: "city", label: "City of interest", type: "select", options: cityOptions(false), default: "Toronto" },
    ],
    run: R.portfolioGrowth,
  },
  {
    id: "compliance",
    name: "Compliance Agent",
    tagline: "Checks local STR rules & licensing",
    description: "Looks up municipal short-term-rental bylaws, licensing and residence rules, then builds your compliance checklist.",
    icon: "Scale",
    audience: "host",
    category: "Hosting",
    automates: "keeps your listing compliant as bylaws change",
    inputs: [{ key: "city", label: "City", type: "select", options: cityOptions(false), default: "Toronto" }],
    run: R.complianceAgent,
  },
];

export const agentById = (id: string) => AGENTS.find((a) => a.id === id);
export const consumerAgents = AGENTS.filter((a) => a.audience === "consumer");
export const hostAgents = AGENTS.filter((a) => a.audience === "host");
