"use client";

import { useState, useMemo, useCallback } from "react";
import { vehicles, finance } from "@/data";
import { formatCurrency } from "@/utils/finance";
import {
  getRebate,
  getCspRebate,
  getCspReplacement,
  getDefaultPromotion,
} from "@/utils/promotions";

type Variant = {
  name: string;
  otr: number;
  otrWithoutInsurance: number;
  rrp?: number;
  roadTax?: number;
  sumInsured?: number;
  rebate: number;
  bookingFee?: number;
  registrationFee?: number;
  b2InspectionFee?: number;
  evPlateFee?: number;
};

function parseNum(s: string): number | null {
  const v = parseFloat(s.replace(/,/g, ""));
  return isNaN(v) ? null : v;
}

export default function TopUpCalculator() {
  const [selectedModel, setSelectedModel] = useState(vehicles[0].model);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [includeRebate, setIncludeRebate] = useState(true);
  const [includeCspRebate, setIncludeCspRebate] = useState(true);
  const [downpaymentPct, setDownpaymentPct] = useState<number>(10);
  const [actualInsurance, setActualInsurance] = useState("");
  const [approvedLoan, setApprovedLoan] = useState("");
  const [bookingFeeInput, setBookingFeeInput] = useState("");
  const [copied, setCopied] = useState(false);

  const currentVehicle = vehicles.find((v) => v.model === selectedModel) ?? vehicles[0];
  const currentVariant: Variant = currentVehicle.variants[selectedVariantIdx];

  const estInsurance = currentVariant.otr - currentVariant.otrWithoutInsurance;
  const cspReplacement = getCspReplacement(selectedModel);
  const bookingFee = parseNum(bookingFeeInput) ?? (currentVariant.bookingFee ?? 1000);

  const rebate = useMemo(() => {
    if (!includeRebate) return 0;
    return (
      getDefaultPromotion(selectedModel, currentVariant.name)?.rebate ??
      getRebate(selectedModel, currentVariant.name) ??
      currentVariant.rebate
    );
  }, [selectedModel, currentVariant.name, currentVariant.rebate, includeRebate]);

  const cspAmount = useMemo(
    () => (includeCspRebate ? getCspRebate(selectedModel) : 0),
    [selectedModel, includeCspRebate]
  );

  const quotedAfterRebate = Math.max(0, currentVariant.otr - rebate - cspAmount);
  const actualIns = parseNum(actualInsurance) ?? estInsurance;

  // Selling price breakdown (A)
  const sellingPrice = currentVariant.rrp ?? currentVariant.otrWithoutInsurance;
  const roadTax = currentVariant.roadTax ?? 0;
  const insurancePremium = actualIns;
  const registrationFee = currentVariant.registrationFee ?? 60;
  const b2InspectionFee = currentVariant.b2InspectionFee ?? 200;
  const evPlateFee = currentVariant.evPlateFee ?? 150;
  const subtotalA =
    sellingPrice + roadTax + insurancePremium + registrationFee + b2InspectionFee + evPlateFee;

  // Deductions (B)
  const rebateTotal = rebate + cspAmount;
  const standardDown = (quotedAfterRebate * downpaymentPct) / 100;
  const approved = parseNum(approvedLoan);
  const financing =
    approved !== null
      ? approved
      : subtotalA - standardDown - rebateTotal - bookingFee;
  const subtotalB = financing + rebateTotal + bookingFee;
  const balance = subtotalA - subtotalB;

  const handleCopy = useCallback(async () => {
    const lines = [
      "PRICE BREAKDOWN",
      "━━━━━━━━━━━━━━━━━━",
      "",
      currentVehicle.model + " " + currentVariant.name,
      "",
      "SELLING PRICE BREAKDOWN",
      "Selling Price (RRP): " + formatCurrency(sellingPrice),
      "Road Tax: " + formatCurrency(roadTax),
      "Insurance Premium: " + formatCurrency(insurancePremium),
      "Registration Fees: " + formatCurrency(registrationFee),
      "B2 Inspection Fees: " + formatCurrency(b2InspectionFee),
      "EV Plate Fees: " + formatCurrency(evPlateFee),
      "Subtotal Price (A): " + formatCurrency(subtotalA),
      "",
      "DEDUCTIONS",
      "Financing Amount: " + (approved !== null ? formatCurrency(financing) : "Auto (" + formatCurrency(financing) + ")"),
      "Rebate / Promo: -" + formatCurrency(rebateTotal),
      "Booking Fees: -" + formatCurrency(bookingFee),
      "Subtotal Deductions (B): " + formatCurrency(subtotalB),
      "",
      "BALANCE PAYABLE (A - B): " + formatCurrency(balance),
      "",
      "━━━━━━━━━━━━━━━━━━",
      "PAYMENT INFORMATION",
      "Please make a payment transfer to:",
      "",
      "RHB BANK",
      "Account No: 2610 20000 45490",
      "KAH PROGRESSION AUTO SDN BHD",
      "Remarks: Downpayment Balance",
      "",
      "━━━━━━━━━━━━━━━━━━",
      "BYD Miri - Ridzuan Jahari " + new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
    ];
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
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
    }
    setTimeout(() => setCopied(false), 2000);
  }, [currentVehicle, currentVariant, sellingPrice, roadTax, insurancePremium, registrationFee, b2InspectionFee, evPlateFee, subtotalA, financing, approved, rebateTotal, bookingFee, subtotalB, balance]);

  const onModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedVariantIdx(0);
    setActualInsurance("");
    setApprovedLoan("");
    setBookingFeeInput("");
  };

  const onVariantChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    setActualInsurance("");
    setApprovedLoan("");
    setBookingFeeInput("");
  };

  return (
    <section>
      <h2 className="section-title text-[0.85rem]">Price Breakdown</h2>
      <div className="card card-elevated overflow-hidden !p-0">
        <div className="divide-y divide-[var(--color-border-primary)]/60">
          {/* Controls */}
          <div className="p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
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
                  <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                    Variant
                  </label>
                  <select
                    value={selectedVariantIdx}
                    onChange={(e) => onVariantChange(Number(e.target.value))}
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

            {/* Rebate + CSP toggles */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-[var(--color-bg-tertiary)]/60 rounded-xl px-2.5 py-2 border border-[var(--color-border-primary)]">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIncludeRebate(!includeRebate)}>
                  <div className={`w-7 h-4 rounded-full transition-colors relative ${includeRebate ? "bg-accent" : "bg-neutral-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${includeRebate ? "translate-x-3" : ""}`} />
                  </div>
                  <span className="text-[0.7rem] font-medium text-[var(--color-text-secondary)]">Rebate</span>
                </label>
                {rebate > 0 && (
                  <span className="text-[0.7rem] font-semibold text-green-600">{formatCurrency(rebate)}</span>
                )}
              </div>
              <div className="flex items-center justify-between bg-[var(--color-bg-tertiary)]/60 rounded-xl px-2.5 py-2 border border-[var(--color-border-primary)]">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setIncludeCspRebate(!includeCspRebate)}>
                  <div className={`w-7 h-4 rounded-full transition-colors relative ${includeCspRebate ? "bg-accent" : "bg-neutral-300"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${includeCspRebate ? "translate-x-3" : ""}`} />
                  </div>
                  <span className="text-[0.7rem] font-medium text-[var(--color-text-secondary)] truncate">{cspReplacement || finance.additionalRebate.label.split(" ")[0]}</span>
                </label>
                {cspReplacement ? (
                  <span className="text-[0.7rem] font-semibold text-purple-600 text-right leading-tight max-w-[50%]">{cspReplacement.replace(" (worth RM3,888)", "")}</span>
                ) : (
                  <span className="text-[0.7rem] font-semibold text-blue-600">{formatCurrency(cspAmount)}</span>
                )}
              </div>
            </div>

            {/* Downpayment */}
            <div>
              <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                Downpayment (auto financing)
              </label>
              <div className="flex gap-1">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownpaymentPct(pct)}
                    className={`pill !text-xs !py-2 flex-1 ${downpaymentPct === pct ? "pill-active" : ""}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Actual insurance */}
            <div>
              <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                Actual Insurance
              </label>
              <div className="input-group">
                <span className="input-prefix !text-[0.7rem]">RM</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={formatCurrency(estInsurance)}
                  value={actualInsurance}
                  onChange={(e) => setActualInsurance(e.target.value.replace(/[^0-9.,]/g, ""))}
                  className="input !text-xs !py-1.5"
                />
              </div>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mt-0.5">
                Pre-determined: {formatCurrency(estInsurance)} · Sum Insured: {currentVariant.sumInsured ? formatCurrency(currentVariant.sumInsured) : "—"} · kosong = guna pre-determined
              </p>
            </div>

            {/* Approved loan */}
            <div>
              <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                Financing Amount (kosong = auto {downpaymentPct}% down)
              </label>
              <div className="input-group">
                <span className="input-prefix !text-[0.7rem]">RM</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Auto"
                  value={approvedLoan}
                  onChange={(e) => setApprovedLoan(e.target.value.replace(/[^0-9.,]/g, ""))}
                  className="input !text-xs !py-1.5"
                />
              </div>
            </div>

            {/* Booking Fee */}
            <div>
              <label className="block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                Booking Fee
              </label>
              <div className="input-group">
                <span className="input-prefix !text-[0.7rem]">RM</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={formatCurrency(currentVariant.bookingFee ?? 1000)}
                  value={bookingFeeInput}
                  onChange={(e) => setBookingFeeInput(e.target.value.replace(/[^0-9.,]/g, ""))}
                  className="input !text-xs !py-1.5"
                />
              </div>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mt-0.5">
                Default: {formatCurrency(currentVariant.bookingFee ?? 1000)} · kosong = guna default
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="p-2.5 bg-gradient-to-r from-[var(--color-accent-light)]/70 to-[var(--color-bg-secondary)]">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                Price Breakdown Summary
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-accent hover:bg-accent/5 transition-all cursor-pointer flex items-center gap-1 text-[0.7rem] font-medium"
                aria-label="Copy price breakdown"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Summary
                  </>
                )}
              </button>
            </div>

            <p className="text-[0.7rem] font-bold text-[var(--color-text-primary)] mb-1.5">
              {currentVehicle.model} {currentVariant.name}
            </p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[0.7rem]">
              <div className="col-span-2 text-[0.7rem] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest border-t border-[var(--color-border-primary)]/50 pt-1">
                Selling Price Breakdown
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Selling Price (RRP)</span>
                <span className="font-medium">{formatCurrency(sellingPrice)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Road Tax</span>
                <span className="font-medium">{formatCurrency(roadTax)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Insurance Premium</span>
                <span className="font-medium">{formatCurrency(insurancePremium)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Registration Fees</span>
                <span className="font-medium">{formatCurrency(registrationFee)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">B2 Inspection Fees</span>
                <span className="font-medium">{formatCurrency(b2InspectionFee)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">EV Plate Fees</span>
                <span className="font-medium">{formatCurrency(evPlateFee)}</span>
              </div>
              <div className="flex justify-between col-span-2 border-t border-[var(--color-border-primary)]/50 pt-0.5">
                <span className="text-[var(--color-text-primary)] font-semibold">Subtotal Price (A)</span>
                <span className="font-bold">{formatCurrency(subtotalA)}</span>
              </div>

              <div className="col-span-2 text-[0.7rem] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest border-t border-[var(--color-border-primary)]/50 pt-1">
                Deductions
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Financing Amount</span>
                <span className="font-medium">{approved !== null ? formatCurrency(financing) : "Auto (" + formatCurrency(financing) + ")"}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Rebate / Promo</span>
                <span className="font-semibold text-green-600">-{formatCurrency(rebateTotal)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-[var(--color-text-tertiary)]">Booking Fees</span>
                <span className="font-semibold text-amber-600">-{formatCurrency(bookingFee)}</span>
              </div>
              <div className="flex justify-between col-span-2 border-t border-[var(--color-border-primary)]/50 pt-0.5">
                <span className="text-[var(--color-text-primary)] font-semibold">Subtotal Deductions (B)</span>
                <span className="font-bold">{formatCurrency(subtotalB)}</span>
              </div>

              <div className="flex justify-between col-span-2 border-t border-[var(--color-border-primary)]/50 pt-0.5">
                <span className="text-[var(--color-text-primary)] font-bold">Balance Payable (A − B)</span>
                <span className="font-extrabold">{formatCurrency(balance)}</span>
              </div>
            </div>

            <div className={`mt-2 rounded-lg px-2.5 py-2 border-t-2 ${balance > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
              <p className="text-[0.7rem] font-medium text-[var(--color-text-tertiary)]">
                {balance > 0 ? "Customer kena bayar (balance payable)" : "Tiada baki diperlukan"}
              </p>
              <p className={`text-lg sm:text-xl font-extrabold tracking-tight ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(balance)}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
