import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, Property } from "@/types";
import { properties } from "@/lib/data/properties";
import { assessListing } from "@/lib/scamShield";
import { formatCAD } from "@/lib/format";

// ───────────────────────────────────────────────────────────────────────────
// Aria — the MapleHaus AI real-estate copilot.
//
// When ANTHROPIC_API_KEY is set, Aria runs on Claude (claude-opus-4-8 by
// default, override with ARIA_MODEL). With no key, it falls back to a built-in
// heuristic engine so the platform is fully functional out of the box.
// ───────────────────────────────────────────────────────────────────────────

const MODEL = process.env.ARIA_MODEL || "claude-opus-4-8";

const SYSTEM_PROMPT = `You are Aria, the AI real-estate copilot for MapleHaus — Canada's intelligent real estate platform.

Your job is to help buyers, renters and newcomers navigate the Canadian housing market with radical transparency. MapleHaus exists to fix the things big Canadian portals leave broken:
- Hidden sold prices and no free, explainable home valuation → answer with TrueValue AI (the /valuation tool and the estimate on each listing).
- "Blind bidding" where buyers can't see competing offers → point to OfferIQ transparent bidding on eligible listings.
- Rental scams and unverified landlords that prey on newcomers → point to ScamShield trust scores on listings.
- A confusing mortgage stress test, CMHC insurance and land-transfer taxes → use AffordIQ (the /affordability tool).
- Newcomers with thin credit files and no Canadian history → the Newcomer Pathway (/newcomers).

How to respond:
- Be concise, warm and specific. Use Canadian dollars and Canadian context (provinces, GO/SkyTrain/REM, CMHC, B-20 stress test, FHSA, RRSP Home Buyers' Plan).
- Recommend real listings ONLY from the catalog provided below. Link them as /property/<slug>. Never invent listings, prices or addresses.
- When a buyer asks about affordability, qualifying or the stress test, explain briefly and point to /affordability.
- When asked what a home is worth, explain that TrueValue gives a free, explainable estimate with comparables, and reference the listing's estimate.
- When a renter (especially a newcomer) is worried about scams, explain ScamShield and the red flags (paying a deposit before viewing, rent far below market, no land-registry match).
- Reply in French if the user writes in French.
- Respond directly with your final answer. Do not include exploratory reasoning or restate the question.
- Use short Markdown: a sentence or two, then "- " bullets for listings or steps. Keep it under ~180 words unless asked for detail.`;

function buildCatalog(): string {
  const lines = properties.map((p) => {
    const risk = assessListing(p).risk;
    const tags = [
      p.newcomerFriendly ? "newcomer-friendly" : null,
      p.transparentBidding ? "OfferIQ-bidding" : null,
      risk !== "low" ? `scam-risk:${risk}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    const price = p.listingType === "rent" ? `${formatCAD(p.price)}/mo` : formatCAD(p.price);
    return `- /property/${p.slug} — "${p.title}" · ${p.address.city}, ${p.address.province} · ${p.propertyType} · ${p.listingType} · ${price} · ${p.beds}bd/${p.baths}ba · ${p.sqft}sqft${tags ? ` · ${tags}` : ""}`;
  });
  return `LISTING CATALOG (the only listings you may reference):\n${lines.join("\n")}`;
}

export async function askAria(messages: ChatMessage[]): Promise<{ answer: string; usedAI: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { answer: heuristicAnswer(messages), usedAI: false };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: [
        { type: "text", text: SYSTEM_PROMPT },
        { type: "text", text: buildCatalog(), cache_control: { type: "ephemeral" } },
      ],
      messages: messages
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content })),
    });

    if (response.stop_reason === "refusal") {
      return { answer: heuristicAnswer(messages), usedAI: false };
    }
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    if (!text) return { answer: heuristicAnswer(messages), usedAI: false };
    return { answer: text, usedAI: true };
  } catch {
    // Network / auth / rate-limit issues all degrade gracefully.
    return { answer: heuristicAnswer(messages), usedAI: false };
  }
}

// ── Heuristic fallback engine ──────────────────────────────────────────────

const CITY_NAMES = Array.from(new Set(properties.map((p) => p.address.city)));

function parseMaxPrice(text: string): number | null {
  // $1.2m / 1.2 million / under 900k / below 1,000,000 / 800000
  const m1 = text.match(/(\d+(?:\.\d+)?)\s*(m|million)\b/);
  if (m1) return parseFloat(m1[1]) * 1_000_000;
  const k = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  if (k) return parseFloat(k[1]) * 1_000;
  const plain = text.match(/(?:under|below|less than|up to|max)\s*\$?\s*([\d,]{4,})/);
  if (plain) return parseInt(plain[1].replace(/,/g, ""), 10);
  const dollars = text.match(/\$\s*([\d,]{4,})/);
  if (dollars) return parseInt(dollars[1].replace(/,/g, ""), 10);
  return null;
}

function listingLine(p: Property): string {
  const price = p.listingType === "rent" ? `${formatCAD(p.price)}/mo` : formatCAD(p.price);
  return `- **${p.title}** — ${p.address.city}, ${p.address.province} · ${price} · ${p.beds} bed / ${p.baths} bath · [View listing](/property/${p.slug})`;
}

function heuristicAnswer(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const text = (last?.content ?? "").toLowerCase();

  if (!text.trim() || /\b(hi|hello|hey|what can you|who are you|help|start)\b/.test(text)) {
    return [
      "Hi — I'm **Aria**, your MapleHaus copilot. I can help you with the things other Canadian portals hide:",
      "- **Find listings** — try \"2-bed condo in Vancouver under $900k\" or \"newcomer-friendly rentals in Toronto\"",
      "- **TrueValue** — a free, explainable home value with comparables → [/valuation](/valuation)",
      "- **AffordIQ** — what you can actually afford after the stress test → [/affordability](/affordability)",
      "- **ScamShield** — spot rental scams before you pay a deposit",
      "What are you looking for?",
    ].join("\n");
  }

  if (/\b(blind bid|bidding|offer|how much should i offer|outbid)\b/.test(text)) {
    return [
      "Canada's **blind bidding** system hides competing offers from you — MapleHaus fixes that with **OfferIQ**.",
      "On listings where the seller opts in, you can see anonymised offer activity and an AI-recommended offer strategy instead of guessing.",
      "- Look for the green **OfferIQ transparent bidding** badge on a listing.",
      "Want me to show you listings that have it turned on?",
    ].join("\n");
  }

  if (/\b(scam|fake|fraud|too good|deposit|e-?transfer|verify landlord)\b/.test(text)) {
    return [
      "**ScamShield** scores every listing on identity, ownership (vs. the land registry), photo authenticity, price sanity and duplicate ads.",
      "Red flags to never ignore:",
      "- Being asked to send a deposit or e-transfer **before** viewing",
      "- Rent far below market for the area",
      "- A \"landlord\" who is overseas and can't show the unit",
      "Every MapleHaus listing shows a trust score and warnings up front — especially important for newcomers.",
    ].join("\n");
  }

  if (/\b(newcomer|immigrant|new to canada|no credit|thin credit|work permit|pr |permanent resident|international student)\b/.test(text)) {
    const friendly = properties.filter((p) => p.newcomerFriendly && p.listingType === "rent").slice(0, 3);
    return [
      "Welcome to Canada! The **Newcomer Pathway** is built for thin credit files and no Canadian history.",
      "- Filter for **newcomer-friendly** listings (guarantor / alternative-credit programs accepted)",
      "- Use **ScamShield** — newcomers are the #1 target for rental fraud",
      "- See [/newcomers](/newcomers) for the full step-by-step journey",
      ...(friendly.length ? ["", "A few newcomer-friendly rentals right now:", ...friendly.map(listingLine)] : []),
    ].join("\n");
  }

  if (/\b(afford|mortgage|stress test|qualify|down payment|cmhc|how much can i|income)\b/.test(text)) {
    return [
      "**AffordIQ** qualifies you the way a Canadian lender does — using the **B-20 stress test** (the greater of 5.25% or your rate + 2%).",
      "It folds in CMHC insurance, land-transfer tax and first-time-buyer rebates so you see your *real* maximum price.",
      "- Run your numbers at [/affordability](/affordability)",
      "Tell me your household income and down payment and I'll point you to listings in range.",
    ].join("\n");
  }

  if (/\b(worth|value|valuation|zestimate|estimate|what.*sold for|sold price|price history)\b/.test(text)) {
    return [
      "**TrueValue AI** gives a free, *explainable* estimate — the value, a confidence band, the comparable sales behind it, and full price history.",
      "It's the data Canadian buyers usually can't get for free anywhere else.",
      "- Try it at [/valuation](/valuation), or open any listing to see its estimate vs. the asking price.",
      "Which property or area would you like a value on?",
    ].join("\n");
  }

  // Otherwise treat it as a property search.
  let base = properties.filter((p) => p.listingType !== "sold");
  if (/\b(rent|rental|lease|tenant)\b/.test(text)) base = base.filter((p) => p.listingType === "rent");
  else if (/\b(pre.?con|pre.?construction|new build|new development)\b/.test(text)) base = base.filter((p) => p.listingType === "preconstruction");
  else if (/\b(buy|sale|for sale|purchase)\b/.test(text)) base = base.filter((p) => p.listingType === "sale" || p.listingType === "preconstruction");

  const city = CITY_NAMES.find((c) => text.includes(c.toLowerCase()));
  if (city) base = base.filter((p) => p.address.city === city);

  // Refinements are "preferred", not hard requirements — if they empty the set
  // we fall back to the broader city pool and say so.
  let refined = base;

  const beds = text.match(/(\d+)\s*[-]?\s*(?:\+)?\s*(?:bed|bd|br|bedroom)/);
  if (beds) refined = refined.filter((p) => p.beds >= parseInt(beds[1], 10));

  const typeMap: [RegExp, string[]][] = [
    [/\bcondo|apartment\b/, ["Condo Apartment", "Loft"]],
    [/\bdetached\b/, ["Detached"]],
    [/\btownhouse|town home|townhome\b/, ["Townhouse"]],
    [/\bsemi\b/, ["Semi-Detached"]],
    [/\bloft\b/, ["Loft"]],
    [/\bduplex|plex\b/, ["Duplex"]],
    [/\bbungalow\b/, ["Bungalow"]],
  ];
  const typeHit = typeMap.find(([re]) => re.test(text));
  if (typeHit) refined = refined.filter((p) => typeHit[1].includes(p.propertyType));

  if (/\bnewcomer|new to canada\b/.test(text)) refined = refined.filter((p) => p.newcomerFriendly);

  const maxPrice = parseMaxPrice(text);
  if (maxPrice) refined = refined.filter((p) => p.price <= maxPrice);

  const broadened = refined.length === 0 && base.length > 0;
  const final = (broadened ? base : refined)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.price - b.price)
    .slice(0, 3);

  if (!final.length) {
    return [
      "I couldn't find a match in our current sample listings for that.",
      "Try a different city or budget — or browse everything on the [search page](/search).",
    ].join("\n");
  }

  const where = city ? ` in ${city}` : "";
  const opener = broadened
    ? `I didn't find an exact match, but here ${final.length === 1 ? "is a close option" : "are some close options"}${where}:`
    : `Here ${final.length === 1 ? "is" : "are"} ${final.length} option${final.length > 1 ? "s" : ""}${where} that ${final.length === 1 ? "fits" : "fit"}:`;
  return [opener, ...final.map(listingLine), "", "Open any listing to see its TrueValue estimate, price history and ScamShield trust score."].join("\n");
}
