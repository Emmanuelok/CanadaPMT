import Link from "next/link";
import { Star, MessageSquare, Clock, BadgeCheck, AlertTriangle, Languages } from "lucide-react";
import { agentById } from "@/lib/data/agents";
import { AriaButton } from "@/components/AriaButton";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function AgentCard({ agentId, hideDirectoryLink }: { agentId: string; hideDirectoryLink?: boolean }) {
  const agent = agentById(agentId);

  if (!agent) {
    return (
      <div className="mh-card border-maple-200 bg-maple-50/40 p-6">
        <div className="flex items-center gap-2 text-maple-700">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-semibold">No verified agent</p>
        </div>
        <p className="mt-2 text-sm text-ink-600">
          This listing is posted by an unverified private lister. ScamShield has flagged it — do not transfer any
          money or share documents until ownership is confirmed in person.
        </p>
        <Link href="/newcomers" className="mh-link mt-3 inline-block text-sm">
          How to avoid rental scams →
        </Link>
      </div>
    );
  }

  return (
    <div className="mh-card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 font-display text-lg font-extrabold text-white">
          {initials(agent.name)}
        </span>
        <div>
          <p className="flex items-center gap-1 font-display text-base font-bold text-ink-900">
            {agent.name}
            {agent.verified && <BadgeCheck className="h-4 w-4 text-brand-600" />}
          </p>
          <p className="text-xs text-ink-500">{agent.title}</p>
          <p className="text-xs text-ink-500">{agent.brokerage}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1 font-semibold text-ink-900">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {agent.rating.toFixed(1)}
        </span>
        <span className="text-ink-400">·</span>
        <span className="text-ink-500">{agent.reviewsCount} reviews</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <Stat label="Deals (12 mo)" value={`${agent.dealsClosed12mo}`} />
        <Stat label="List-to-sold" value={`${agent.listToSoldRatio}%`} />
        <Stat label="Avg days on mkt" value={`${agent.avgDaysOnMarket}d`} />
        <Stat label="Trust score" value={`${agent.trustScore}`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.specialties.map((s) => (
          <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {s}
          </span>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
        <Languages className="h-3.5 w-3.5" />
        {agent.languages.join(" · ")}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
        <Clock className="h-3.5 w-3.5" />
        Typically replies within {agent.responseTimeHours} hour{agent.responseTimeHours > 1 ? "s" : ""}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <AriaButton className="mh-btn-primary w-full">
          <MessageSquare className="h-4 w-4" /> Contact {agent.name.split(" ")[0]}
        </AriaButton>
        {!hideDirectoryLink && (
          <Link href="/agents" className="mh-btn-ghost w-full">
            See all agents
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-2.5">
      <p className="font-display text-base font-extrabold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-500">{label}</p>
    </div>
  );
}
