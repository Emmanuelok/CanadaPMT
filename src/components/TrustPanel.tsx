import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { Property } from "@/types";
import { assessListing } from "@/lib/scamShield";
import { cn } from "@/lib/cn";

export function TrustPanel({ property }: { property: Property }) {
  const a = assessListing(property);

  const tone =
    a.risk === "low"
      ? { ring: "bg-brand-600", chip: "bg-brand-50 text-brand-700", label: "Low risk · trusted" }
      : a.risk === "medium"
        ? { ring: "bg-amber-500", chip: "bg-amber-50 text-amber-700", label: "Use caution" }
        : { ring: "bg-maple-600", chip: "bg-maple-50 text-maple-700", label: "High fraud risk" };

  return (
    <section className="mh-card overflow-hidden">
      {a.risk === "high" && (
        <div className="flex items-center gap-2 bg-maple-600 px-6 py-3 text-sm font-semibold text-white">
          <AlertTriangle className="h-5 w-5" />
          High fraud risk — never pay a deposit or e-transfer before viewing in person.
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              {a.risk === "low" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            </span>
            ScamShield trust report
          </h2>
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tone.chip)}>{tone.label}</span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className={cn("flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-white", tone.ring)}>
            <span className="font-display text-xl font-extrabold leading-none">{a.score}</span>
            <span className="text-[10px] font-semibold uppercase">/ 100</span>
          </div>
          <p className="text-sm leading-relaxed text-ink-600">
            We score every listing on lister identity, land-registry ownership, photo authenticity, price sanity and
            cross-platform duplication — protections newcomers and students rarely get elsewhere.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {a.positives.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink-700">Passed checks</p>
              <ul className="mt-2 space-y-1.5">
                {a.positives.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.warnings.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink-700">Warnings</p>
              <ul className="mt-2 space-y-1.5">
                {a.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-ink-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-maple-600" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-5 flex items-start gap-1.5 text-xs text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ScamShield is an automated risk signal, not a guarantee. Always view in person and verify ownership before
          paying anything.
        </p>
      </div>
    </section>
  );
}
