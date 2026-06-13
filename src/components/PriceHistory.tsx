import { ArrowDownRight, ArrowUpRight, Minus, History } from "lucide-react";
import type { PriceEvent } from "@/types";
import { formatCAD, formatDate } from "@/lib/format";

export function PriceHistory({ history }: { history: PriceEvent[] }) {
  const ordered = [...history].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  return (
    <div>
      <div className="flow-root">
        <ul className="-mb-6">
          {ordered.map((e, i) => {
            const prev = i > 0 ? ordered[i - 1].price : null;
            const delta = prev ? e.price - prev : 0;
            const last = i === ordered.length - 1;
            return (
              <li key={`${e.date}-${i}`}>
                <div className="relative pb-6">
                  {!last && <span className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-ink-100" />}
                  <div className="relative flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        e.event === "Sold" ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {delta > 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : delta < 0 ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <Minus className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{e.event}</p>
                        <p className="text-xs text-ink-500">{formatDate(e.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-900">{formatCAD(e.price)}</p>
                        {prev && delta !== 0 && (
                          <p className={`text-xs font-semibold ${delta > 0 ? "text-maple-600" : "text-brand-600"}`}>
                            {delta > 0 ? "+" : ""}
                            {formatCAD(delta)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
        <History className="h-3.5 w-3.5" />
        Full price history — the data most Canadian portals don&apos;t show for free.
      </p>
    </div>
  );
}
