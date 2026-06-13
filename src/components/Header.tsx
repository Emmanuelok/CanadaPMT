"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sparkles, Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Buy", href: "/search?type=sale" },
  { label: "Rent", href: "/search?type=rent" },
  { label: "Pre-construction", href: "/search?type=preconstruction" },
  { label: "Sold", href: "/search?type=sold" },
  { label: "TrueValue", href: "/valuation" },
  { label: "AffordIQ", href: "/affordability" },
  { label: "Newcomers", href: "/newcomers" },
  { label: "Agents", href: "/agents" },
];

function openAria() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-aria"));
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur-md">
      <div className="mh-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
            <Leaf className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Maple<span className="text-brand-700">Haus</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href.split("?")[0] && pathname !== "/";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50 hover:text-ink-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/pricing" className="mh-btn-ghost px-4 py-2">
            For agents
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
        <div className="border-t border-ink-100 bg-white lg:hidden">
          <nav className="mh-container grid gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/pricing" onClick={() => setOpen(false)} className="mh-btn-ghost flex-1">
                For agents
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
