"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calculator, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { Province } from "@/types";
import { affordability, incomeRequiredFor, type AffordabilityInput } from "@/lib/mortgage";
import { formatCAD } from "@/lib/format";
import { PROVINCE_NAMES } from "@/lib/format";
import { cn } from "@/lib/cn";

const PROVINCES: Province[] = ["ON", "BC", "AB", "QC", "MB", "NS", "SK"];
const CITY_OPTIONS = ["Toronto", "Mississauga", "Ottawa", "Vancouver", "Burnaby", "Calgary", "Montreal", "Halifax", "Winnipeg", "Other"];

export function AffordabilityCalculator() {
  const params = useSearchParams();
  const targetPrice = Number(params.get("price")) || 0;
  const targetCondo = Number(params.get("condo")) || 0;
  const targetCity = params.get("city") || "Toronto";
  const targetProv = (params.get("prov") as Province) || "ON";

  const [income, setIncome] = useState(140_000);
  const [downPayment, setDownPayment] = useState(targetPrice ? Math.round(targetPrice * 0.2) : 150_000);
  const [rate, setRate] = useState(4.99);
  const [amortization, setAmortization] = useState(25);
  const [debts, setDebts] = useState(600);
  const [province, setProvince] = useState<Province>(targetProv);
  const [city, setCity] = useState(targetCity);
  const [firstTime, setFirstTime] = useState(true);
  const [condoFee, setCondoFee] = useState(targetCondo);

  const input: AffordabilityInput = {
    householdIncome: income,
    downPayment,
    contractRate: rate,
    amortizationYears: amortization,
    monthlyDebts: debts,
    province,
    city,
    firstTimeBuyer: firstTime,
    monthlyCondoFee: condoFee || undefined,
  };

  const result = useMemo(() => affordability(input), [
    income,
    downPayment,
    rate,
    amortization,
    debts,
    province,
    city,
    firstTime,
    condoFee,
  ]);

  const targetIncome = useMemo(
    () =>
      targetPrice
        ? incomeRequiredFor(targetPrice, {
            downPayment,
            contractRate: rate,
            amortizationYears: amortization,
            monthlyDebts: debts,
            monthlyCondoFee: condoFee || undefined,
          })
        : 0,
    [targetPrice, downPayment, rate, amortization, debts, condoFee],
  );

  const qualifiesForTarget = targetPrice > 0 && income >= targetIncome;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Controls */}
      <div className="mh-card h-fit p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Calculator className="h-4 w-4" />
          </span>
          Your numbers
        </h2>

        <div className="mt-5 space-y-5">
          <Range label="Household income" value={income} min={40_000} max={500_000} step={5_000} onChange={setIncome} format={formatCAD} />
          <Range label="Down payment" value={downPayment} min={0} max={1_000_000} step={5_000} onChange={setDownPayment} format={formatCAD} />
          <Range label="Monthly debt payments" value={debts} min={0} max={4_000} step={50} onChange={setDebts} format={formatCAD} />
          <Range label="Interest rate" value={rate} min={2} max={8} step={0.05} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
          {condoFee > 0 && (
            <Range label="Monthly condo fee" value={condoFee} min={0} max={2_000} step={20} onChange={setCondoFee} format={formatCAD} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amortization">
              <select
                value={amortization}
                onChange={(e) => setAmortization(Number(e.target.value))}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                <option value={25}>25 years</option>
                <option value={30}>30 years</option>
              </select>
            </Field>
            <Field label="Province">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {PROVINCE_NAMES[p]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="City">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {CITY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5">
            <input
              type="checkbox"
              checked={firstTime}
              onChange={(e) => setFirstTime(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            <span className="text-sm font-medium text-ink-700">First-time home buyer</span>
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift sm:p-8">
          <p className="text-sm text-brand-50/90">Your maximum purchase price</p>
          <p className="font-display text-5xl font-extrabold tracking-tight">{formatCAD(result.maxPurchasePrice)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <HeroStat label="Mortgage" value={formatCAD(result.maxMortgage)} />
            <HeroStat label="Monthly payment" value={formatCAD(result.monthlyPayment)} />
            <HeroStat label="Down payment" value={`${result.downPaymentPct}%`} />
          </div>
        </div>

        {targetPrice > 0 && (
          <div
            className={cn(
              "mh-card border-2 p-6",
              qualifiesForTarget ? "border-brand-300 bg-brand-50/40" : "border-amber-300 bg-amber-50/40",
            )}
          >
            <div className="flex items-center gap-2">
              {qualifiesForTarget ? (
                <CheckCircle2 className="h-5 w-5 text-brand-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              <p className="font-display text-base font-bold text-ink-900">
                The {formatCAD(targetPrice)} home you came from
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-600">
              To qualify (stress-tested), you&apos;d need a household income of about{" "}
              <span className="font-bold text-ink-900">{formatCAD(targetIncome)}</span>.{" "}
              {qualifiesForTarget
                ? "You're in range with your current inputs. 🎉"
                : `That's about ${formatCAD(targetIncome - income)} above your current income — try a larger down payment or longer amortization.`}
            </p>
          </div>
        )}

        <div className="mh-card p-6">
          <h3 className="font-display text-lg font-bold text-ink-900">The full breakdown</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <LineItem label="Stress-test qualifying rate" value={`${result.stressTestRate.toFixed(2)}%`} />
            <LineItem label="CMHC insurance premium" value={result.cmhcPremium ? formatCAD(result.cmhcPremium) : "Not required"} />
            <LineItem label="Land transfer tax" value={formatCAD(result.landTransferTax)} />
            <LineItem label="First-time buyer rebate" value={result.firstTimeBuyerRebate ? `−${formatCAD(result.firstTimeBuyerRebate)}` : "—"} accent={result.firstTimeBuyerRebate > 0} />
          </div>

          <ul className="mt-5 space-y-2 border-t border-ink-100 pt-4">
            {result.notes.map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm text-ink-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {n}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-400">
          AffordIQ is an educational estimate using federal B-20 rules and simplified provincial land-transfer math. It
          is not a mortgage pre-approval. Speak to a licensed mortgage professional before making an offer.
        </p>
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink-700">{label}</label>
        <span className="font-display text-sm font-bold text-ink-900">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600"
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      {children}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs text-brand-50/80">{label}</p>
      <p className="font-display text-lg font-extrabold">{value}</p>
    </div>
  );
}

function LineItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
      <span className="text-sm text-ink-600">{label}</span>
      <span className={cn("text-sm font-bold", accent ? "text-brand-700" : "text-ink-900")}>{value}</span>
    </div>
  );
}
