"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap, Check, Loader2, ArrowRight, Bot } from "lucide-react";
import { AGENTS, agentById } from "@/lib/agents/registry";
import { runFlow, FLOW_EXAMPLES, type FlowResult } from "@/lib/agents/orchestrator";
import { RunView } from "./RunView";
import { AgentRunner } from "./AgentRunner";
import { AgentIcon } from "./icons";
import { cn } from "@/lib/cn";

const CATEGORIES = ["Buying", "Renting & newcomers", "Hosting"];

export function AutopilotConsole() {
  const [tab, setTab] = useState<"flow" | "agents">("flow");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        <TabBtn active={tab === "flow"} onClick={() => setTab("flow")}>
          <Zap className="h-4 w-4" /> Autopilot flow
        </TabBtn>
        <TabBtn active={tab === "agents"} onClick={() => setTab("agents")}>
          <Bot className="h-4 w-4" /> All agents
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "flow" ? (
          <FlowConsole />
        ) : selected ? (
          <AgentRunner agent={agentById(selected)!} onBack={() => setSelected(null)} />
        ) : (
          <AgentGrid onPick={setSelected} />
        )}
      </div>
    </div>
  );
}

function FlowConsole() {
  const [goal, setGoal] = useState("");
  const [flow, setFlow] = useState<FlowResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "planning" | "running">("idle");
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (phase !== "planning") return;
    const t = setTimeout(() => setPhase("running"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running" || !flow || revealed >= flow.runs.length) return;
    const t = setTimeout(() => setRevealed((n) => n + 1), 700);
    return () => clearTimeout(t);
  }, [phase, revealed, flow]);

  function go(text: string) {
    const g = text.trim();
    if (!g) return;
    setGoal(g);
    setFlow(runFlow(g));
    setPhase("planning");
    setRevealed(0);
  }

  const done = flow && phase === "running" && revealed >= flow.runs.length;

  return (
    <div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <label className="text-sm font-semibold text-white">Tell Autopilot what you want — it plans the agents and runs them.</label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(goal)}
            placeholder="e.g. Find an undervalued 2-bed in Toronto under $800k"
            className="flex-1 rounded-xl border border-white/10 bg-night-850 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-400"
          />
          <button onClick={() => go(goal)} className="mh-btn-primary shrink-0 px-5 py-3">
            <Zap className="h-4 w-4" /> Run Autopilot
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLOW_EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => go(ex)}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {flow && (
        <div className="mt-6 space-y-4">
          {/* Plan / overview */}
          <div className="rounded-2xl border border-brand-400/20 bg-brand-500/10 p-5">
            {phase === "planning" ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Loader2 className="h-4 w-4 animate-spin text-brand-300" /> Planning your workflow…
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-brand-300" />
                  {done ? "Autopilot complete" : `Running ${Math.min(revealed + 1, flow.runs.length)} of ${flow.runs.length} agents…`}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {flow.runs.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {i < revealed ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-brand-300" />
                      )}
                      <span className={i < revealed ? "text-zinc-300" : "text-white"}>{r.title}</span>
                    </li>
                  ))}
                </ul>
                {done && (
                  <p className="mt-3 border-t border-white/10 pt-3 text-sm text-zinc-200">
                    {flow.summary.split("**").map((seg, i) => (i % 2 ? <strong key={i} className="font-bold text-white">{seg}</strong> : <span key={i}>{seg}</span>))}
                  </p>
                )}
              </>
            )}
          </div>

          {phase === "running" && flow.runs.slice(0, revealed).map((run, i) => <RunView key={i} run={run} />)}
        </div>
      )}
    </div>
  );
}

function AgentGrid({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="space-y-10">
      {CATEGORIES.map((cat) => {
        const agents = AGENTS.filter((a) => a.category === cat);
        if (!agents.length) return null;
        return (
          <div key={cat}>
            <h2 className="font-display text-xl font-bold text-white">{cat}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onPick(a.id)}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-brand-400/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                      <AgentIcon name={a.icon} className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-white">{a.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{a.tagline}</p>
                  <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-400">Autopilot:</span> {a.automates}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        active ? "bg-brand-500 text-white" : "text-zinc-400 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
