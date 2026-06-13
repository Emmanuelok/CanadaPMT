import Link from "next/link";
import { Check, Loader2, ArrowUpRight } from "lucide-react";
import type { AgentRun, Tone } from "@/lib/agents/types";
import { cn } from "@/lib/cn";

const TONE: Record<Tone, string> = {
  good: "text-emerald-300",
  warn: "text-amber-300",
  bad: "text-rose-300",
  neutral: "text-white",
};
const TONE_DOT: Record<Tone, string> = {
  good: "bg-emerald-400",
  warn: "bg-amber-400",
  bad: "bg-rose-400",
  neutral: "bg-zinc-500",
};

function Bold({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((seg, i) => (i % 2 ? <strong key={i} className="font-bold text-white">{seg}</strong> : <span key={i}>{seg}</span>))}
    </>
  );
}

export function RunView({ run, stepsRevealed }: { run: AgentRun; stepsRevealed?: number }) {
  const revealed = stepsRevealed ?? run.steps.length;
  const complete = revealed >= run.steps.length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-white">{run.title}</h3>

      {/* Streamed step checklist */}
      <ul className="mt-4 space-y-2">
        {run.steps.map((s, i) => {
          const done = i < revealed;
          const active = i === revealed && !complete;
          if (!done && !active) return null;
          return (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {done ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-400" />
              )}
              <span className={done ? "text-zinc-300" : "text-white"}>
                {s.label}
                {s.detail && <span className="text-zinc-500"> · {s.detail}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {complete && (
        <>
          {run.summary && (
            <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-zinc-300">
              <Bold text={run.summary} />
            </p>
          )}

          {run.metrics && run.metrics.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {run.metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[11px] text-zinc-500">{m.label}</p>
                  <p className={cn("font-display text-lg font-extrabold", TONE[m.tone ?? "neutral"])}>{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {run.listings && run.listings.length > 0 && (
            <div className="mt-4 space-y-2">
              {run.listings.map((l) => (
                <Link
                  key={l.slug}
                  href={`/property/${l.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-white/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{l.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {l.city}
                      {l.note ? ` · ${l.note}` : ""}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-sm font-bold", TONE[l.tone ?? "neutral"])}>{l.price}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600" />
                </Link>
              ))}
            </div>
          )}

          {run.table && run.table.rows.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-zinc-500">
                    {run.table.head.map((h, i) => (
                      <th key={i} className="px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {run.table.rows.map((r, i) => (
                    <tr key={i}>
                      {r.cells.map((c, j) => (
                        <td key={j} className="px-3 py-2 text-zinc-300">
                          {j === 0 && r.tone ? (
                            <span className="flex items-center gap-2">
                              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TONE_DOT[r.tone])} />
                              {c}
                            </span>
                          ) : (
                            c
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {run.draft && (
            <div className="mt-4 rounded-xl border border-white/10 bg-night-900/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">{run.draft.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{run.draft.body}</p>
            </div>
          )}

          {run.actions && run.actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {run.actions.map((a) => (
                <Link key={a.href + a.label} href={a.href} className="mh-btn-ghost text-sm">
                  {a.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
