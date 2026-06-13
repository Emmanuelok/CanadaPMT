import { NextResponse } from "next/server";
import type { Kind } from "@/components/PropertyScene";
import { SCENE_QUERY, curatedPhotoUrl, imgHash } from "@/lib/images/scenes";

// Resolves a listing photo to a real image URL and redirects to it.
//   • With UNSPLASH_ACCESS_KEY set → live, query-matched Unsplash photography
//     (pools cached in-memory to respect API rate limits).
//   • Without a key → curated, deterministic Unsplash IDs (no network at all
//     beyond the image host).
// Either way the <Photo> component keeps its premium fallback if the image
// itself fails to load, so a card can never render broken.

export const runtime = "nodejs";

const KINDS: Kind[] = ["exterior", "living", "kitchen", "bedroom", "land", "commercial"];
const TTL = 1000 * 60 * 60 * 12; // refresh API pools at most twice a day
const pools: Partial<Record<Kind, { urls: string[]; at: number }>> = {};

async function apiPool(kind: Kind, key: string): Promise<string[] | null> {
  const hit = pools[kind];
  if (hit && Date.now() - hit.at < TTL) return hit.urls;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(SCENE_QUERY[kind])}&per_page=24&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" }, next: { revalidate: 60 * 60 * 12 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { urls?: { raw?: string } }[] };
    const urls = (data.results ?? []).map((p) => p.urls?.raw).filter((u): u is string => Boolean(u));
    if (!urls.length) return null;
    pools[kind] = { urls, at: Date.now() };
    return urls;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const k = params.get("k") as Kind | null;
  const kind: Kind = k && KINDS.includes(k) ? k : "exterior";
  const seed = params.get("s") ?? "x";
  const w = Math.min(2400, Math.max(400, Number(params.get("w")) || 1200));
  const key = process.env.UNSPLASH_ACCESS_KEY;

  let target: string | null = null;
  if (key) {
    const pool = await apiPool(kind, key);
    if (pool?.length) {
      const base = pool[imgHash(seed) % pool.length];
      target = `${base}${base.includes("?") ? "&" : "?"}auto=format&fit=crop&w=${w}&q=75`;
    }
  }
  if (!target) target = curatedPhotoUrl(kind, seed, w);

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: target,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
    },
  });
}
