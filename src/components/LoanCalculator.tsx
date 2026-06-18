"use client";

import { useState, useMemo, useCallback } from "react";
import vehicles from "@/data/vehicles.json";
import finance from "@/data/finance.json";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type Variant = {
  name: string;
  otr: number;
  otrWithoutInsurance: number;
  sumInsured?: number;
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

  const totalInterest = useMemo(() => {
    const rate = finance.interestRate / 100;
    return loanAmount * rate * tenure;
  }, [loanAmount, tenure]);

  const totalPayable = useMemo(() => {
    return loanAmount + totalInterest;
  }, [loanAmount, totalInterest]);

  const [copied, setCopied] = useState(false);

  const buildQuotation = useCallback(() => {
    const today = new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
    const lines = [
      "Quotation for " + currentVehicle.model + " " + currentVariant.name + " (" + today + ")",
      "━━━━━━━━━━━━━━━━━━",
      "Price Breakdown",
      "OTR without Insurance: " + formatCurrency(currentVariant.otrWithoutInsurance),
      "Est. Insurance: " + formatCurrency(currentVariant.otr - currentVariant.otrWithoutInsurance),
      "OTR Price: " + formatCurrency(currentVariant.otr),
    ];
    if (includeRebate && currentVariant.rebate > 0) {
      lines.push("Rebate: -" + formatCurrency(currentVariant.rebate));
    }
    lines.push("After Rebate: " + formatCurrency(priceAfterRebate));
    lines.push("");
    lines.push("Financing");
    lines.push("Downpayment: " + formatCurrency(downpaymentAmount));
    lines.push("Loan Amount: " + formatCurrency(loanAmount));
    lines.push("Est. Interest Rate: " + finance.interestRate + "%");
    lines.push("Tenure: " + tenure + " Years");
    lines.push("");
    lines.push("Monthly Payment");
    lines.push(formatCurrency(monthlyPayment) + "/month (" + finance.interestRate + "% × " + tenure + "y)");
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━");
    lines.push("BYD Miri - Ridzuan Jahari");
    return lines.join("\n");
  }, [currentVehicle, currentVariant, includeRebate, priceAfterRebate, downpaymentAmount, loanAmount, tenure, monthlyPayment, totalInterest, totalPayable]);

  const handleCopyQuotation = useCallback(async () => {
    const text = buildQuotation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [buildQuotation]);

  return (
    <section>
      <h2 className="section-title">Finance Calculator</h2>
      <div className="card card-elevated overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Controls */}
          <div className="lg:col-span-3 p-3 sm:p-4 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedVariantIdx(0);
                  }}
                  className="select"
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
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Variant
                  </label>
                  <select
                    value={selectedVariantIdx}
                    onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                    className="select"
                  >
                    {currentVehicle.variants.map((v, i) => (
                      <option key={v.name} value={i}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Rebate Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  className={`toggle ${includeRebate ? "active" : ""}`}
                  onClick={() => setIncludeRebate(!includeRebate)}
                >
                  <div className="toggle-track">
                    <div className="toggle-thumb" />
                  </div>
                  <span className="ml-3 text-sm font-medium text-neutral-600">
                    Apply Rebate
                  </span>
                </label>
                {currentVariant.rebate > 0 && (
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(currentVariant.rebate)}
                  </span>
                )}
              </div>
              {currentVariant.rebate === 0 && (
                <p className="text-xs text-neutral-400 mt-1 ml-10">
                  No rebate available for this variant
                </p>
              )}
            </div>

            {/* Downpayment */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Downpayment
              </label>
              <div className="flex gap-1.5 mb-1.5">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDownpaymentPct(pct);
                      setDownpaymentCustom("");
                    }}
                    className={`pill flex-1 ${
                      downpaymentPct === pct && !downpaymentCustom
                        ? "pill-active"
                        : ""
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="input-group">
                <span className="input-prefix">RM</span>
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
                  className="input"
                />
              </div>
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Loan Tenure
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                {[2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenure(t)}
                    className={`pill ${tenure === t ? "pill-active" : ""}`}
                  >
                    {t}y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            className="lg:col-span-2 bg-gradient-to-br from-accent/5 to-[var(--color-bg-secondary)] border-t lg:border-t-0 lg:border-l border-[var(--color-border-primary)]/60 p-3 sm:p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  Payment Summary
                </h3>
                <button
                  type="button"
                  onClick={handleCopyQuotation}
                  className="p-1.5 rounded-md text-neutral-300 hover:text-accent hover:bg-accent/5 transition-all cursor-pointer touch-target flex items-center gap-1 text-xs font-medium"
                  aria-label="Copy quotation"
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Quotation
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1 text-sm">
                <div className="data-row">
                  <span className="data-row-label">OTR without Insurance</span>
                  <span className="data-row-value">
                    {formatCurrency(currentVariant.otrWithoutInsurance)}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">
                    Est. Insurance
                    {currentVariant.sumInsured && (
                      <span className="text-[0.55rem] text-blue-400 ml-1 font-normal">
                        (Sum Insured RM {currentVariant.sumInsured.toLocaleString("en-MY")})
                      </span>
                    )}
                  </span>
                  <span className="data-row-value">
                    {formatCurrency(currentVariant.otr - currentVariant.otrWithoutInsurance)}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">OTR Price</span>
                  <span className="data-row-value font-bold text-base">
                    {formatCurrency(currentVariant.otr)}
                  </span>
                </div>
                {includeRebate && currentVariant.rebate > 0 && (
                  <div className="data-row">
                    <span className="data-row-label">Rebate</span>
                    <span className="font-bold text-green-600 text-base">
                      -{formatCurrency(currentVariant.rebate)}
                    </span>
                  </div>
                )}
                <div className="data-row">
                  <span className="data-row-label">After Rebate</span>
                  <span className="data-row-value">
                    {formatCurrency(priceAfterRebate)}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-1.5 data-row">
                  <span className="data-row-label">Downpayment</span>
                  <span className="data-row-value">
                    {downpaymentAmount > 0
                      ? formatCurrency(downpaymentAmount)
                      : "RM0"}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Loan Amount</span>
                  <span className="data-row-value">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Interest Rate</span>
                  <span className="data-row-value">
                    {finance.interestRate}%
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Tenure</span>
                  <span className="data-row-value">{tenure} Years</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t-2 border-accent/20">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">
                    Monthly Payment
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {finance.interestRate}% × {tenure}y
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-accent tracking-tight">
                  {formatCurrency(monthlyPayment)}
                  <span className="text-sm font-normal text-neutral-400">/mo</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
