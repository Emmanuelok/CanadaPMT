import { MapPinned, TrendingUp } from "lucide-react";
import { neighbourhoodById } from "@/lib/data/neighbourhoods";
import { ScoreBar } from "@/components/ui";
import { formatCAD, formatCADCompact, formatPercent } from "@/lib/format";

export function NeighbourhoodPanel({ neighbourhoodId }: { neighbourhoodId: string }) {
  const nb = neighbourhoodById(neighbourhoodId);
  if (!nb) return null;

  const metrics: [string, number][] = [
    ["Schools", nb.scores.schools],
    ["Transit", nb.scores.transit],
    ["Safety", nb.scores.safety],
    ["Walkability", nb.scores.walkability],
    ["Growth momentum", nb.scores.growth],
    ["Climate resilience", nb.scores.climateResilience],
  ];

  return (
    <section className="mh-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <MapPinned className="h-4 w-4" />
          </span>
          Neighbourhood IQ · {nb.name}
        </h2>
        <span className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-brand-700 text-white">
          <span className="font-display text-base font-extrabold leading-none">{nb.scores.overall}</span>
          <span className="text-[8px] font-semibold uppercase">score</span>
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-600">{nb.summary}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Median price" value={formatCADCompact(nb.medianPrice)} />
        <Stat label="Median rent" value={`${formatCAD(nb.medianRent)}`} />
        <Stat label="12-mo change" value={formatPercent(nb.priceYoY)} accent={nb.priceYoY >= 0} />
      </div>

      <div className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {metrics.map(([label, value]) => (
          <ScoreBar key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {nb.highlights.map((h) => (
          <span key={h} className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600">
            {h}
          </span>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`mt-0.5 flex items-center justify-center gap-1 font-display text-base font-extrabold ${accent === undefined ? "text-ink-900" : accent ? "text-brand-600" : "text-maple-600"}`}>
        {accent !== undefined && <TrendingUp className="h-3.5 w-3.5" />}
        {value}
      </p>
    </div>
  );
}
