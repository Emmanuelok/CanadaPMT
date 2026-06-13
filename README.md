# 🍁 MapleHaus — Canada's Intelligent Real Estate Platform

> A Zillow-class, **AI-powered SaaS real estate platform built for Canada** — with an opinionated focus on the problems the big Canadian portals leave unsolved.

MapleHaus is a full, runnable Next.js application: property search with a map, rich listing pages, an AI valuation engine, a stress-test-aware affordability calculator, rental-fraud detection, a newcomer journey, an agent network, SaaS pricing, and **Aria**, a conversational AI copilot that ties it all together.

It runs end-to-end **with zero configuration** — every AI feature degrades gracefully to a built-in engine when no API key is present.

---

## 🎯 The critical niche — problems Canadian real estate isn't solving

This platform was designed around real, researched gaps in the Canadian market. Each pain point maps directly to a product feature.

| # | Unsolved pain point | What we built | Where |
|---|---------------------|---------------|-------|
| 1 | **Sold prices & home values stay hidden.** It took a multi-year Competition Bureau case to force sold data open, and most Canadians still can't freely see what a home sold for or get a credible valuation. | **TrueValue AI** — free, explainable valuations with a confidence band, comparables and full price history on every listing. | `/valuation`, every listing |
| 2 | **Buyers are forced to bid blind.** "Blind bidding" hides competing offers, inflating prices — one of the most-cited consumer complaints. | **OfferIQ** — opt-in transparent bidding with anonymised offer activity and an AI-recommended offer. | `/about#offeriq`, listing badges |
| 3 | **Rental fraud preys on the vulnerable.** Scam listings and deposit theft disproportionately target newcomers and students. | **ScamShield** — every listing scored on identity, land-registry ownership, photo authenticity, price sanity and cross-platform duplication. | every listing, `/newcomers` |
| 4 | **Affordability is a black box.** The B-20 stress test, CMHC insurance and province/city land-transfer taxes make qualifying genuinely confusing. | **AffordIQ** — qualifies you the way a lender does, tied directly to listings. | `/affordability` |
| 5 | **Newcomers are locked out.** The system assumes Canadian credit history and references new arrivals don't have yet. | **Newcomer Pathway** — newcomer-friendly listings + lenders, a step-by-step bilingual journey, and scam protection. | `/newcomers` |
| 6 | **Data is fragmented & agent oversight is thin.** Listings, sold data, schools, transit, climate risk and agent track records live in silos. | **Neighbourhood IQ** + a **verified agent network** with real, comparable performance data. | listings, `/agents` |

Everything is orchestrated by **Aria**, an AI copilot that lets users search, value, qualify and verify in one conversation.

### Research & sources

The pain points above were grounded in current reporting on the Canadian market:

- Sold-price transparency / the TREB–Competition Bureau case — [CBC](https://www.cbc.ca/news/business/court-ruling-house-sales-data-1.4434251), [Zolo: Sold House Prices in Canada](https://www.zolo.ca/blog/sold-data-canada)
- Transparency & "consumers not realtors" — [Change.org petition](https://www.change.org/p/government-of-canada-real-estate-is-for-consumers-not-realtors-yes-to-transparency-openness-and-more-choice), [Ottawa Real Estate Board: Issues & Concerns](https://www.oreb.ca/issues-concerns/)
- Rental scams & newcomers — [New Canadian Media](https://www.newcanadianmedia.ca/growing-number-of-rental-scams-and-abuses-may-disproportionately-affect-canadas-immigrants/), [Prepare for Canada](https://www.rentalsfornewcomers.com/blog/how-newcomers-can-avoid-rental-scams)
- The mortgage stress test — [Loans Canada](https://loanscanada.ca/mortgage/the-canadian-mortgage-stress-test/), [nesto](https://www.nesto.ca/mortgage-basics/stress-test-calculator/)
- Fragmented PropTech data — [NetSuite: Real Estate Industry Challenges](https://www.netsuite.com/portal/resource/articles/erp/real-estate-industry-challenges.shtml)

---

## ✨ The seven AI tools

1. **TrueValue AI** — transparent Automated Valuation Model (AVM) with explainable drivers, comparables and confidence band.
2. **OfferIQ** — transparent bidding & AI offer strategy (ends blind bidding).
3. **ScamShield** — verified listings & rental-fraud detection.
4. **AffordIQ** — affordability + the federal B-20 stress test, CMHC, land-transfer tax and first-time-buyer rebates.
5. **Newcomer Pathway** — a guided, scam-safe journey for thin credit files and no Canadian history.
6. **Neighbourhood IQ** — unified schools / transit / safety / walkability / growth / climate-resilience scores.
7. **Aria** — the conversational AI copilot (powered by Claude, with a heuristic fallback).

---

## 🧭 Listings experience

Modelled on the best of Zillow / Akwaaba / Airbnb, adapted for Canada:

- **Real interactive map** (Leaflet + Carto basemap) with price pins, popups, a
  **price Heatmap** toggle, and **Search-this-area** bounds filtering
- **Split / Grid / Map** views, "ranked-for-you" relevance, and **lifestyle
  filter chips** (Find me a deal, Luxury, Family-friendly, Investor-grade,
  First-time buyer, Newcomer-ready, Waterfront, Designer-led, New build)
- **Dense, colour-coded signal badges** per card — AI Match %, above/below
  market, Hot home, May drop, Reduced %, Featured, Ownership-unverified
- **Airbnb-style image carousels** on every card, **Save** ❤ and **Compare**
  (side-by-side modal across price, TrueValue, match, area, neighbourhood)
- **Categories**: Homes · **Land** · **Commercial** (each with its own
  illustrated scene, stats and valuation handling)
- **Dark mode** (system-aware, persisted) and a warm wine/cream design system

### Photography

Listing imagery uses real photos from Unsplash layered over a deterministic SVG
scene, with an `onError` fallback so **a card can never show a broken image**.
To use your own source (Unsplash API, Cloudinary, an MLS feed), edit the
`POOLS` / `photoUrl` in `src/components/Photo.tsx` — no call sites change.

## 🛠 Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with a custom evergreen/maple design system
- **lucide-react** icons
- **@anthropic-ai/sdk** — Aria runs on **Claude (`claude-opus-4-8` by default)**
- Self-contained sample data (no external MLS feed or image hosts required) — the whole app builds and runs offline

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure AI — copy and edit env
cp .env.example .env.local

# 3. Run the dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build && npm run start
```

### AI configuration

Aria and the AI features work **with or without** an API key:

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | _(unset)_ | When set, Aria runs on Claude. When unset, Aria uses a built-in heuristic engine over the listing data. |
| `ARIA_MODEL` | `claude-opus-4-8` | Override the model (e.g. `claude-sonnet-4-6` or `claude-haiku-4-5` for higher-volume/lower-cost chat). |

The listing catalog is sent to Claude as a cached system prompt, and refusals / network errors fall back to the heuristic engine automatically.

---

## 📁 Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, header/footer, Aria
│   ├── page.tsx                # Landing page (hero, pain points, AI tools)
│   ├── search/                 # Map + filter search experience
│   ├── property/[slug]/        # Listing detail (SSG for every property)
│   ├── valuation/              # TrueValue AI explorer
│   ├── affordability/          # AffordIQ calculator
│   ├── newcomers/              # Newcomer Pathway
│   ├── agents/                 # Verified agent network
│   ├── pricing/                # SaaS plans (Explorer / Pro / Brokerage)
│   ├── about/                  # The niche + OfferIQ deep dive
│   └── api/aria/route.ts       # Aria chat endpoint
├── components/                 # Header, Footer, PropertyCard, PropertyMap,
│                               # AriaCopilot, ValuationPanel, TrustPanel, …
├── lib/
│   ├── ai/aria.ts              # Claude integration + heuristic fallback
│   ├── valuation.ts            # TrueValue AVM
│   ├── mortgage.ts             # AffordIQ stress-test math
│   ├── scamShield.ts           # Fraud-detection heuristics
│   ├── search.ts               # Listing filters
│   └── data/                   # Properties, agents, neighbourhoods
└── types/                      # Shared domain types
```

---

## ☁️ Deployment

Deploys to **Vercel** out of the box (Next.js App Router). Set `ANTHROPIC_API_KEY` in the project's environment variables to enable Claude-powered Aria; leave it unset and everything still works with the heuristic engine.

---

## ⚠️ Disclaimers

- All listings, agents, prices and neighbourhood data are **illustrative sample data** for demonstration.
- TrueValue is an estimate, not an appraisal. AffordIQ is an educational estimate using simplified federal/provincial rules, not a mortgage pre-approval. ScamShield is an automated risk signal, not a guarantee.

---

Made in Canada. 🍁 Bilingual by design (EN · FR).
