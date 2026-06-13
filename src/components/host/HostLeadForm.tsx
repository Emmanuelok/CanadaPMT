"use client";

import { useState } from "react";
import { CheckCircle2, Send, TrendingUp } from "lucide-react";
import { estimateStr, HOST_CITIES, SPACE_TYPES, type SpaceType } from "@/lib/str";
import { useHostFunnel } from "@/components/host/HostFunnel";
import { formatCAD } from "@/lib/format";
import { cn } from "@/lib/cn";

const SPACE_KEYS = Object.keys(SPACE_TYPES) as SpaceType[];

interface Lead {
  name: string;
  email: string;
  phone: string;
  message: string;
  city: string;
  spaceType: SpaceType;
  estimate: number;
  at: number;
}

const EMPTY = { name: "", email: "", phone: "", message: "" };
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function HostLeadForm() {
  const { sel, update } = useHostFunnel();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const beds = Math.min(sel.bedrooms, SPACE_TYPES[sel.spaceType].maxBeds);
  const est = estimateStr(sel.city, sel.spaceType, beds, sel.plan);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please add your name.");
    if (!emailOk(form.email)) return setError("Please enter a valid email address.");
    setError("");
    try {
      const lead: Lead = { ...form, city: sel.city, spaceType: sel.spaceType, estimate: est.ownerNetMonthly, at: Date.now() };
      const prev = JSON.parse(localStorage.getItem("mh-host-leads") || "[]");
      localStorage.setItem("mh-host-leads", JSON.stringify([lead, ...prev]));
    } catch {
      /* ignore */
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="mt-4 font-display text-xl font-bold text-white">Thanks, {form.name.split(" ")[0]}!</p>
        <p className="mt-2 max-w-md text-sm text-zinc-300">
          We&apos;ll prepare a custom {sel.city} earnings projection and reach out to{" "}
          <span className="font-semibold text-white">{form.email}</span> within one business day.
        </p>
        <button
          onClick={() => {
            setForm(EMPTY);
            setSubmitted(false);
          }}
          className="mh-btn-ghost mt-6"
        >
          Submit another property
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      {/* Live estimate carried from the calculator */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-5 w-5 shrink-0 text-brand-300" />
          <p className="text-sm text-zinc-300">
            Your estimate · <span className="font-semibold text-white">{sel.city}</span> ·{" "}
            {SPACE_TYPES[sel.spaceType].label}
          </p>
        </div>
        <p className="shrink-0 font-display text-lg font-extrabold text-white">
          {formatCAD(est.ownerNetMonthly)}<span className="text-xs font-medium text-zinc-400">/mo</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={form.name} onChange={(v) => set("name", v)} placeholder="Jordan Lee" />
        <Input label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
        <Input label="Phone (optional)" value={form.phone} onChange={(v) => set("phone", v)} placeholder="(416) 555-0142" />
        <Select label="City" value={sel.city} onChange={(v) => update({ city: v })} options={HOST_CITIES} />
        <div className="sm:col-span-2">
          <Label>What would you list?</Label>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {SPACE_KEYS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update({ spaceType: s })}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  sel.spaceType === s
                    ? "border-brand-400 bg-brand-500/15 text-white"
                    : "border-white/10 bg-night-850 text-zinc-400 hover:text-white",
                )}
              >
                {SPACE_TYPES[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label>Anything else? (optional)</Label>
          <textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            rows={3}
            placeholder="Tell us about your place, availability, or goals…"
            className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-rose-400">{error}</p>}

      <button type="submit" className="mh-btn-primary mt-5 w-full sm:w-auto">
        <Send className="h-4 w-4" /> Get my free earnings estimate
      </button>
      <p className="mt-3 text-xs text-zinc-500">
        No obligation. We&apos;ll never list your home without a signed management agreement.
      </p>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-zinc-300">{children}</label>;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-400"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
