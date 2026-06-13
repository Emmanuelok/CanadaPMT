import type { Metadata } from "next";
import { BadgeCheck, LineChart, Clock, Languages } from "lucide-react";
import { agents } from "@/lib/data/agents";
import { AgentCard } from "@/components/AgentCard";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Find an agent — transparent track records",
  description:
    "Browse verified Canadian real estate agents with transparent performance data: real list-to-sold ratios, deal volume, response times and languages.",
};

const DIFFERENTIATORS = [
  { icon: BadgeCheck, title: "Verified, not self-reported", body: "Every agent's identity and licence are verified before they appear." },
  { icon: LineChart, title: "Real performance data", body: "List-to-sold ratios and average days-on-market — the numbers that actually predict outcomes." },
  { icon: Clock, title: "Honest response times", body: "See how fast an agent really replies before you reach out." },
  { icon: Languages, title: "Matched to your language", body: "Filter for agents who speak your language and know your community." },
];

export default function AgentsPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-brand-900 to-brand-950 py-14 text-white">
        <div className="mh-container">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
            <BadgeCheck className="h-3.5 w-3.5" /> The agent network
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight">
            A real estate network you can actually vet.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/90">
            Canada&apos;s regulators have been criticised for thin oversight of agents. MapleHaus answers with radical
            transparency — verified licences and real, comparable performance data on every professional.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mh-container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink-900">{d.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mh-container">
          <SectionHeading eyebrow="Top performers" title="Verified agents across Canada" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agentId={a.id} hideDirectoryLink />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
