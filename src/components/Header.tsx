"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sparkles, Search, ChevronDown, Heart } from "lucide-react";
import { useSaved } from "@/components/saved/SavedContext";
import { cn } from "@/lib/cn";

const PRIMARY = [
  { label: "Buy", href: "/search?type=sale" },
  { label: "Rent", href: "/search?type=rent" },
  { label: "Land", href: "/search?type=sale&cat=land" },
  { label: "Commercial", href: "/search?type=sale&cat=commercial" },
  { label: "Host your place", href: "/host" },
  { label: "Agents", href: "/agents" },
];

const TOOLS = [
  { label: "TrueValue valuation", href: "/valuation" },
  { label: "AffordIQ calculator", href: "/affordability" },
  { label: "Host earnings estimator", href: "/host#estimate" },
  { label: "Owner dashboard", href: "/host/dashboard" },
  { label: "Newcomer Pathway", href: "/newcomers" },
  { label: "Pricing & plans", href: "/pricing" },
  { label: "Why MapleHaus", href: "/about" },
];

function openAria() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-aria"));
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { count, hydrated } = useSaved();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-950/70 backdrop-blur-xl">
      <div className="mh-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow">
            <Sparkles className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Maple<span className="gradient-text">Haus</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY.map((item) => {
            const active = pathname === item.href.split("?")[0] && pathname !== "/";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold transition",
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="relative" onMouseLeave={() => setToolsOpen(false)}>
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              All tools <ChevronDown className={cn("h-4 w-4 transition", toolsOpen && "rotate-180")} />
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full w-60 rounded-2xl border border-white/10 bg-night-850 p-2 shadow-lift">
                {TOOLS.map((t) => (
                  <Link
                    key={t.label}
                    href={t.href}
                    onClick={() => setToolsOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => router.push("/search?type=sale")}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white xl:flex"
          >
            <Search className="h-4 w-4" /> Search
            <kbd className="rounded border border-white/10 bg-white/5 px-1 text-[10px] font-semibold text-zinc-500">⌘K</kbd>
          </button>
          <Link
            href="/saved"
            aria-label={count > 0 ? `Saved homes (${count})` : "Saved homes"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <Heart className={cn("h-5 w-5", hydrated && count > 0 && "fill-maple-500 text-maple-500")} />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maple-500 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link href="/pricing" className="mh-btn-ghost px-4 py-2">
            Sign in
          </Link>
          <button onClick={openAria} className="mh-btn-primary px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Ask Aria
          </button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-300 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-night-900 lg:hidden">
          <nav className="mh-container grid gap-1 py-3">
            {[...PRIMARY, ...TOOLS].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Heart className={cn("h-4 w-4", hydrated && count > 0 && "fill-maple-500 text-maple-500")} />
              Saved homes{hydrated && count > 0 ? ` (${count})` : ""}
            </Link>
            <div className="mt-2 flex gap-2">
              <Link href="/pricing" onClick={() => setOpen(false)} className="mh-btn-ghost flex-1">
                Sign in
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  openAria();
                }}
                className="mh-btn-primary flex-1"
              >
                <Sparkles className="h-4 w-4" />
                Ask Aria
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
