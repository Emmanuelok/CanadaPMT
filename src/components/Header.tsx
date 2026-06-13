"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sparkles, Leaf, Search, Bell, ChevronDown, Heart } from "lucide-react";
import { cn } from "@/lib/cn";

const PRIMARY = [
  { label: "Buy", href: "/search?type=sale" },
  { label: "Rent", href: "/search?type=rent" },
  { label: "Pre-construction", href: "/search?type=preconstruction" },
  { label: "Sold", href: "/search?type=sold" },
  { label: "Agents", href: "/agents" },
];

const TOOLS = [
  { label: "TrueValue valuation", href: "/valuation" },
  { label: "AffordIQ calculator", href: "/affordability" },
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

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/70 bg-cream-100/90 backdrop-blur-md">
      <div className="mh-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
            <Leaf className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Maple<span className="text-brand-700">Haus</span>
            <span className="text-maple-500">.</span>
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
                  active ? "bg-white text-brand-700 shadow-sm" : "text-ink-700 hover:bg-white/70 hover:text-ink-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="relative" onMouseLeave={() => setToolsOpen(false)}>
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-white/70 hover:text-ink-900"
            >
              All tools <ChevronDown className={cn("h-4 w-4 transition", toolsOpen && "rotate-180")} />
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full w-60 rounded-2xl border border-ink-100 bg-white p-2 shadow-lift">
                {TOOLS.map((t) => (
                  <Link
                    key={t.label}
                    href={t.href}
                    onClick={() => setToolsOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            onClick={() => router.push("/search?type=sale")}
            className="hidden items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2 text-sm text-ink-500 transition hover:border-brand-300 xl:flex"
          >
            <Search className="h-4 w-4" /> Search
            <kbd className="rounded border border-ink-200 bg-ink-50 px-1 text-[10px] font-semibold text-ink-400">⌘K</kbd>
          </button>
          <span className="hidden rounded-full border border-ink-200 bg-white px-2.5 py-2 text-xs font-semibold text-ink-600 xl:inline-flex">
            EN · CAD
          </span>
          <Link
            href="/search?type=sale"
            aria-label="Saved homes"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 transition hover:border-brand-300 hover:text-brand-700 xl:flex"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <button
            aria-label="Notifications"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 xl:flex"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maple-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>
          <Link href="/pricing" className="mh-btn-ghost px-3 py-2">
            Sign in
          </Link>
          <button onClick={openAria} className="mh-btn-primary px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Ask Aria
          </button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink-700 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-cream-100 lg:hidden">
          <nav className="mh-container grid gap-1 py-3">
            {[...PRIMARY, ...TOOLS].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
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
