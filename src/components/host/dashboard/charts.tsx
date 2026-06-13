"use client";

import { useId } from "react";
import type { MonthStat } from "@/lib/host/portfolio";
import { formatCADCompact } from "@/lib/format";

// Lightweight, dependency-free SVG charts tuned for the dark dashboard.

export function RevenueBars({ months }: { months: MonthStat[] }) {
  const gid = useId();
  const W = 480;
  const H = 180;
  const top = 12;
  const bottom = 26;
  const chartH = H - top - bottom;
  const max = Math.max(1, ...months.map((m) => m.gross));
  const slot = W / months.length;
  const barW = slot * 0.6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly revenue">
      <defs>
        <linearGradient id={`net-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d3a5" />
          <stop offset="100%" stopColor="#0f9b75" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1="0" y1={top + chartH} x2={W} y2={top + chartH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {months.map((m, i) => {
        const grossH = (m.gross / max) * chartH;
        const netH = (m.net / max) * chartH;
        const x = i * slot + (slot - barW) / 2;
        const last = i === months.length - 1;
        return (
          <g key={m.key || i}>
            <title>{`${m.label}: ${formatCADCompact(m.gross)} gross · ${formatCADCompact(m.net)} net`}</title>
            {/* fee portion (top, faint) */}
            <rect x={x} y={top + chartH - grossH} width={barW} height={Math.max(0, grossH - netH)} fill="rgba(255,255,255,0.14)" rx="2" />
            {/* net portion */}
            <rect
              x={x}
              y={top + chartH - netH}
              width={barW}
              height={netH}
              fill={`url(#net-${gid})`}
              rx="2"
              opacity={last ? 1 : 0.82}
            />
            <text x={x + barW / 2} y={H - 9} textAnchor="middle" className="fill-zinc-500" fontSize="10">
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const gid = useId();
  const W = 100;
  const H = 32;
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pts = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * W : 0;
    const y = H - 2 - ((v - min) / range) * (H - 4);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const lastPt = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className ?? "h-8 w-full"} role="img" aria-label="Trend">
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(52,211,165,0.35)" />
          <stop offset="100%" stopColor="rgba(52,211,165,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${gid})`} />
      <path d={line} fill="none" stroke="#34d3a5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {lastPt && <circle cx={lastPt[0]} cy={lastPt[1]} r="1.8" fill="#34d3a5" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
