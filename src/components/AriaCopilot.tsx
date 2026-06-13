"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Leaf, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/cn";

const SUGGESTIONS = [
  "2-bed condo in Vancouver under $900k",
  "Newcomer-friendly rentals in Toronto",
  "What can I afford on $140k income?",
  "How does transparent bidding work?",
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm **Aria**, your MapleHaus copilot. Ask me to find a home, value a property, check affordability, or spot a rental scam. What are you looking for?",
};

// ── Minimal Markdown rendering for chat replies ───────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={i} href={href} className="font-semibold text-brand-700 underline underline-offset-2">
            {m[1]}
          </Link>
        ) : (
          <a key={i} href={href} className="font-semibold text-brand-700 underline underline-offset-2">
            {m[1]}
          </a>
        ),
      );
    } else if (m[3]) {
      nodes.push(
        <strong key={i} className="font-semibold text-ink-900">
          {m[3]}
        </strong>,
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <ul key={key} className="space-y-1.5">
          {bullets.map((b, idx) => (
            <li key={idx} className="flex gap-2 leading-snug">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      bullets.push(trimmed.slice(2));
    } else {
      flush(`ul-${idx}`);
      if (trimmed) blocks.push(<p key={idx}>{renderInline(trimmed)}</p>);
    }
  });
  flush("ul-final");
  return <div className="aria-prose space-y-2">{blocks}</div>;
}

export function AriaCopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [poweredByAI, setPoweredByAI] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-aria", handler);
    return () => window.removeEventListener("open-aria", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/aria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const data = await res.json();
      setPoweredByAI(Boolean(data.usedAI));
      setMessages((m) => [...m, { role: "assistant", content: data.answer ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the server just now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-brand-800"
          aria-label="Open Aria, the AI copilot"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-pulse-ring" />
            <Sparkles className="h-5 w-5" />
          </span>
          Ask Aria
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-5 sm:right-5">
          <div className="mx-auto flex h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-ink-200 bg-white shadow-lift sm:h-[600px] sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-sm font-bold">Aria</p>
                  <p className="text-[11px] text-white/80">
                    {poweredByAI === false ? "Smart assist (offline mode)" : "Your AI real estate copilot"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/40 px-4 py-4">
              {messages.map((m, idx) => (
                <div key={idx} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && (
                    <span className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white">
                      <Leaf className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                      m.role === "user"
                        ? "bg-brand-700 text-white"
                        : "border border-ink-100 bg-white text-ink-800",
                    )}
                  >
                    {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <span className="mr-2 mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-white">
                    <Leaf className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink-500">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                    Thinking…
                  </div>
                </div>
              )}

              {messages.length <= 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-ink-100 bg-white px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about homes, value, or affordability…"
                className="flex-1 rounded-full border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
