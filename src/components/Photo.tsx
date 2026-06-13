"use client";

import { useState } from "react";
import { PropertyScene, sceneFor, type Kind } from "@/components/PropertyScene";
import { cn } from "@/lib/cn";

// Real listing photography layered over the deterministic SVG scene. If the
// remote image fails (offline, blocked, dead id), the scene shows through —
// so a card can never render a broken image. Swap PROVIDER/POOLS for your own
// CDN (e.g. Unsplash API, Cloudinary) without touching call sites.

const POOLS: Record<Kind, string[]> = {
  exterior: [
    "photo-1568605114967-8130f3a36994",
    "photo-1570129477492-45c003edd2be",
    "photo-1564013799919-ab600027ffc6",
    "photo-1512917774080-9991f1c4c750",
    "photo-1600585154340-be6161a56a0c",
    "photo-1600596542815-ffad4c1539a9",
    "photo-1583608205776-bfd35f0d9f83",
    "photo-1576941089067-2de3c901e126",
  ],
  living: [
    "photo-1493809842364-78817add7ffb",
    "photo-1586023492125-27b2c045efd7",
    "photo-1567767292278-a4f21aa2d36e",
    "photo-1524758631624-e2822e304c36",
    "photo-1600210492493-0946911123ea",
    "photo-1505693416388-ac5ce068fe85",
  ],
  kitchen: [
    "photo-1556909114-f6e7ad7d3136",
    "photo-1556911220-bff31c812dba",
    "photo-1600489000022-c2086d79f9d4",
    "photo-1565538810643-b5bdb714032a",
    "photo-1581622558663-b2e33377dfb2",
  ],
  bedroom: [
    "photo-1505691938895-1758d7feb511",
    "photo-1522771739844-6a9f6d5f14af",
    "photo-1560448204-e02f11c3d0e2",
    "photo-1540518614846-7eded433c457",
    "photo-1616594039964-ae9021a400a0",
  ],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function photoUrl(scene: Kind, seedKey: string): string {
  const pool = POOLS[scene];
  const id = pool[hash(seedKey) % pool.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
}

export function Photo({
  seedKey,
  kind,
  label,
  className,
}: {
  seedKey: string;
  kind?: Kind;
  label?: string;
  className?: string;
}) {
  const scene: Kind = kind ?? sceneFor(label, 0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-ink-100", className)}>
      <PropertyScene seedKey={seedKey} kind={scene} className="absolute inset-0 h-full w-full" />
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl(scene, seedKey)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
      {label && (
        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
