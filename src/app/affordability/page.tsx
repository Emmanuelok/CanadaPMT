import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator, PiggyBank, Landmark, CalendarRange } from "lucide-react";
import { AffordabilityCalculator } from "@/components/AffordabilityCalculator";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "AffordIQ — affordability & stress test",
  description:
    "AffordIQ qualifies you the way a Canadian lender does — folding in the B-20 stress test, CMHC insurance, land-transfer tax and first-time-buyer rebates.",
};

const PROGRAMS = [
  { icon: PiggyBank, title: "FHSA", body: "The First Home Savings Account lets you contribute up to $8,000/year ($40,000 lifetime) — tax-deductible going in, tax-free coming out for a first home." },
  { icon: PiggyBank, title: "RRSP Home Buyers' Plan", body: "Withdraw up to $60,000 per person ($120,000 per couple) from your RRSP toward a first home, repayable over 15 years." },
  { icon: Landmark, title: "Land-transfer rebates", body: "First-time buyers can claw back up to $4,000 in Ontario (plus $4,475 in Toronto) and a full exemption in BC under $500,000." },
  { icon: CalendarRange, title: "30-year amortization", body: "First-time buyers and new-build purchasers can now amortize over 30 years — lowering monthly payments and stretching qualifying power." },
];

export default function AffordabilityPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-gradient-to-br from-brand-900 to-brand-950 py-14 text-white">
        <div className="mh-container">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
            <Calculator className="h-3.5 w-3.5" /> AffordIQ
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight">
            Know exactly what you can afford — the way a lender does.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/90">
            Most calculators ignore the federal B-20 stress test, CMHC insurance and land-transfer tax — so the number
            you get isn&apos;t the number you qualify for. AffordIQ folds it all in.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mh-container">
          <Suspense fallback={<div className="py-20 text-center text-ink-500">Loading calculator…</div>}>
            <AffordabilityCalculator />
          </Suspense>
        </div>
      </section>

      <section className="bg-ink-50/50 py-16">
        <div className="mh-container">
          <SectionHeading
            align="center"
            eyebrow="Stretch your budget"
            title="Canadian programs AffordIQ factors in"
            description="First-time buyers leave money on the table every day. These are the programs that move the needle."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
