"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Play, RotateCcw, Infinity as InfinityIcon } from "lucide-react";
import type { AgentDef, AgentRun } from "@/lib/agents/types";
import { useAutomations, enableAutomation, disableAutomation } from "@/lib/agents/automations";
import { RunView } from "./RunView";
import { AgentIcon } from "./icons";

export function AgentRunner({
  agent,
  onBack,
  initialInputs,
  autoRun,
}: {
  agent: AgentDef;
  onBack?: () => void;
  initialInputs?: Record<string, string>;
  autoRun?: boolean;
}) {
  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    agent.inputs.forEach((i) => (o[i.key] = initialInputs?.[i.key] ?? i.default ?? i.options?.[0]?.value ?? ""));
    return o;
  }, [agent, initialInputs]);

  const [inputs, setInputs] = useState<Record<string, string>>(initial);
  const [run, setRun] = useState<AgentRun | null>(null);
  const [revealed, setRevealed] = useState(0);
  const automations = useAutomations();
  const automated = automations.some((a) => a.agentId === agent.id);

  useEffect(() => {
    setInputs(initial);
    setRun(null);
    setRevealed(0);
  }, [initial]);

  useEffect(() => {
    if (autoRun) {
      setRun(agent.run(initial));
      setRevealed(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, initial, autoRun]);

  useEffect(() => {
    if (!run || revealed >= run.steps.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 480);
    return () => clearTimeout(t);
  }, [run, revealed]);

  function start() {
    setRun(agent.run(inputs));
    setRevealed(0);
  }

  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white">
          <ChevronLeft className="h-4 w-4" /> All agents
        </button>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Config */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
              <AgentIcon name={agent.icon} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">{agent.name}</h2>
              <p className="text-xs text-zinc-500">{agent.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-400">{agent.description}</p>

          {agent.inputs.length > 0 && (
            <div className="mt-5 space-y-4">
              {agent.inputs.map((inp) => (
                <div key={inp.key}>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">{inp.label}</label>
                  {inp.type === "select" ? (
                    <select
                      value={inputs[inp.key] ?? ""}
                      onChange={(e) => setInputs((s) => ({ ...s, [inp.key]: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-night-850 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-400"
                    >
                      {inp.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      {inp.suffix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{inp.suffix}</span>}
                      <input
                        type={inp.type === "number" ? "number" : "text"}
                        value={inputs[inp.key] ?? ""}
                        placeholder={inp.placeholder}
                        onChange={(e) => setInputs((s) => ({ ...s, [inp.key]: e.target.value }))}
                        className={`w-full rounded-xl border border-white/10 bg-night-850 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-400 ${inp.suffix ? "pl-7 pr-3" : "px-3"}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={start} className="mh-btn-primary mt-6 w-full">
            {run ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {run ? "Run again" : "Run agent"}
          </button>

          <button
            onClick={() => (automated ? disableAutomation(agent.id) : enableAutomation(agent.id, inputs))}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              automated
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <InfinityIcon className="h-4 w-4" />
            {automated ? "Automation on — running for you" : "Automate this (set & forget)"}
          </button>
        </div>

        {/* Output */}
        <div>
          {run ? (
            <RunView run={run} stepsRevealed={revealed} />
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-brand-300">
                <AgentIcon name={agent.icon} className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm text-zinc-400">Configure and press <span className="font-semibold text-white">Run agent</span> to watch it work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
