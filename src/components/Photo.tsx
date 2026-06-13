"use client";

import { useState } from "react";
import { Home, Building2, Trees } from "lucide-react";
import { sceneFor, type Kind } from "@/components/PropertyScene";
import { cn } from "@/lib/cn";

// Real listing photography over a premium dark placeholder. URLs are resolved
// by the /api/photo route (live Unsplash when a key is set, curated ids
// otherwise). If the remote image fails (offline, blocked, dead id) the
// placeholder shows — a card can never render broken.

function photoUrl(scene: Kind, seedKey: string): string {
  return `/api/photo?k=${scene}&s=${encodeURIComponent(seedKey)}`;
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
