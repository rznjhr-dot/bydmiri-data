/* ─── Shared finance math (single source of truth) ───
 *
 * Flat-rate loan calculation used by /vehicles, /finance,
 * /top-up and /admin. Keep every surface in
 * sync by importing from here instead of re-implementing.
 */
import { finance } from "@/data";

export interface MonthlyParams {
  /** Annual flat interest rate in percent, e.g. 2.30 */
  interestRatePct: number;
  /** Tenure in years */
  tenureYears: number;
}

export const DEFAULT_FINANCE_PARAMS: MonthlyParams = {
  interestRatePct: finance.interestRate,
  tenureYears: finance.defaultTenure,
};

/**
 * Monthly instalment for a loan amount under a flat interest rate.
 * monthly = (loan + loan × rate × years) / (years × 12)
 */
export function calcMonthlyPayment(loanAmount: number, params: MonthlyParams = DEFAULT_FINANCE_PARAMS): number {
  const { interestRatePct, tenureYears } = params;
  if (loanAmount <= 0 || tenureYears <= 0) return 0;
  const rate = interestRatePct / 100;
  const totalInterest = loanAmount * rate * tenureYears;
  const totalPayable = loanAmount + totalInterest;
  return totalPayable / (tenureYears * 12);
}

/**
 * Monthly instalment for a price with a downpayment percentage,
 * under a flat interest rate. Uses default rate/tenure from
 * finance.json unless overridden.
 */
export function calcMonthlyFromPrice(price: number, downPct = 0, params: MonthlyParams = DEFAULT_FINANCE_PARAMS): number {
  const loan = price * (1 - downPct / 100);
  return calcMonthlyPayment(loan, params);
}

/**
 * Admin helper: monthly estimate at finance.json defaults
 * (loan margin % of effective price, default tenure & rate).
 */
export function calcMonthlyAtDefaults(effectivePrice: number): number {
  const loan = effectivePrice * (finance.loanMargin / 100);
  return calcMonthlyPayment(loan);
}

export function formatCurrency(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
