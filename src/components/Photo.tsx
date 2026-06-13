"use client";

import { useState } from "react";
import { Home, Building2, Trees } from "lucide-react";
import { sceneFor, type Kind } from "@/components/PropertyScene";
import { cn } from "@/lib/cn";

// Real listing photography over a premium dark placeholder. If the remote image
// fails (offline, blocked, dead id) the placeholder shows — a card can never
// render broken. Swap POOLS / photoUrl for your own CDN without touching call
// sites.

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
    "photo-1524758631624-e2822e304c36",
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
  return `https://images.unsplash.com/${pool[hash(seedKey) % pool.length]}?auto=format&fit=crop&w=900&q=70`;
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
  const Icon = scene === "land" ? Trees : scene === "exterior" ? Home : Building2;

  return (
    <div className={cn("relative overflow-hidden bg-night-800", className)}>
      {/* premium placeholder (shows until the photo loads, or if it fails) */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-700 via-night-800 to-night-900">
        <div className="absolute inset-0 mh-grid-bg opacity-30" />
        <div className="absolute -left-8 -top-10 h-32 w-44 rounded-full bg-brand-600/20 blur-2xl" />
        <Icon className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-white/15" strokeWidth={1.4} />
      </div>
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
        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
