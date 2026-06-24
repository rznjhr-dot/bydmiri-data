"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import company from "@/data/company.json";
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

function calcMonthly(price: number, downPct: number): number {
  const rate = finance.interestRate / 100;
  const tenure = finance.defaultTenure;
  const loan = price * (1 - downPct / 100);
  const totalInterest = loan * rate * tenure;
  const totalPayable = loan + totalInterest;
  return totalPayable / (tenure * 12);
}

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const q = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.model.toLowerCase().includes(q) ||
        v.variants.some((va) => va.name.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            Vehicle Database
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Complete catalog of all {vehicles.length} BYD models available at {company.branch}
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* ─── Filter ───────────────────────────────────── */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search model or variant..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200/60 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">No vehicles match &quot;{search}&quot;</p>
        ) : (
          filteredVehicles.map((vehicle) => (
            <section key={vehicle.model}>
              {/* ─── Mobile: ultra-compact table ──────────── */}
              <div className="sm:hidden">
                <button
                  onClick={() => setExpandedModel(expandedModel === vehicle.model ? null : vehicle.model)}
                  className="w-full flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 px-0.5 cursor-pointer"
                >
                  <span>{vehicle.model}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-neutral-400 transition-transform ${expandedModel === vehicle.model ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {/* Column headers */}
                <div className="grid grid-cols-[70px_1fr_1fr_auto_80px_72px] gap-1.5 px-2 mb-0.5">
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider">Variant</span>
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider">Batt</span>
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider">Range</span>
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider">Rebate</span>
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider text-right">OTR</span>
                  <span className="text-[0.45rem] font-semibold text-neutral-400 uppercase tracking-wider text-right">10%/mo</span>
                </div>
                {vehicle.variants.map((variant) => {
                  const effectivePrice = variant.otr - (variant.rebate || 0);
                  return (
                    <div
                      key={variant.name}
                      className="grid grid-cols-[70px_1fr_1fr_auto_80px_72px] gap-1.5 items-center py-1.5 px-2 rounded-lg mb-0.5 bg-white border border-neutral-200"
                    >
                      {/* Variant name */}
                      <span className="text-[0.65rem] font-bold text-neutral-800 truncate leading-tight">
                        {variant.name}
                      </span>
                      {/* Battery */}
                      <span className="flex items-center gap-1 text-[0.55rem] text-neutral-500 leading-tight">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>
                        {variant.battery ? `${variant.battery}kWh` : "—"}
                      </span>
                      {/* Range */}
                      <span className="flex items-center gap-1 text-[0.55rem] text-neutral-500 leading-tight">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {variant.range}km
                      </span>
                      {/* Rebate */}
                      {variant.rebate && variant.rebate > 0 ? (
                        <span className="text-[0.55rem] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded leading-tight justify-self-start">
                          -RM{variant.rebate.toLocaleString("en-MY")}
                        </span>
                      ) : (
                        <span className="text-[0.5rem] text-neutral-300 leading-tight">—</span>
                      )}
                      {/* OTR with insurance */}
                      <span className="text-[0.6rem] font-bold text-neutral-800 text-right leading-tight">
                        {formatCurrency(variant.otr)}
                      </span>
                      {/* Monthly 10% down + rebate */}
                      <span className="text-[0.6rem] font-semibold text-accent text-right leading-tight">
                        {formatCurrency(calcMonthly(effectivePrice, 10))}
                        <span className="text-[0.4rem] font-normal text-neutral-400">/mo</span>
                      </span>
                    </div>
                  );
                })}

                {/* ─── Expanded full specs ───────────────── */}
                {expandedModel === vehicle.model && (
                  <div className="mt-2 space-y-2">
                    {vehicle.variants.map((variant) => {
                      const effectivePrice = variant.otr - (variant.rebate || 0);
                      return (
                        <div key={variant.name} className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-2.5">
                          <p className="text-[0.65rem] font-bold text-neutral-800 mb-1.5">{vehicle.model} {variant.name}</p>
                          <div className="space-y-1">
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">OTR without Insurance</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(variant.otrWithoutInsurance)}</span>
                            </div>
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Insurance</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(variant.otr - variant.otrWithoutInsurance)}</span>
                            </div>
                            <div className="border-t border-neutral-200/50 my-1" />
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">OTR Price</span>
                              <span className="data-row-value text-[0.55rem] font-bold">{formatCurrency(variant.otr)}</span>
                            </div>
                            {variant.rebate && variant.rebate > 0 && (
                              <div className="data-row">
                                <span className="data-row-label text-[0.55rem]">Rebate</span>
                                <span className="data-row-value text-[0.55rem] text-green-600 font-bold">-{formatCurrency(variant.rebate)}</span>
                              </div>
                            )}
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Effective Price</span>
                              <span className="data-row-value text-[0.55rem] text-accent font-bold">{formatCurrency(effectivePrice)}</span>
                            </div>
                            <div className="border-t border-neutral-200/50 my-1" />
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Monthly 0%</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(calcMonthly(effectivePrice, 0))}/mo</span>
                            </div>
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Monthly 10%</span>
                              <span className="data-row-value text-[0.55rem] font-semibold">{formatCurrency(calcMonthly(effectivePrice, 10))}/mo</span>
                            </div>
                            <div className="border-t border-neutral-200/50 my-1" />
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Range</span>
                              <span className="data-row-value text-[0.55rem]">{variant.range} km</span>
                            </div>
                            {variant.battery && (
                              <div className="data-row">
                                <span className="data-row-label text-[0.55rem]">Battery</span>
                                <span className="data-row-value text-[0.55rem]">{variant.battery} kWh</span>
                              </div>
                            )}
                            {variant.maxChargePower && (
                              <div className="data-row">
                                <span className="data-row-label text-[0.55rem]">Max Charge</span>
                                <span className="data-row-value text-[0.55rem]">{variant.maxChargePower}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ─── Desktop: card grid ────────────────── */}
              <div className="hidden sm:block">
                <h2 className="section-title text-base">{vehicle.model}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {vehicle.variants.map((variant) => {
                    const effectivePrice = variant.otr - (variant.rebate || 0);
                    return (
                      <div key={variant.name} className="card card-elevated">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h3 className="font-bold text-neutral-800 text-base">
                              {vehicle.model}
                            </h3>
                            <p className="text-xs text-neutral-400">{variant.name}</p>
                          </div>
                          {variant.rebate && variant.rebate > 0 ? (
                            <span className="badge badge-green shrink-0">
                              -{formatCurrency(variant.rebate)}
                            </span>
                          ) : null}
                        </div>

                        {/* Prices */}
                        <div className="space-y-1 mb-1.5">
                          <div className="data-row">
                            <span className="data-row-label">OTR without Insurance</span>
                            <span className="data-row-value">
                              {formatCurrency(variant.otrWithoutInsurance)}
                            </span>
                          </div>
                          <div className="data-row">
                            <span className="data-row-label">
                              Est. Insurance
                              {variant.sumInsured && (
                                <span className="text-[0.55rem] text-blue-400 ml-1 font-normal">
                                  (Sum Insured RM {variant.sumInsured.toLocaleString("en-MY")})
                                </span>
                              )}
                            </span>
                            <span className="data-row-value">
                              {formatCurrency(variant.otr - variant.otrWithoutInsurance)}
                            </span>
                          </div>
                          <div className="border-t border-neutral-100/50 my-1.5" />
                          <div className="data-row">
                            <span className="data-row-label">OTR Price</span>
                            <span className="data-row-value font-bold text-base">
                              {formatCurrency(variant.otr)}
                            </span>
                          </div>
                          {variant.rebate && variant.rebate > 0 && (
                            <div className="data-row">
                              <span className="data-row-label">Rebate</span>
                              <span className="data-row-value text-green-600 font-bold text-base">
                                -{formatCurrency(variant.rebate)}
                              </span>
                            </div>
                          )}
                          <div className="data-row">
                            <span className="data-row-label">Effective Price</span>
                            <span className="data-row-value text-accent">
                              {formatCurrency(effectivePrice)}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-neutral-100 mb-1.5" />

                        {/* Monthly */}
                        <div className="bg-accent/5 rounded-lg p-2 space-y-0.5 mb-1.5">
                          <p className="text-[0.6rem] font-semibold text-neutral-400 uppercase tracking-wider">
                            Monthly Instalment
                          </p>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-neutral-400">0% Down</span>
                            <span className="text-xl font-extrabold text-accent whitespace-nowrap">
                              {formatCurrency(calcMonthly(effectivePrice, 0))}
                              <span className="text-xs font-normal text-neutral-400">/mo</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-neutral-400">
                            <span>10% Down</span>
                            <span className="font-semibold whitespace-nowrap">
                              {formatCurrency(calcMonthly(effectivePrice, 10))}/mo
                            </span>
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="space-y-1">
                          <div className="data-row">
                            <span className="data-row-label">Range</span>
                            <span className="data-row-value">
                              {variant.range}km
                            </span>
                          </div>
                          {variant.battery && (
                            <div className="data-row">
                              <span className="data-row-label">Battery</span>
                              <span className="data-row-value">
                                {variant.battery}kWh
                              </span>
                            </div>
                          )}
                          {variant.maxChargePower && (
                            <div className="data-row">
                              <span className="data-row-label">Max Charge</span>
                              <span className="data-row-value">
                                {variant.maxChargePower}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
        </div>
      </footer>
    </div>
  );
}
