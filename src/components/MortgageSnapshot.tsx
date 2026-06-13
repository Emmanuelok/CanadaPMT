import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import type { Property } from "@/types";
import { monthlyPayment, incomeRequiredFor, stressTestRate } from "@/lib/mortgage";
import { formatCAD } from "@/lib/format";

const DEFAULT_RATE = 4.99;
const AMORT = 25;

export function MortgageSnapshot({ property }: { property: Property }) {
  if (property.listingType === "rent" || property.listingType === "sold") return null;

  const down = Math.round(property.price * 0.2);
  const principal = property.price - down;
  const payment = Math.round(monthlyPayment(principal, DEFAULT_RATE, AMORT));
  const income = incomeRequiredFor(property.price, {
    downPayment: down,
    contractRate: DEFAULT_RATE,
    amortizationYears: AMORT,
    monthlyDebts: 0,
    monthlyCondoFee: property.maintenanceFee,
  });
  const stress = stressTestRate(DEFAULT_RATE);

  const affordHref = `/affordability?price=${property.price}&city=${encodeURIComponent(property.address.city)}&prov=${property.address.province}${property.maintenanceFee ? `&condo=${property.maintenanceFee}` : ""}`;

  return (
    <section className="mh-card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Calculator className="h-4 w-4" />
        </span>
        AffordIQ snapshot
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-ink-50 p-4">
          <p className="text-xs text-ink-500">Est. monthly payment</p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-ink-900">{formatCAD(payment)}</p>
          <p className="text-xs text-ink-500">principal &amp; interest</p>
        </div>
        <div className="rounded-xl bg-ink-50 p-4">
          <p className="text-xs text-ink-500">Income to qualify</p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-ink-900">~{formatCAD(income)}</p>
          <p className="text-xs text-ink-500">household, stress-tested</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1 text-sm text-ink-600">
        <li>· Assumes 20% down ({formatCAD(down)}), {AMORT}-year amortization at {DEFAULT_RATE}%.</li>
        <li>· Qualified at the {stress.toFixed(2)}% B-20 stress-test rate.</li>
        {property.maintenanceFee ? <li>· Includes 50% of the {formatCAD(property.maintenanceFee)} condo fee.</li> : null}
      </ul>

      <Link href={affordHref} className="mh-btn-primary mt-5 w-full">
        Personalize in AffordIQ <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
