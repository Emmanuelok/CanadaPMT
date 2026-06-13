"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Search, CornerDownLeft, LayoutDashboard, Home, Heart, Bot } from "lucide-react";
import { AGENTS } from "@/lib/agents/registry";
import { AgentIcon } from "./icons";
import { cn } from "@/lib/cn";

interface Item {
  key: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  href: string;
}

const LINKS: Item[] = [
  { key: "l-auto", label: "Autopilot home", sub: "All agents & flows", icon: <Bot className="h-4 w-4" />, href: "/autopilot" },
  { key: "l-dash", label: "Owner dashboard", sub: "Your managed rentals", icon: <LayoutDashboard className="h-4 w-4" />, href: "/host/dashboard" },
  { key: "l-host", label: "Host your place", sub: "Earn from your home", icon: <Home className="h-4 w-4" />, href: "/host" },
  { key: "l-saved", label: "Saved homes", sub: "Your shortlist", icon: <Heart className="h-4 w-4" />, href: "/saved" },
];

export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mh-command-open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mh-command-open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Item[] = [];
    if (q) {
      out.push({
        key: "flow",
        label: `Run as Autopilot flow`,
        sub: `“${query.trim()}”`,
        icon: <Zap className="h-4 w-4 text-brand-300" />,
        href: `/autopilot?goal=${encodeURIComponent(query.trim())}`,
      });
    }
    AGENTS.filter(
      (a) => !q || a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.automates.toLowerCase().includes(q),
    )
      .slice(0, 7)
      .forEach((a) =>
        out.push({
          key: a.id,
          label: a.name,
          sub: a.tagline,
          icon: <AgentIcon name={a.icon} className="h-4 w-4 text-brand-300" />,
          href: `/autopilot?agent=${a.id}`,
        }),
      );
    if (!q) out.push(...LINKS);
    return out;
  }, [query]);

  useEffect(() => setActive(0), [query]);

  function select(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-white/10 bg-night-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-300 shadow-lift backdrop-blur transition hover:text-white sm:flex"
        aria-label="Open Autopilot command bar"
      >
        <Zap className="h-4 w-4 text-brand-400" /> Ask Autopilot
        <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 p-4 pt-[12vh]" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-night-900 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, items.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    select(items[active]);
                  }
                }}
                placeholder="Describe a goal, or search agents…"
                className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-zinc-500">No matches.</li>}
              {items.map((item, i) => (
                <li key={item.key}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      i === active ? "bg-brand-500/15" : "hover:bg-white/5",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{item.label}</span>
                      {item.sub && <span className="block truncate text-xs text-zinc-500">{item.sub}</span>}
                    </span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-500" />}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-zinc-500">
              <span>↑↓ to navigate · ↵ to run · esc to close</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-brand-400" /> MapleHaus Autopilot
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
