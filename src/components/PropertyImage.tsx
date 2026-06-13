import { Home, Building2, Trees, Hammer } from "lucide-react";
import { cn } from "@/lib/cn";

// A deterministic, fully-offline image placeholder. Real photos would slot in
// here behind the same API; the gradient art keeps the demo dependency-free.

const PALETTES: [string, string][] = [
  ["#0a4d3f", "#10b888"],
  ["#06765c", "#34d3a5"],
  ["#085d4a", "#6ee7c2"],
  ["#1f2530", "#4d5b78"],
  ["#384053", "#8292ab"],
  ["#022c24", "#059470"],
  ["#2b3a4a", "#6ee7c2"],
  ["#7e241c", "#f77a6e"],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function PropertyImage({
  seedKey,
  label,
  kind = "photo",
  icon = "home",
  className,
}: {
  seedKey: string;
  label?: string;
  kind?: "photo" | "rendering";
  icon?: "home" | "building" | "trees" | "hammer";
  className?: string;
}) {
  const h = hash(seedKey);
  const [from, to] = PALETTES[h % PALETTES.length];
  const angle = (h % 6) * 25 + 110;
  const Icon = icon === "building" ? Building2 : icon === "trees" ? Trees : icon === "hammer" ? Hammer : Home;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` }}
      aria-hidden
    >
      {/* soft geometric motif */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(255,255,255,0.5), transparent 42%), radial-gradient(circle at 18% 88%, rgba(0,0,0,0.28), transparent 46%)",
        }}
      />
      <Icon className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/30" strokeWidth={1.25} />
      {kind === "rendering" && (
        <span className="absolute right-2 top-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
          Rendering
        </span>
      )}
      {label && (
        <span className="absolute bottom-2 left-2 rounded-md bg-black/35 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
