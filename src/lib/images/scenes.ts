import type { Kind } from "@/components/PropertyScene";

// Curated Unsplash photo IDs per scene — used directly (no API key needed) as
// the default and as the fallback. When UNSPLASH_ACCESS_KEY is set, the
// /api/photo route fetches live, query-matched photography instead and these
// become the safety net. IDs are canonical images.unsplash.com asset ids.
export const CURATED_POOLS: Record<Kind, string[]> = {
  exterior: [
    "photo-1568605114967-8130f3a36994",
    "photo-1570129477492-45c003edd2be",
    "photo-1564013799919-ab600027ffc6",
    "photo-1512917774080-9991f1c4c750",
    "photo-1600585154340-be6161a56a0c",
    "photo-1600596542815-ffad4c1539a9",
    "photo-1583608205776-bfd35f0d9f83",
    "photo-1576941089067-2de3c901e126",
    "photo-1605276374104-dee2a0ed3cd6",
    "photo-1518780664697-55e3ad937233",
  ],
  living: [
    "photo-1493809842364-78817add7ffb",
    "photo-1586023492125-27b2c045efd7",
    "photo-1567767292278-a4f21aa2d36e",
    "photo-1524758631624-e2822e304c36",
    "photo-1600210492493-0946911123ea",
    "photo-1505693416388-ac5ce068fe85",
    "photo-1618221195710-dd6b41faaea6",
    "photo-1615874959474-d609969a20ed",
  ],
  kitchen: [
    "photo-1556909114-f6e7ad7d3136",
    "photo-1556911220-bff31c812dba",
    "photo-1600489000022-c2086d79f9d4",
    "photo-1565538810643-b5bdb714032a",
    "photo-1581622558663-b2e33377dfb2",
    "photo-1600585152220-90363fe7e115",
  ],
  bedroom: [
    "photo-1505691938895-1758d7feb511",
    "photo-1522771739844-6a9f6d5f14af",
    "photo-1560448204-e02f11c3d0e2",
    "photo-1540518614846-7eded433c457",
    "photo-1616594039964-ae9021a400a0",
    "photo-1617325247661-675ab4b64ae2",
  ],
  land: [
    "photo-1500382017468-9049fed747ef",
    "photo-1466692476868-aef1dfb1e735",
    "photo-1501696461415-6bd6660c6742",
    "photo-1444858291040-58f756a3bdd6",
    "photo-1485470733090-0aae1788d5af",
  ],
  commercial: [
    "photo-1486406146926-c627a92ad1ab",
    "photo-1497366811353-6870744d04b2",
    "photo-1441986300917-64674bd600d8",
    "photo-1582037928769-181f2644ecb7",
    "photo-1497366216548-37526070297c",
  ],
};

// Search queries used against the Unsplash API when a key is configured.
export const SCENE_QUERY: Record<Kind, string> = {
  exterior: "modern house exterior home",
  living: "living room interior design",
  kitchen: "modern kitchen interior",
  bedroom: "bedroom interior cozy",
  land: "vacant land plot landscape",
  commercial: "commercial building storefront office",
};

export function imgHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function curatedPhotoUrl(kind: Kind, seed: string, w = 1200, q = 75): string {
  const pool = CURATED_POOLS[kind] ?? CURATED_POOLS.exterior;
  const id = pool[imgHash(seed) % pool.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}
