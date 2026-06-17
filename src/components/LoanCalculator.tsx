"use client";

import { useState, useMemo } from "react";
import vehicles from "@/data/vehicles.json";
import finance from "@/data/finance.json";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}

type Variant = {
  name: string;
  otr: number;
  rebate: number;
  range: number;
  battery: number | null;
  chargeCost?: number;
};

export default function LoanCalculator() {
  const [selectedModel, setSelectedModel] = useState(vehicles[0].model);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [includeRebate, setIncludeRebate] = useState(true);
  const [tenure, setTenure] = useState(finance.defaultTenure);
  const [downpaymentPct, setDownpaymentPct] = useState<number | null>(10);
  const [downpaymentCustom, setDownpaymentCustom] = useState("");

  const currentVehicle = vehicles.find((v) => v.model === selectedModel)!;
  const currentVariant: Variant = currentVehicle.variants[selectedVariantIdx];

  const priceAfterRebate = useMemo(() => {
    const rebate = includeRebate ? currentVariant.rebate : 0;
    return Math.max(0, currentVariant.otr - rebate);
  }, [currentVariant, includeRebate]);

  const loanAmount = useMemo(() => {
    if (downpaymentCustom) {
      const custom = parseFloat(downpaymentCustom.replace(/,/g, ""));
      if (!isNaN(custom) && custom >= 0) {
        return Math.max(0, priceAfterRebate - custom);
      }
    }
    if (downpaymentPct !== null) {
      return priceAfterRebate * (1 - downpaymentPct / 100);
    }
    return priceAfterRebate * (finance.loanMargin / 100);
  }, [priceAfterRebate, downpaymentPct, downpaymentCustom]);

  const downpaymentAmount = useMemo(() => {
    return priceAfterRebate - loanAmount;
  }, [priceAfterRebate, loanAmount]);

  const monthlyPayment = useMemo(() => {
    const rate = finance.interestRate / 100;
    const totalInterest = loanAmount * rate * tenure;
    const totalPayable = loanAmount + totalInterest;
    return totalPayable / (tenure * 12);
  }, [loanAmount, tenure]);

  const totalPayable = useMemo(() => {
    return monthlyPayment * tenure * 12;
  }, [monthlyPayment, tenure]);

  const totalInterest = useMemo(() => {
    return totalPayable - loanAmount;
  }, [totalPayable, loanAmount]);

  return (
    <section>
      <h2 className="section-title">Loan Calculator</h2>
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Controls */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setSelectedVariantIdx(0);
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-byd-blue/20 focus:border-byd-blue bg-white"
              >
                {vehicles.map((v) => (
                  <option key={v.model} value={v.model}>
                    {v.model}
                  </option>
                ))}
              </select>
            </div>

            {currentVehicle.variants.length > 1 && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Variant
                </label>
                <select
                  value={selectedVariantIdx}
                  onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-byd-blue/20 focus:border-byd-blue bg-white"
                >
                  {currentVehicle.variants.map((v, i) => (
                    <option key={v.name} value={i}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeRebate}
                  onClick={() => setIncludeRebate(!includeRebate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    includeRebate ? "bg-byd-accent" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeRebate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Apply Rebate{" "}
                  {currentVariant.rebate > 0 && includeRebate && (
                    <span className="text-byd-accent font-semibold">
                      ({formatCurrency(currentVariant.rebate)})
                    </span>
                  )}
                </span>
              </label>
              {currentVariant.rebate === 0 && (
                <p className="text-[0.6rem] sm:text-xs text-gray-400 mt-1">
                  No rebate available for this variant
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                Downpayment
              </label>
              <div className="flex gap-2 mb-2">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDownpaymentPct(pct);
                      setDownpaymentCustom("");
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors active:scale-95 ${
                      downpaymentPct === pct && !downpaymentCustom
                        ? "bg-byd-blue text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-400 font-medium">
                  RM
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Custom amount"
                  value={downpaymentCustom}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9,]/g, "");
                    setDownpaymentCustom(val);
                    if (val) setDownpaymentPct(null);
                  }}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-byd-blue/20 focus:border-byd-blue bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5">
                Tenure
              </label>
              <div className="flex gap-2">
                {finance.availableTenures.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenure(t)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors active:scale-95 ${
                      tenure === t
                        ? "bg-byd-blue text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {t}y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border border-gray-100">
            <h3 className="font-semibold text-byd-dark text-[0.65rem] sm:text-xs uppercase tracking-widest">
              Payment Summary
            </h3>

            <div className="space-y-1.5 text-[0.7rem] sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">OTR Price</span>
                <span className="font-medium text-byd-dark">
                  {formatCurrency(currentVariant.otr)}
                </span>
              </div>
              {includeRebate && currentVariant.rebate > 0 && (
                <div className="flex justify-between text-byd-accent">
                  <span>Rebate</span>
                  <span className="font-medium">
                    -{formatCurrency(currentVariant.rebate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">After Rebate</span>
                <span className="font-medium">
                  {formatCurrency(priceAfterRebate)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-1.5 flex justify-between">
                <span className="text-gray-400">Downpayment</span>
                <span className="font-medium text-byd-dark">
                  {downpaymentAmount > 0 ? formatCurrency(downpaymentAmount) : "RM0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Loan Amount</span>
                <span className="font-medium text-byd-dark">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Interest</span>
                <span>{finance.interestRate}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tenure</span>
                <span>{tenure} Years</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Interest</span>
                <span>{formatCurrency(totalInterest)}</span>
              </div>
            </div>

            <div className="border-t-2 border-byd-blue/20 pt-3 sm:pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500">Monthly Payment</span>
                <span className="text-xl sm:text-2xl font-bold text-byd-blue">
                  {formatCurrency(monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-400 mt-0.5">
                <span>Total Payable</span>
                <span>{formatCurrency(totalPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
