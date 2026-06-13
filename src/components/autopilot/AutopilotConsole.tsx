"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap, Check, Loader2, ArrowRight, Bot, Infinity as InfinityIcon, Power } from "lucide-react";
import { AGENTS, agentById } from "@/lib/agents/registry";
import { runFlow, FLOW_EXAMPLES, type FlowResult } from "@/lib/agents/orchestrator";
import { useAutomations, disableAutomation } from "@/lib/agents/automations";
import { RunView } from "./RunView";
import { AgentRunner } from "./AgentRunner";
import { AgentIcon } from "./icons";
import { cn } from "@/lib/cn";

const CATEGORIES = ["Buying", "Renting & newcomers", "Hosting"];

export function AutopilotConsole() {
  const [tab, setTab] = useState<"flow" | "agents" | "automations">("flow");
  const [selected, setSelected] = useState<string | null>(null);
  const automations = useAutomations();
  const [deepLink, setDeepLink] = useState<{ agentId: string; inputs: Record<string, string> } | null>(null);
  const [flowGoal, setFlowGoal] = useState<string | undefined>(undefined);

  // Deep-link support: /autopilot?agent=offer-strategist&property=<slug> or ?goal=...
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const agent = sp.get("agent");
    const goal = sp.get("goal");
    if (agent && agentById(agent)) {
      const inputs: Record<string, string> = {};
      agentById(agent)!.inputs.forEach((i) => {
        const v = sp.get(i.key);
        if (v !== null) inputs[i.key] = v;
      });
      setDeepLink({ agentId: agent, inputs });
      setSelected(agent);
      setTab("agents");
    } else if (goal) {
      setFlowGoal(goal);
      setTab("flow");
    }
  }, []);

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        <TabBtn active={tab === "flow"} onClick={() => setTab("flow")}>
          <Zap className="h-4 w-4" /> Autopilot flow
        </TabBtn>
        <TabBtn active={tab === "agents"} onClick={() => setTab("agents")}>
          <Bot className="h-4 w-4" /> All agents
        </TabBtn>
        <TabBtn active={tab === "automations"} onClick={() => setTab("automations")}>
          <InfinityIcon className="h-4 w-4" /> My automations
          {automations.length > 0 && (
            <span className="ml-1 rounded-full bg-emerald-400/20 px-1.5 text-[11px] font-bold text-emerald-300">{automations.length}</span>
          )}
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "automations" ? (
          <MyAutomations automations={automations} onConfigure={(id) => { setTab("agents"); setSelected(id); }} />
        ) : tab === "flow" ? (
          <FlowConsole initialGoal={flowGoal} />
        ) : selected ? (
          <AgentRunner
            agent={agentById(selected)!}
            onBack={() => {
              setSelected(null);
              setDeepLink(null);
            }}
            initialInputs={deepLink?.agentId === selected ? deepLink.inputs : undefined}
            autoRun={deepLink?.agentId === selected}
          />
        ) : (
          <AgentGrid
            onPick={(id) => {
              setSelected(id);
              setDeepLink(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function FlowConsole({ initialGoal }: { initialGoal?: string }) {
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

  useEffect(() => {
    if (initialGoal) go(initialGoal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

function MyAutomations({
  automations,
  onConfigure,
}: {
  automations: { agentId: string; inputs: Record<string, string>; enabledAt: number }[];
  onConfigure: (id: string) => void;
}) {
  if (automations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-brand-300">
          <InfinityIcon className="h-6 w-6" />
        </span>
        <p className="mt-3 font-display text-lg font-bold text-white">No automations yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
          Open any agent and toggle <span className="font-semibold text-white">Automate this</span> to have Autopilot keep
          running it for you — deal alerts, nightly pricing, turnovers and more.
        </p>
        <button onClick={() => onConfigure("")} className="mh-btn-ghost mt-5">
          Browse agents <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
        <InfinityIcon className="h-4 w-4 shrink-0 text-emerald-300" />
        <span>
          <span className="font-bold text-white">{automations.length}</span> automation{automations.length > 1 ? "s" : ""} running
          for you. Autopilot re-checks these continuously and surfaces anything that changes.
        </span>
      </div>

      {automations.map((a) => {
        const def = agentById(a.agentId);
        if (!def) return null;
        const run = def.run(a.inputs);
        return (
          <div key={a.agentId}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <AgentIcon name={def.icon} className="h-4 w-4 text-brand-300" />
                {def.name}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => onConfigure(a.agentId)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-300 hover:text-white">
                  Configure
                </button>
                <button
                  onClick={() => disableAutomation(a.agentId)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-rose-300"
                >
                  <Power className="h-3 w-3" /> Turn off
                </button>
              </div>
            </div>
            <RunView run={run} />
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
