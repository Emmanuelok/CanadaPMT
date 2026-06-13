import type { AgentRun, ListingRef, RunRow } from "./types";
import { num } from "./types";
import { formatCAD } from "@/lib/format";
import { properties, propertyBySlug } from "@/lib/data/properties";
import { valueProperty } from "@/lib/valuation";
import { assessListing } from "@/lib/scamShield";
import { propertySignals } from "@/lib/signals";
import { affordability } from "@/lib/mortgage";
import { defaultFilters, applyFilters } from "@/lib/search";
import { estimateStr, SPACE_TYPES } from "@/lib/str";
import { portfolio, aggregate, unitById, PRICE_SEASON, type HostUnit } from "@/lib/host/portfolio";
import { getStayDetails } from "@/lib/host/stay";
import { CITY_DATA } from "@/lib/data/cities";
import type { Province } from "@/types";

const TODAY = new Date("2026-06-13");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

function err(agentId: string, title: string, summary: string): AgentRun {
  return { agentId, title, steps: [{ label: "Could not run" }], summary };
}

function listingRef(slug: string): ListingRef | null {
  const p = propertyBySlug(slug);
  if (!p) return null;
  return {
    slug: p.slug,
    title: p.title,
    city: `${p.address.city}, ${p.address.province}`,
    price: p.listingType === "rent" ? `${formatCAD(p.price)}/mo` : formatCAD(p.price),
  };
}

// ── Consumer agents ──────────────────────────────────────────────────────────

export function dealHunter(input: Record<string, string>): AgentRun {
  const city = input.city && input.city !== "any" ? input.city : "";
  const maxPrice = num(input.maxPrice);
  const minBeds = num(input.minBeds);

  const filters = { ...defaultFilters("sale"), city, maxPrice, minBeds };
  const base = applyFilters(filters);

  const scored = base.map((p) => ({ p, v: valueProperty(p), s: propertySignals(p) }));
  scored.sort((a, b) => a.v.askingDelta - b.v.askingDelta || b.s.matchScore - a.s.matchScore);
  const top = scored.slice(0, 5);

  const undervalued = scored.filter((x) => x.v.askingDelta < 0).length;
  const biggest = Math.max(0, ...scored.map((x) => -x.v.askingDelta));
  const avgConf = scored.length ? Math.round(scored.reduce((a, x) => a + x.v.confidence, 0) / scored.length) : 0;

  const listings: ListingRef[] = top.map(({ p, v, s }) => {
    const below = v.askingDelta < 0;
    return {
      slug: p.slug,
      title: p.title,
      city: `${p.address.city}, ${p.address.province}`,
      price: formatCAD(p.price),
      note: `AI value ${formatCAD(v.estimate)} · ${below ? `${Math.abs(v.askingDelta)}% below value` : `${v.askingDelta}% above value`} · match ${s.matchScore}`,
      tone: below ? "good" : "neutral",
    };
  });

  return {
    agentId: "deal-hunter",
    title: `Deal Hunter · ${city || "all markets"}`,
    steps: [
      { label: `Scanned ${base.length} active listings`, detail: city ? `in ${city}` : "across all cities" },
      { label: "Ran TrueValue on every candidate" },
      { label: "Ranked by AI value vs. asking + your match score" },
      { label: `Surfaced ${listings.length} best opportunities` },
    ],
    summary: base.length
      ? `Scanned **${base.length}** listings — **${undervalued}** are priced below their TrueValue estimate. The strongest is **${biggest.toFixed(0)}%** under AI value. I'll keep watching this search and alert you on new under-priced homes and price drops.`
      : "No active listings match those filters yet. Try widening the city or budget — I'll keep watching.",
    metrics: [
      { label: "Listings scanned", value: String(base.length) },
      { label: "Below AI value", value: String(undervalued), tone: undervalued ? "good" : "neutral" },
      { label: "Biggest discount", value: `${biggest.toFixed(0)}%`, tone: biggest > 0 ? "good" : "neutral" },
      { label: "Avg confidence", value: `${avgConf}%` },
    ],
    listings,
    actions: [{ label: "Open in search", href: `/search?type=sale${city ? `&city=${encodeURIComponent(city)}` : ""}` }],
  };
}

export function offerStrategist(input: Record<string, string>): AgentRun {
  const p = propertyBySlug(input.property);
  if (!p) return err("offer-strategist", "Offer Strategist", "Pick a listing to analyze.");

  const v = valueProperty(p);
  const ask = p.price;
  const est = v.estimate;
  const dom = p.daysOnMarket;

  let base = Math.min(ask, est);
  if (dom > 45) base *= 0.96;
  else if (dom > 21) base *= 0.98;
  if (p.transparentBidding && dom <= 10 && est >= ask) base = ask;
  else if (!p.transparentBidding && dom <= 10) base = Math.min(ask, est);
  const suggested = Math.round(base / 1000) * 1000;
  const vsAsking = ((suggested - ask) / ask) * 100;

  const rows: RunRow[] = p.priceHistory.map((e) => ({ cells: [e.date, e.event, formatCAD(e.price)] }));

  const overpriced = v.askingDelta > 1;
  const stale = dom > 30;
  const strategy = [
    overpriced
      ? `It's listed **${v.askingDelta}% above** TrueValue, so anchor your opening offer below asking.`
      : v.askingDelta < -1
        ? `It's **${Math.abs(v.askingDelta)}% below** TrueValue — priced to move, so move decisively.`
        : `It's priced near TrueValue.`,
    stale ? `On market **${dom} days** — that's leverage to negotiate.` : `Only **${dom} days** on market — expect competition.`,
    p.transparentBidding
      ? `OfferIQ is on, so you can bid precisely against real offer activity.`
      : `Bidding is blind here — pad slightly and lead with strong conditions.`,
  ].join(" ");

  return {
    agentId: "offer-strategist",
    title: `Offer Strategist · ${p.address.city}`,
    steps: [
      { label: "Pulled TrueValue estimate & comparables" },
      { label: "Analyzed price history & days on market" },
      { label: "Checked OfferIQ transparent-bidding status" },
      { label: "Computed a recommended offer" },
    ],
    summary: `Recommended opening offer: **${formatCAD(suggested)}** (${vsAsking >= 0 ? "+" : ""}${vsAsking.toFixed(1)}% vs. asking). ${strategy}`,
    metrics: [
      { label: "Suggested offer", value: formatCAD(suggested), tone: "good" },
      { label: "vs. asking", value: `${vsAsking >= 0 ? "+" : ""}${vsAsking.toFixed(1)}%`, tone: vsAsking < 0 ? "good" : "neutral" },
      { label: "AI value", value: formatCAD(est) },
      { label: "Days on market", value: String(dom), tone: stale ? "good" : "neutral" },
    ],
    table: { head: ["Date", "Event", "Price"], rows },
    actions: [
      { label: "View listing", href: `/property/${p.slug}` },
      { label: "Check what you can afford", href: "/affordability" },
    ],
  };
}

export function scamShieldAgent(input: Record<string, string>): AgentRun {
  const p = propertyBySlug(input.property);
  if (!p) return err("scam-shield", "ScamShield", "Pick a listing to verify.");

  const a = assessListing(p);
  const rows: RunRow[] = [
    ...a.positives.map((t) => ({ cells: ["✓ Pass", t], tone: "good" as const })),
    ...a.warnings.map((t) => ({ cells: ["! Flag", t], tone: "bad" as const })),
  ];
  const tone = a.risk === "low" ? "good" : a.risk === "medium" ? "warn" : "bad";

  return {
    agentId: "scam-shield",
    title: `ScamShield · ${p.address.city}`,
    steps: [
      { label: "Verified identity & ownership vs. land registry" },
      { label: "Checked photo authenticity & duplicates" },
      { label: "Sanity-checked price against the market" },
      { label: "Scored overall trust" },
    ],
    summary:
      a.risk === "low"
        ? `**Trust score ${a.score}/100 — low risk.** Nothing alarming, but never send a deposit before an in-person or video viewing.`
        : `**Trust score ${a.score}/100 — ${a.risk} risk.** ${a.warnings[0] ?? "Proceed carefully."} Never pay a deposit before verifying the landlord and viewing the unit.`,
    metrics: [
      { label: "Trust score", value: `${a.score}/100`, tone },
      { label: "Risk level", value: a.risk.toUpperCase(), tone },
      { label: "Green flags", value: String(a.positives.length), tone: "good" },
      { label: "Warnings", value: String(a.warnings.length), tone: a.warnings.length ? "bad" : "good" },
    ],
    table: { head: ["", "Signal"], rows },
    actions: [{ label: "View listing", href: `/property/${p.slug}` }],
  };
}

export function affordabilityAgent(input: Record<string, string>): AgentRun {
  const income = num(input.income, 120000);
  const down = num(input.downPayment, 100000);
  const city = input.city && input.city !== "any" ? input.city : "Toronto";
  const province: Province = (CITY_DATA.find((c) => c.name === city)?.province ?? "ON") as Province;
  const ftb = input.firstTimeBuyer === "yes";

  const res = affordability({
    householdIncome: income,
    downPayment: down,
    contractRate: 4.79,
    amortizationYears: 25,
    monthlyDebts: num(input.monthlyDebts, 0),
    province,
    city,
    firstTimeBuyer: ftb,
  });

  const inRange = applyFilters({ ...defaultFilters("sale"), city, maxPrice: res.maxPurchasePrice });
  const listings: ListingRef[] = inRange.slice(0, 4).map((p) => ({
    slug: p.slug,
    title: p.title,
    city: `${p.address.city}, ${p.address.province}`,
    price: formatCAD(p.price),
    note: `${p.beds} bed · within budget`,
    tone: "good",
  }));

  return {
    agentId: "affordability",
    title: `Pre-Approval · ${city}`,
    steps: [
      { label: "Applied the B-20 stress test", detail: `${res.stressTestRate}% qualifying rate` },
      { label: "Folded in CMHC insurance & land-transfer tax" },
      { label: `Solved for your max price in ${city}` },
      { label: "Matched listings within budget" },
    ],
    summary: `On **${formatCAD(income)}** income with **${formatCAD(down)}** down, you qualify up to **${formatCAD(res.maxPurchasePrice)}** (≈ ${formatCAD(res.monthlyPayment)}/mo). ${res.notes[0] ?? ""}`,
    metrics: [
      { label: "Max price", value: formatCAD(res.maxPurchasePrice), tone: "good" },
      { label: "Monthly payment", value: formatCAD(res.monthlyPayment) },
      { label: "Stress rate", value: `${res.stressTestRate}%` },
      { label: "Down payment", value: `${res.downPaymentPct}%`, tone: res.downPaymentPct < 20 ? "warn" : "good" },
    ],
    listings,
    actions: [
      { label: "Full breakdown", href: "/affordability" },
      { label: "Browse in budget", href: `/search?type=sale&city=${encodeURIComponent(city)}` },
    ],
  };
}

export function relocationConcierge(input: Record<string, string>): AgentRun {
  const city = input.city && input.city !== "any" ? input.city : "Toronto";
  const budget = num(input.monthlyBudget, 2500);

  let rentals = applyFilters({ ...defaultFilters("rent"), city, newcomerOnly: true, maxPrice: budget });
  if (rentals.length === 0) rentals = applyFilters({ ...defaultFilters("rent"), city, maxPrice: budget });
  const listings: ListingRef[] = rentals.slice(0, 4).map((p) => ({
    slug: p.slug,
    title: p.title,
    city: `${p.address.city}, ${p.address.province}`,
    price: `${formatCAD(p.price)}/mo`,
    note: "newcomer-friendly",
    tone: "good",
  }));

  const rows: RunRow[] = [
    { cells: ["1 · Before you arrive", "Gather ID, proof of funds, references; line up a guarantor"] },
    { cells: ["2 · First week", "Open a Canadian bank account and apply for your SIN"] },
    { cells: ["3 · Housing", "Shortlist newcomer-friendly rentals — never pay a deposit before viewing"] },
    { cells: ["4 · Credit", "Get a secured credit card and autopay a small bill to build history"] },
    { cells: ["5 · Settle in", "Set up utilities, transit and your provincial health card"] },
  ];

  return {
    agentId: "relocation-concierge",
    title: `Newcomer Concierge · ${city}`,
    steps: [
      { label: "Built your settlement timeline" },
      { label: `Filtered newcomer-friendly rentals in ${city}` },
      { label: "Screened each with ScamShield" },
      { label: "Assembled your plan" },
    ],
    summary: `Here's your step-by-step path to settling in **${city}** under **${formatCAD(budget)}/mo** — with ${listings.length} newcomer-friendly, ScamShield-checked rentals to start with.`,
    metrics: [
      { label: "Rentals found", value: String(rentals.length), tone: rentals.length ? "good" : "neutral" },
      { label: "Under budget", value: `${formatCAD(budget)}/mo` },
      { label: "All ScamShield-checked", value: "Yes", tone: "good" },
    ],
    table: { head: ["Phase", "Action"], rows },
    listings,
    actions: [{ label: "Newcomer Pathway", href: "/newcomers" }],
  };
}

// ── Host agents ──────────────────────────────────────────────────────────────

function requireUnit(id: string): HostUnit | undefined {
  return unitById(id) ?? portfolio.units[0];
}

export function listingOptimizer(input: Record<string, string>): AgentRun {
  const u = requireUnit(input.unit);
  if (!u) return err("listing-optimizer", "Listing Optimizer", "Pick a property.");
  const d = getStayDetails(u);
  const space = SPACE_TYPES[u.spaceType].label;
  const title = `${space} in ${u.city} · sleeps ${d.guests} · self check-in`;
  const completeness = Math.min(100, 64 + d.amenities.length * 4);
  const lift = Math.round((100 - completeness) / 3) + 7;

  const shots: RunRow[] = [
    { cells: ["1", "Bright hero shot", "First impression — drives click-through"] },
    { cells: ["2", "Living space, wide angle", "Shows comfort and space"] },
    { cells: ["3", "Kitchen", "Self-catering is a top filter"] },
    { cells: ["4", "Primary bedroom", "Sets the comfort expectation"] },
    { cells: ["5", "Bathroom detail", "Cleanliness signals trust"] },
    { cells: ["6", "Neighbourhood / view", "Sells the location"] },
  ];

  return {
    agentId: "listing-optimizer",
    title: `Listing Optimizer · ${u.nickname}`,
    steps: [
      { label: "Audited the current listing" },
      { label: "Rewrote the title & description for conversion" },
      { label: "Optimised the amenity list & keywords" },
      { label: "Generated a photography shot list" },
    ],
    summary: `Refreshed **${u.nickname}** for higher conversion — a sharper title, a benefit-led description, ${d.amenities.length} surfaced amenities and a 6-shot photo plan. Estimated **+${lift}%** booking lift.`,
    metrics: [
      { label: "Listing completeness", value: `${completeness}%`, tone: completeness >= 90 ? "good" : "warn" },
      { label: "Est. booking lift", value: `+${lift}%`, tone: "good" },
      { label: "Amenities surfaced", value: String(d.amenities.length) },
      { label: "Sleeps", value: String(d.guests) },
    ],
    table: { head: ["#", "Shot", "Why"], rows: shots },
    draft: { title: "Optimized listing copy", body: `${title}\n\n${d.description}` },
    actions: [{ label: "View public listing", href: `/host/stay/${u.id}` }],
  };
}

export function dynamicPricing(input: Record<string, string>): AgentRun {
  const u = requireUnit(input.unit);
  if (!u) return err("dynamic-pricing", "Dynamic Pricing", "Pick a property.");
  const horizon = Math.min(21, Math.max(7, num(input.nights, 14)));
  const baseAdr = u.adr;

  const rows: RunRow[] = [];
  let sumOpt = 0;
  for (let i = 0; i < horizon; i++) {
    const day = addDays(TODAY, i);
    const weekend = day.getDay() === 5 || day.getDay() === 6;
    const optimized = Math.round((baseAdr * PRICE_SEASON[day.getMonth()] * (weekend ? 1.12 : 1)) / 5) * 5;
    sumOpt += optimized;
    rows.push({
      cells: [dayLabel(day), formatCAD(baseAdr), formatCAD(optimized), weekend ? "Weekend" : "Weekday"],
      tone: optimized > baseAdr ? "good" : "neutral",
    });
  }
  const avgOpt = Math.round(sumOpt / horizon);
  const upliftPct = Math.round((avgOpt / baseAdr - 1) * 100);
  const extra = Math.round((sumOpt - baseAdr * horizon) * 0.7);

  return {
    agentId: "dynamic-pricing",
    title: `Dynamic Pricing · ${u.nickname}`,
    steps: [
      { label: "Pulled base rate & seasonality" },
      { label: "Layered weekend & demand premiums" },
      { label: `Priced the next ${horizon} nights` },
      { label: "Pushed the calendar live" },
    ],
    summary: `Re-priced the next **${horizon} nights** for ${u.nickname}. Average optimised rate **${formatCAD(avgOpt)}** (**+${upliftPct}%** vs. base), an estimated **${formatCAD(extra)}** of extra revenue over the window. This runs every night automatically.`,
    metrics: [
      { label: "Avg optimised rate", value: formatCAD(avgOpt), tone: "good" },
      { label: "Uplift vs. base", value: `+${upliftPct}%`, tone: "good" },
      { label: "Nights priced", value: String(horizon) },
      { label: "Est. extra revenue", value: formatCAD(extra), tone: "good" },
    ],
    table: { head: ["Date", "Base", "Autopilot", "Day"], rows },
    actions: [{ label: "Owner dashboard", href: "/host/dashboard" }],
  };
}

const CLEANERS = ["Maria's Team", "SparkleBnB", "FreshStay Co.", "TidyTurn"];

export function turnoverOps(input: Record<string, string>): AgentRun {
  const all = input.unit === "all" || !input.unit;
  const units = all ? portfolio.units : [requireUnit(input.unit)!];
  const bookings = units.flatMap((u) => u.bookings).sort((a, b) => a.checkOut.localeCompare(b.checkOut)).slice(0, 7);

  const rows: RunRow[] = bookings.map((b, i) => ({
    cells: [b.checkOut, b.unitNickname, "Turnover clean", CLEANERS[i % CLEANERS.length], "Scheduled"],
    tone: "good",
  }));

  return {
    agentId: "turnover-ops",
    title: `Turnover Agent · ${all ? "all properties" : units[0].nickname}`,
    steps: [
      { label: "Read the upcoming checkout calendar" },
      { label: "Scheduled a clean after every checkout" },
      { label: "Assigned vetted cleaners" },
      { label: "Queued linens & restock" },
    ],
    summary: `Scheduled **${rows.length}** turnovers across ${all ? `${units.length} properties` : units[0].nickname}, each assigned to a vetted cleaner with linens and restock queued. New bookings auto-schedule the moment they're confirmed.`,
    metrics: [
      { label: "Turnovers scheduled", value: String(rows.length), tone: "good" },
      { label: "Next clean", value: rows[0] ? rows[0].cells[0] : "—" },
      { label: "Cleaner hours", value: String(rows.length * 3) },
      { label: "Linen sets", value: String(rows.length) },
    ],
    table: { head: ["Date", "Property", "Task", "Assigned", "Status"], rows },
    actions: [{ label: "Owner dashboard", href: "/host/dashboard" }],
  };
}

export function guestConcierge(input: Record<string, string>): AgentRun {
  const u = requireUnit(input.unit);
  if (!u) return err("guest-concierge", "Guest Concierge", "Pick a property.");
  const scenario = input.scenario || "inquiry";

  let body = "";
  if (scenario === "checkin") {
    body = `Hi! We're so glad you're staying at ${u.nickname}. 🎉\n\nCheck-in is any time after 3:00 PM. Your door code is 2480# and full directions are in the app. The WiFi is "MapleHaus_Guest" (password on the fridge), coffee is stocked, and there's a local-favourites guide on the counter.\n\nAnything at all, just message — we're here 24/7. Enjoy ${u.city}!`;
  } else if (scenario === "review") {
    body = `Hi! It was a pleasure hosting you at ${u.nickname} — thanks for being such considerate guests. 🙏\n\nIf you have a moment, a quick review really helps us out, and we've left a 5-star review for you. You're welcome back anytime — returning guests get a standing discount.`;
  } else {
    body = `Hi! Thanks for your interest in ${u.nickname}. 😊\n\nYes, those dates are available! The space sleeps ${getStayDetails(u).guests}, has fast WiFi and self check-in, and is professionally cleaned before every stay. Happy to answer anything — shall I hold the dates for you?`;
  }

  const rows: RunRow[] = [
    { cells: ["Verified profile & ID", "Pass"], tone: "good" },
    { cells: ["Positive past reviews", "Pass"], tone: "good" },
    { cells: ["Trip purpose stated", "Pass"], tone: "good" },
    { cells: ["No local-party risk flags", "Pass"], tone: "good" },
  ];

  return {
    agentId: "guest-concierge",
    title: `Guest Concierge · ${u.nickname}`,
    steps: [
      { label: "Detected the message type" },
      { label: "Screened the guest" },
      { label: "Drafted an on-brand reply" },
      { label: "Ready to send (or auto-send)" },
    ],
    summary: `Drafted a ${scenario === "checkin" ? "check-in" : scenario === "review" ? "review-request" : "inquiry"} reply for ${u.nickname} and screened the guest — all checks passed. Average response time stays under 5 minutes, 24/7.`,
    metrics: [
      { label: "Response SLA", value: "< 5 min", tone: "good" },
      { label: "Guest screening", value: "Passed", tone: "good" },
      { label: "Coverage", value: "24 / 7" },
    ],
    table: { head: ["Screening check", "Result"], rows },
    draft: { title: "Drafted guest message", body },
    actions: [{ label: "View listing", href: `/host/stay/${u.id}` }],
  };
}

export function payoutReport(): AgentRun {
  const agg = aggregate(portfolio.units);
  const m = agg.months[agg.months.length - 1];
  const rows: RunRow[] = portfolio.units.map((u) => {
    const lm = u.months[u.months.length - 1];
    return {
      cells: [u.nickname, `${lm.occupancyPct}%`, formatCAD(lm.gross), `− ${formatCAD(lm.fee)}`, formatCAD(lm.net)],
      tone: lm.occupancyPct > 0 && lm.occupancyPct < 40 ? "warn" : "neutral",
    };
  });
  const lowOcc = portfolio.units.filter((u) => {
    const lm = u.months[u.months.length - 1];
    return lm.occupancyPct > 0 && lm.occupancyPct < 40;
  });

  return {
    agentId: "payout-report",
    title: `Payout Agent · ${m.label} statement`,
    steps: [
      { label: "Reconciled every booking & fee" },
      { label: "Computed each property's net" },
      { label: "Scanned for anomalies" },
      { label: "Compiled your statement" },
    ],
    summary: `${m.label} statement is ready: **${formatCAD(m.net)}** net across ${portfolio.units.length} properties on **${formatCAD(m.gross)}** gross. Next payout ${agg.nextPayout.date}.${lowOcc.length ? ` Heads-up: ${lowOcc[0].nickname} is running soft — I'd recommend the Dynamic Pricing agent.` : ""}`,
    metrics: [
      { label: "Net payout", value: formatCAD(m.net), tone: "good" },
      { label: "Gross revenue", value: formatCAD(m.gross) },
      { label: "Our fee", value: formatCAD(m.fee) },
      { label: "Occupancy", value: `${m.occupancyPct}%` },
    ],
    table: { head: ["Property", "Occ", "Gross", "Fee", "Net"], rows },
    actions: [{ label: "Owner dashboard", href: "/host/dashboard" }],
  };
}

interface Rule {
  registration: boolean;
  principalResidenceOnly: boolean;
  maxNights: number | null;
  note: string;
}
const COMPLIANCE: Record<string, Rule> = {
  Toronto: { registration: true, principalResidenceOnly: true, maxNights: 180, note: "Register with the City; entire-home rentals are limited to your principal residence (max 180 nights/yr while away)." },
  Vancouver: { registration: true, principalResidenceOnly: true, maxNights: null, note: "A business licence is required and short-term rentals must be in your principal residence." },
  Montreal: { registration: true, principalResidenceOnly: false, maxNights: null, note: "Register with the CITQ and display your number; permitted zones vary by borough." },
  Ottawa: { registration: true, principalResidenceOnly: true, maxNights: null, note: "A host permit is required and STR is limited to your principal residence." },
  Kelowna: { registration: true, principalResidenceOnly: true, maxNights: null, note: "BC's provincial rules apply — a principal-residence requirement and business licence in most zones." },
  Calgary: { registration: true, principalResidenceOnly: false, maxNights: null, note: "A tiered business licence is required (fire inspection for larger operations)." },
};
const DEFAULT_RULE: Rule = { registration: true, principalResidenceOnly: false, maxNights: null, note: "Most municipalities require registration or a business licence — confirm the specifics with the city." };

export function complianceAgent(input: Record<string, string>): AgentRun {
  const city = input.city && input.city !== "any" ? input.city : "Toronto";
  const r = COMPLIANCE[city] ?? DEFAULT_RULE;

  const rows: RunRow[] = [
    { cells: ["Registration / licence", r.registration ? "Required — we'll file it" : "Not required"], tone: r.registration ? "warn" : "good" },
    { cells: ["Principal-residence rule", r.principalResidenceOnly ? "Yes — must be your home" : "No restriction"], tone: r.principalResidenceOnly ? "bad" : "good" },
    { cells: ["Annual night cap", r.maxNights ? `${r.maxNights} nights/yr` : "No cap"], tone: r.maxNights ? "warn" : "good" },
    { cells: ["Insurance & safety", "Smoke/CO detectors + STR insurance — included"], tone: "good" },
  ];

  return {
    agentId: "compliance",
    title: `Compliance Agent · ${city}`,
    steps: [
      { label: `Looked up ${city} STR bylaws` },
      { label: "Checked licensing & residence rules" },
      { label: "Built your compliance checklist" },
    ],
    summary: `**${city}:** ${r.note} We handle registration, safety requirements and insurance as part of onboarding. *Always confirm current rules with the municipality — they change often.*`,
    metrics: [
      { label: "Registration", value: r.registration ? "Required" : "Not required", tone: r.registration ? "warn" : "good" },
      { label: "Principal residence", value: r.principalResidenceOnly ? "Required" : "Not required", tone: r.principalResidenceOnly ? "bad" : "good" },
      { label: "Night cap", value: r.maxNights ? `${r.maxNights}/yr` : "None", tone: r.maxNights ? "warn" : "good" },
    ],
    table: { head: ["Requirement", "Status"], rows },
    actions: [{ label: "Talk to MapleHaus Host", href: "/host#start" }],
  };
}

// Host-earnings estimate, reused by the orchestrator for owner goals.
export function earningsEstimator(input: Record<string, string>): AgentRun {
  const city = input.city && input.city !== "any" ? input.city : "Toronto";
  const spaceType = (input.spaceType as keyof typeof SPACE_TYPES) || "entire";
  const beds = num(input.bedrooms, 2);
  const e = estimateStr(city, SPACE_TYPES[spaceType] ? spaceType : "entire", beds, "full");

  return {
    agentId: "earnings-estimator",
    title: `Earnings Estimator · ${city}`,
    steps: [
      { label: "Modelled nightly rate & occupancy" },
      { label: "Applied the management fee" },
      { label: "Compared against a long-term lease" },
    ],
    summary: `${SPACE_TYPES[spaceType]?.label ?? "Your place"} in **${city}** could net about **${formatCAD(e.ownerNetMonthly)}/mo** after our fee — roughly **${formatCAD(e.upliftMonthly)}/mo more** than a long-term lease.`,
    metrics: [
      { label: "Net / month", value: formatCAD(e.ownerNetMonthly), tone: "good" },
      { label: "Nightly rate", value: formatCAD(e.adr) },
      { label: "Occupancy", value: `${e.occupancyPct}%` },
      { label: "vs. long lease", value: `+${formatCAD(e.upliftMonthly)}/mo`, tone: "good" },
    ],
    actions: [{ label: "Get a custom estimate", href: "/host#estimate" }],
  };
}
