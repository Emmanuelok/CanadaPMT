import type { AffordabilityResult, Province } from "@/types";

// ───────────────────────────────────────────────────────────────────────────
// AffordIQ — affordability + the federal B-20 mortgage stress test
//
// Canada's pain point: the stress test, CMHC insurance, land-transfer tax and
// first-time-buyer rebates are scattered, confusing, and disconnected from
// listings. AffordIQ ties them together and qualifies a buyer the way a lender
// actually would, with full transparency on every line.
// ───────────────────────────────────────────────────────────────────────────

export interface AffordabilityInput {
  householdIncome: number; // gross annual
  downPayment: number; // dollars
  contractRate: number; // % e.g. 4.79
  amortizationYears: number; // 25, 30
  monthlyDebts: number; // car/loans/credit minimums
  province: Province;
  city: string;
  firstTimeBuyer: boolean;
  /** Monthly condo fee for the target, if known. 50% counts toward TDS. */
  monthlyCondoFee?: number;
}

const TDS_LIMIT = 0.44; // total debt service ratio ceiling
const HEAT_MONTHLY = 175;

export function stressTestRate(contractRate: number): number {
  return Math.max(5.25, contractRate + 2);
}

export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

/** CMHC-style insurance premium for down payments under 20%. */
export function cmhcPremium(price: number, downPayment: number): number {
  const ltv = (price - downPayment) / price;
  const downPct = downPayment / price;
  if (downPct >= 0.2) return 0;
  // Insured mortgages are capped at a $1.5M purchase price.
  if (price > 1_500_000) return 0;
  let rate = 0;
  if (ltv > 0.9) rate = 0.04;
  else if (ltv > 0.85) rate = 0.031;
  else if (ltv > 0.8) rate = 0.028;
  return Math.round((price - downPayment) * rate);
}

/** Minimum down payment per federal rules (5% to $500k, 10% on the portion to $1.5M, 20% above). */
export function minimumDownPayment(price: number): number {
  if (price <= 500_000) return price * 0.05;
  if (price <= 1_500_000) return 25_000 + (price - 500_000) * 0.1;
  return price * 0.2;
}

// ── Land transfer tax (provincial + municipal where applicable) ─────────────
function ontarioLTT(price: number): number {
  let tax = 0;
  const brackets: [number, number][] = [
    [55_000, 0.005],
    [250_000, 0.01],
    [400_000, 0.015],
    [2_000_000, 0.02],
    [Infinity, 0.025],
  ];
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (price > prev) {
      tax += (Math.min(price, cap) - prev) * rate;
      prev = cap;
    } else break;
  }
  return tax;
}

function bcPTT(price: number): number {
  let tax = 0;
  if (price > 200_000) tax += (Math.min(price, 2_000_000) - 200_000) * 0.02;
  else return price * 0.01;
  tax += 200_000 * 0.01;
  if (price > 2_000_000) tax += (price - 2_000_000) * 0.03;
  return tax;
}

export function landTransferTax(
  price: number,
  province: Province,
  city: string,
  firstTimeBuyer: boolean,
): { tax: number; rebate: number } {
  let tax = 0;
  let rebate = 0;
  if (province === "ON") {
    tax = ontarioLTT(price);
    // Toronto levies a second, municipal LTT of equal size.
    if (city === "Toronto") tax += ontarioLTT(price);
    if (firstTimeBuyer) {
      rebate = Math.min(tax, 4_000 + (city === "Toronto" ? 4_475 : 0));
    }
  } else if (province === "BC") {
    tax = bcPTT(price);
    if (firstTimeBuyer && price <= 835_000) {
      // Full exemption to $500k, phased to $835k.
      rebate = price <= 500_000 ? tax : Math.max(0, tax * (1 - (price - 500_000) / 335_000));
    }
  } else if (province === "QC") {
    // Montreal "welcome tax" — simplified municipal brackets.
    let t = 0;
    const b: [number, number][] = [
      [58_900, 0.005],
      [294_600, 0.01],
      [552_300, 0.015],
      [1_104_700, 0.02],
      [Infinity, 0.025],
    ];
    let prev = 0;
    for (const [cap, rate] of b) {
      if (price > prev) {
        t += (Math.min(price, cap) - prev) * rate;
        prev = cap;
      } else break;
    }
    tax = t;
  } else if (province === "MB") {
    tax = Math.max(0, (price - 200_000) * 0.02) + 1_720;
  }
  // AB, SK, NS: no land transfer tax (modest registration/deed fees ignored).
  return { tax: Math.round(tax), rebate: Math.round(rebate) };
}

/** Maximum housing carrying cost (P&I + tax + heat + ½ condo) allowed by TDS. */
function maxCarrying(income: number, monthlyDebts: number): number {
  return (income / 12) * TDS_LIMIT - monthlyDebts;
}

export function affordability(input: AffordabilityInput): AffordabilityResult {
  const stressRate = stressTestRate(input.contractRate);
  const carryingBudget = maxCarrying(input.householdIncome, input.monthlyDebts);
  const condoMonthly = (input.monthlyCondoFee ?? 0) * 0.5;

  // Binary search the maximum purchase price that still passes the stress test.
  let lo = input.downPayment;
  let hi = 5_000_000;
  let best = 0;
  for (let i = 0; i < 60; i++) {
    const price = (lo + hi) / 2;
    const downPct = input.downPayment / price;
    const minDown = minimumDownPayment(price);
    const insurable = !(price > 1_500_000 && downPct < 0.2);
    const premium = cmhcPremium(price, input.downPayment);
    const principal = price - input.downPayment + premium;
    const propTaxMonthly = (price * 0.009) / 12;
    const payment = monthlyPayment(principal, stressRate, input.amortizationYears);
    const carrying = payment + propTaxMonthly + HEAT_MONTHLY + condoMonthly;

    const feasible = input.downPayment >= minDown && insurable && carrying <= carryingBudget;
    if (feasible) {
      best = price;
      lo = price;
    } else {
      hi = price;
    }
  }

  const maxPurchasePrice = Math.floor(best / 1000) * 1000;
  const downPaymentPct = maxPurchasePrice > 0 ? (input.downPayment / maxPurchasePrice) * 100 : 0;
  const premium = cmhcPremium(maxPurchasePrice, input.downPayment);
  const maxMortgage = Math.max(0, maxPurchasePrice - input.downPayment + premium);
  const monthlyPaymentActual = monthlyPayment(maxMortgage, input.contractRate, input.amortizationYears);
  const { tax, rebate } = landTransferTax(maxPurchasePrice, input.province, input.city, input.firstTimeBuyer);

  const passesStressTest = maxPurchasePrice >= input.downPayment * 1.2;

  const notes: string[] = [];
  notes.push(
    `Qualified at the stress-test rate of ${stressRate.toFixed(2)}% (the greater of 5.25% or your ${input.contractRate.toFixed(2)}% rate + 2%).`,
  );
  if (downPaymentPct < 20) {
    notes.push(
      `With ${downPaymentPct.toFixed(1)}% down, CMHC mortgage insurance of ${premium ? `$${premium.toLocaleString("en-CA")}` : "$0"} is added to the loan.`,
    );
  } else {
    notes.push("20%+ down — no CMHC mortgage insurance required.");
  }
  if (rebate > 0) {
    notes.push(`First-time buyer land-transfer rebate of $${rebate.toLocaleString("en-CA")} applied.`);
  }
  if (input.province === "AB" || input.province === "SK" || input.province === "NS") {
    notes.push(`${input.province} has no land transfer tax — a real closing-cost advantage.`);
  }

  return {
    maxPurchasePrice,
    maxMortgage: Math.round(maxMortgage),
    monthlyPayment: Math.round(monthlyPaymentActual),
    stressTestRate: stressRate,
    qualifyingIncomeNeeded: input.householdIncome,
    cmhcPremium: premium,
    downPaymentPct: Number(downPaymentPct.toFixed(1)),
    passesStressTest,
    landTransferTax: tax,
    firstTimeBuyerRebate: rebate,
    notes,
  };
}

/** Gross household income required to qualify (stress-tested) for a given price. */
export function incomeRequiredFor(
  price: number,
  opts: { downPayment: number; contractRate: number; amortizationYears: number; monthlyDebts: number; monthlyCondoFee?: number },
): number {
  const stressRate = stressTestRate(opts.contractRate);
  const premium = cmhcPremium(price, opts.downPayment);
  const principal = price - opts.downPayment + premium;
  const propTaxMonthly = (price * 0.009) / 12;
  const payment = monthlyPayment(principal, stressRate, opts.amortizationYears);
  const carrying = payment + propTaxMonthly + HEAT_MONTHLY + (opts.monthlyCondoFee ?? 0) * 0.5;
  const requiredMonthly = (carrying + opts.monthlyDebts) / TDS_LIMIT;
  return Math.round((requiredMonthly * 12) / 1000) * 1000;
}
