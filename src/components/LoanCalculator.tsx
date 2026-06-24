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
  const [includeCspRebate, setIncludeCspRebate] = useState(true);
  const [customInterestRate, setCustomInterestRate] = useState(String(finance.interestRate));

  const currentVehicle = vehicles.find((v) => v.model === selectedModel)!;
  const currentVariant: Variant = currentVehicle.variants[selectedVariantIdx];

  const cspRebateAmount = useMemo(() => {
    if (!includeCspRebate) return 0;
    const overrides = finance.additionalRebate.overrides as Record<string, number>;
    return overrides[selectedModel] ?? finance.additionalRebate.default;
  }, [selectedModel, includeCspRebate]);

  const parsedInterestRate = useMemo(() => {
    const val = parseFloat(customInterestRate);
    return isNaN(val) || val <= 0 ? finance.interestRate : val;
  }, [customInterestRate]);

  const priceAfterRebate = useMemo(() => {
    const rebate = includeRebate ? currentVariant.rebate : 0;
    return Math.max(0, currentVariant.otr - rebate - cspRebateAmount);
  }, [currentVariant, includeRebate, cspRebateAmount]);

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
    const rate = parsedInterestRate / 100;
    const totalInterest = loanAmount * rate * tenure;
    const totalPayable = loanAmount + totalInterest;
    return totalPayable / (tenure * 12);
  }, [loanAmount, tenure, parsedInterestRate]);

  const totalInterest = useMemo(() => {
    const rate = parsedInterestRate / 100;
    return loanAmount * rate * tenure;
  }, [loanAmount, tenure, parsedInterestRate]);

  const totalPayable = useMemo(() => {
    return loanAmount + totalInterest;
  }, [loanAmount, totalInterest]);

  const [copied, setCopied] = useState(false);

  const buildQuotation = useCallback(() => {
    const today = new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
    const downRemark = downpaymentCustom
      ? "(custom: RM " + downpaymentCustom + ")"
      : "(" + downpaymentPct + "% downpayment)";
    const lines = [
      "Quotation for " + currentVehicle.model + " " + currentVariant.name,
      "━━━━━━━━━━━━━━━━━━",
      "",
      "Price Breakdown",
      "OTR without Insurance: " + formatCurrency(currentVariant.otrWithoutInsurance),
      "Est. Insurance: " + formatCurrency(currentVariant.otr - currentVariant.otrWithoutInsurance),
      "OTR Price: " + formatCurrency(currentVariant.otr),
    ];
    if (includeRebate && currentVariant.rebate > 0) {
      lines.push("Rebate: -" + formatCurrency(currentVariant.rebate));
    }
    if (includeCspRebate && cspRebateAmount > 0) {
      lines.push("CSP/GSP/SSP Rebate: -" + formatCurrency(cspRebateAmount));
    }
    lines.push("After Rebate: " + formatCurrency(priceAfterRebate));
    lines.push("");
    lines.push("Financing");
    lines.push("Downpayment: " + formatCurrency(downpaymentAmount) + " " + downRemark);
    lines.push("Loan Amount: " + formatCurrency(loanAmount));
    lines.push("Est. Interest Rate: " + parsedInterestRate + "%");
    lines.push("Tenure: " + tenure + " Years");
    lines.push("");
    lines.push("Monthly Payment");
    lines.push(formatCurrency(monthlyPayment) + "/month (" + parsedInterestRate + "% × " + tenure + "y)");
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━");
    lines.push("BYD Miri - Ridzuan Jahari " + today);
    return lines.join("\n");
  }, [currentVehicle, currentVariant, includeRebate, includeCspRebate, cspRebateAmount, parsedInterestRate, priceAfterRebate, downpaymentAmount, loanAmount, tenure, monthlyPayment, downpaymentPct, downpaymentCustom]);

  const handleCopyQuotation = useCallback(async () => {
    const text = buildQuotation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      <h2 className="section-title text-[0.85rem]">Finance Calculator</h2>
      <div className="card card-elevated overflow-hidden !p-0">
        <div className="divide-y divide-[var(--color-border-primary)]/60">
          {/* Controls */}
          <div className="p-2.5 space-y-2">
            {/* Model + Variant row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.55rem] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedVariantIdx(0);
                  }}
                  className="select !text-xs !py-1.5"
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
                  <label className="block text-[0.55rem] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                    Variant
                  </label>
                  <select
                    value={selectedVariantIdx}
                    onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                    className="select !text-xs !py-1.5"
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

            {/* Rebate toggles row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-2 py-1.5 border border-neutral-100/80">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIncludeRebate(!includeRebate)}>
                  <div className={`w-7 h-4 rounded-full transition-colors relative ${includeRebate ? "bg-accent" : "bg-neutral-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${includeRebate ? "translate-x-3" : ""}`} />
                  </div>
                  <span className="text-[0.6rem] font-medium text-neutral-600">Rebate</span>
                </label>
                {currentVariant.rebate > 0 && (
                  <span className="text-[0.6rem] font-semibold text-green-600">{formatCurrency(currentVariant.rebate)}</span>
                )}
              </div>
              <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-2 py-1.5 border border-neutral-100/80">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIncludeCspRebate(!includeCspRebate)}>
                  <div className={`w-7 h-4 rounded-full transition-colors relative ${includeCspRebate ? "bg-accent" : "bg-neutral-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${includeCspRebate ? "translate-x-3" : ""}`} />
                  </div>
                  <span className="text-[0.6rem] font-medium text-neutral-600 truncate">{finance.additionalRebate.label.split(" ")[0]}</span>
                </label>
                <span className="text-[0.6rem] font-semibold text-blue-600">{formatCurrency(cspRebateAmount)}</span>
              </div>
            </div>

            {/* Downpayment */}
            <div>
              <label className="block text-[0.55rem] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                Downpayment
              </label>
              <div className="flex gap-1 mb-1">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDownpaymentPct(pct);
                      setDownpaymentCustom("");
                    }}
                    className={`pill !text-[0.65rem] !py-1 flex-1 ${
                      downpaymentPct === pct && !downpaymentCustom ? "pill-active" : ""
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="input-group">
                <span className="input-prefix !text-[0.65rem]">RM</span>
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
                  className="input !text-xs !py-1.5"
                />
              </div>
            </div>

            {/* Tenure + Interest row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.55rem] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                  Tenure
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTenure(t)}
                      className={`pill !text-[0.55rem] !py-1 !px-1.5 ${tenure === t ? "pill-active" : ""}`}
                    >
                      {t}y
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[0.55rem] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                  Interest Rate
                </label>
                <div className="input-group">
                  <span className="input-prefix !text-[0.65rem]">%</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="2.30"
                    value={customInterestRate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setCustomInterestRate(val);
                    }}
                    className="input !text-xs !py-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-2.5 bg-gradient-to-r from-accent/5 to-[var(--color-bg-secondary)]">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[0.6rem] font-semibold text-neutral-400 uppercase tracking-widest">
                Payment Summary
              </h3>
              <button
                type="button"
                onClick={handleCopyQuotation}
                className="p-1 rounded-md text-neutral-300 hover:text-accent hover:bg-accent/5 transition-all cursor-pointer flex items-center gap-1 text-[0.55rem] font-medium"
                aria-label="Copy quotation"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Quotation
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[0.6rem]">
              <div className="flex justify-between">
                <span className="text-neutral-400">OTR w/o Ins.</span>
                <span className="font-medium text-neutral-800">{formatCurrency(currentVariant.otrWithoutInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Insurance</span>
                <span className="font-medium text-neutral-800">{formatCurrency(currentVariant.otr - currentVariant.otrWithoutInsurance)}</span>
              </div>
              <div className="flex justify-between col-span-2 border-t border-neutral-100/50 pt-0.5">
                <span className="text-neutral-800 font-semibold">OTR Price</span>
                <span className="font-bold text-neutral-800">{formatCurrency(currentVariant.otr)}</span>
              </div>
              {includeRebate && currentVariant.rebate > 0 && (
                <div className="flex justify-between col-span-2">
                  <span className="text-neutral-400">Rebate</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(currentVariant.rebate)}</span>
                </div>
              )}
              {includeCspRebate && cspRebateAmount > 0 && (
                <div className="flex justify-between col-span-2">
                  <span className="text-neutral-400">{finance.additionalRebate.label}</span>
                  <span className="font-semibold text-blue-600">-{formatCurrency(cspRebateAmount)}</span>
                </div>
              )}
              <div className="flex justify-between col-span-2 border-t border-neutral-100/50 pt-0.5">
                <span className="text-neutral-400">After Rebate</span>
                <span className="font-semibold">{formatCurrency(priceAfterRebate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Downpayment</span>
                <span className="font-medium">{downpaymentAmount > 0 ? formatCurrency(downpaymentAmount) : "RM0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{parsedInterestRate}% × {tenure}y</span>
                <span className="font-medium">{formatCurrency(loanAmount)}</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t-2 border-accent/20 flex items-center justify-between">
              <div>
                <p className="text-[0.55rem] text-neutral-400 font-medium">Monthly</p>
                <p className="text-[0.45rem] text-neutral-300">{parsedInterestRate}% × {tenure}y</p>
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-accent tracking-tight">
                {formatCurrency(monthlyPayment)}
                <span className="text-[0.6rem] font-normal text-neutral-400">/mo</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
