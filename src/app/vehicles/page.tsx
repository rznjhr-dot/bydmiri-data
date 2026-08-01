"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import company from "@/data/company.json";
import vehicles from "@/data/vehicles.json";
import finance from "@/data/finance.json";
import {
  getRebate,
  getPromotionOptions,
  getDefaultPromotion,
  type PromotionOption,
} from "@/utils/promotions";

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

function promoKey(model: string, variantName: string): string {
  return `${model}::${variantName}`;
}

function promoShortLabel(opt: PromotionOption): string {
  if (!opt.free_gift) return `-RM${opt.rebate.toLocaleString("en-MY")}`;
  const gift = opt.free_gift.match(/^(\d+)\s*Years?/i);
  return `-RM${opt.rebate.toLocaleString("en-MY")} + ${gift ? `${gift[1]}Yr Service` : "Free Gift"}`;
}

function PromoSelector({
  model,
  variantName,
  choice,
  onChoose,
  compact = false,
}: {
  model: string;
  variantName: string;
  choice: Record<string, number>;
  onChoose: (key: string, rebate: number) => void;
  compact?: boolean;
}) {
  const options = getPromotionOptions(model, variantName);
  if (!options || options.length < 2) return null;
  const key = promoKey(model, variantName);
  const selected = choice[key] ?? getDefaultPromotion(model, variantName)?.rebate;
  const activeOpt = options.find((o) => o.rebate === selected);
  return (
    <div className={compact ? "mb-1 px-2" : "mb-3"}>
      <p
        className={`font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider ${
          compact ? "text-[0.55rem] mb-0.5" : "text-[0.6rem] mb-1"
        }`}
      >
        Promotion
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected === opt.rebate;
          return (
            <button
              key={opt.rebate}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChoose(key, opt.rebate)}
              className={`inline-flex items-center gap-1 rounded-full border font-semibold transition-all cursor-pointer ${
                compact ? "text-[0.6rem] px-2 py-0.5" : "text-[0.65rem] px-2.5 py-1"
              } ${
                active
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_2px_8px_rgba(29,78,216,0.35)]"
                  : "bg-white border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]"
              }`}
            >
              {active && (
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {promoShortLabel(opt)}
            </button>
          );
        })}
      </div>
      {activeOpt?.free_gift && (
        <p className="text-[0.55rem] text-[var(--color-accent)] mt-1">Includes {activeOpt.free_gift}</p>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [promoChoice, setPromoChoice] = useState<Record<string, number>>({});

  const handlePromoChoice = (key: string, rebate: number) =>
    setPromoChoice((prev) => ({ ...prev, [key]: rebate }));

  const effectiveRebate = (model: string, variantName: string): number => {
    const key = promoKey(model, variantName);
    if (promoChoice[key] !== undefined) return promoChoice[key];
    return (
      getDefaultPromotion(model, variantName)?.rebate ??
      getRebate(model, variantName) ??
      0
    );
  };

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
      <section className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Vehicle Database
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search model or variant..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full border border-[var(--color-border-primary)] bg-white text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] shadow-[var(--shadow-subtle)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-subtle)] focus:border-[var(--color-accent)]/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {filteredVehicles.length === 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)] text-center py-8">No vehicles match &quot;{search}&quot;</p>
        ) : (
          filteredVehicles.map((vehicle) => (
            <section key={vehicle.model}>
              {/* ─── Mobile: ultra-compact table ──────────── */}
              <div className="sm:hidden">
                <button
                  onClick={() => setExpandedModel(expandedModel === vehicle.model ? null : vehicle.model)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 px-0.5 cursor-pointer"
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
                    className={`text-[var(--color-text-tertiary)] transition-transform ${expandedModel === vehicle.model ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {/* Column headers */}
                <div className="grid grid-cols-[70px_1fr_1fr_auto_80px_72px] gap-1.5 px-2 mb-0.5">
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Variant</span>
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Batt</span>
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Range</span>
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Rebate</span>
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider text-right">OTR</span>
                  <span className="text-[0.45rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider text-right">10%/mo</span>
                </div>
                {vehicle.variants.map((variant) => {
                  const rebate = effectiveRebate(vehicle.model, variant.name);
                  const effectivePrice = variant.otr - rebate;
                  return (
                    <div key={variant.name} className="mb-0.5">
                      <div className="grid grid-cols-[70px_1fr_1fr_auto_80px_72px] gap-1.5 items-center py-1.5 px-2 rounded-lg bg-white border border-[var(--color-border-primary)]">
                        {/* Variant name */}
                        <span className="text-[0.65rem] font-bold text-[var(--color-text-primary)] truncate leading-tight">
                          {variant.name}
                        </span>
                        {/* Battery */}
                        <span className="flex items-center gap-1 text-[0.55rem] text-[var(--color-text-tertiary)] leading-tight">
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></svg>
                          {variant.battery ? `${variant.battery}kWh` : "—"}
                        </span>
                        {/* Range */}
                        <span className="flex items-center gap-1 text-[0.55rem] text-[var(--color-text-tertiary)] leading-tight">
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {variant.range}km
                        </span>
                        {/* Rebate */}
                        {rebate && rebate > 0 ? (
                          <span className="text-[0.55rem] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded leading-tight justify-self-start">
                            -RM{rebate.toLocaleString("en-MY")}
                          </span>
                        ) : (
                          <span className="text-[0.5rem] text-[var(--color-text-tertiary)] leading-tight">—</span>
                        )}
                        {/* OTR with insurance */}
                        <span className="text-[0.6rem] font-bold text-[var(--color-text-primary)] text-right leading-tight">
                          {formatCurrency(variant.otr)}
                        </span>
                        {/* Monthly 10% down + rebate */}
                        <span className="text-[0.6rem] font-semibold text-accent text-right leading-tight">
                          {formatCurrency(calcMonthly(effectivePrice, 10))}
                          <span className="text-[0.4rem] font-normal text-[var(--color-text-tertiary)]">/mo</span>
                        </span>
                      </div>
                      <PromoSelector
                        model={vehicle.model}
                        variantName={variant.name}
                        choice={promoChoice}
                        onChoose={handlePromoChoice}
                        compact
                      />
                    </div>
                  );
                })}

                {/* ─── Expanded full specs ───────────────── */}
                {expandedModel === vehicle.model && (
                  <div className="mt-2 space-y-2">
                    {vehicle.variants.map((variant) => {
                      const rebate = effectiveRebate(vehicle.model, variant.name);
                      const effectivePrice = variant.otr - rebate;
                      return (
                        <div key={variant.name} className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50 p-2.5">
                          <p className="text-[0.65rem] font-bold text-[var(--color-text-primary)] mb-1.5">{vehicle.model} {variant.name}</p>
                          <PromoSelector
                            model={vehicle.model}
                            variantName={variant.name}
                            choice={promoChoice}
                            onChoose={handlePromoChoice}
                          />
                          <div className="space-y-1">
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">OTR without Insurance</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(variant.otrWithoutInsurance)}</span>
                            </div>
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Insurance</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(variant.otr - variant.otrWithoutInsurance)}</span>
                            </div>
                            <div className="divider-gradient my-1" />
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">OTR Price</span>
                              <span className="data-row-value text-[0.55rem] font-bold">{formatCurrency(variant.otr)}</span>
                            </div>
                            {rebate && rebate > 0 && (
                              <div className="data-row">
                                <span className="data-row-label text-[0.55rem]">Rebate</span>
                                <span className="data-row-value text-[0.55rem] text-green-600 font-bold">-{formatCurrency(rebate)}</span>
                              </div>
                            )}
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Effective Price</span>
                              <span className="data-row-value text-[0.55rem] text-accent font-bold">{formatCurrency(effectivePrice)}</span>
                            </div>
                            <div className="divider-gradient my-1" />
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Monthly 0%</span>
                              <span className="data-row-value text-[0.55rem]">{formatCurrency(calcMonthly(effectivePrice, 0))}/mo</span>
                            </div>
                            <div className="data-row">
                              <span className="data-row-label text-[0.55rem]">Monthly 10%</span>
                              <span className="data-row-value text-[0.55rem] font-semibold">{formatCurrency(calcMonthly(effectivePrice, 10))}/mo</span>
                            </div>
                            <div className="divider-gradient my-1" />
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
                <h2 className="section-title text-base flex items-center gap-2">
                  {vehicle.model}
                  <span className="chip !text-[0.6rem] !font-semibold uppercase tracking-wider">
                    {vehicle.segment ?? "EV"}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicle.variants.map((variant) => {
                    const rebate = effectiveRebate(vehicle.model, variant.name);
                    const effectivePrice = variant.otr - rebate;
                    return (
                      <div key={variant.name} className="card card-elevated !p-4 flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-[var(--color-text-primary)] text-[0.95rem] tracking-tight leading-tight">
                              {vehicle.model}
                            </h3>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{variant.name}</p>
                          </div>
                          {rebate && rebate > 0 ? (
                            <span className="badge badge-green shrink-0">
                              -{formatCurrency(rebate)}
                            </span>
                          ) : null}
                        </div>

                        <PromoSelector
                          model={vehicle.model}
                          variantName={variant.name}
                          choice={promoChoice}
                          onChoose={handlePromoChoice}
                        />

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
                          <div className="border-t border-[var(--color-border-primary)]/50 my-1.5" />
                          <div className="data-row">
                            <span className="data-row-label">OTR Price</span>
                            <span className="data-row-value font-bold text-base">
                              {formatCurrency(variant.otr)}
                            </span>
                          </div>
                          {rebate && rebate > 0 && (
                            <div className="data-row">
                              <span className="data-row-label">Rebate</span>
                              <span className="data-row-value text-green-600 font-bold text-base">
                                -{formatCurrency(rebate)}
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
                        <hr className="divider-gradient" />

                        {/* Monthly */}
                        <div className="rounded-xl bg-gradient-to-br from-[var(--color-accent-light)] to-white border border-[var(--color-accent)]/15 p-3 space-y-1">
                          <p className="text-[0.6rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                            Monthly Instalment
                          </p>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-[var(--color-text-tertiary)]">0% Down</span>
                            <span className="text-xl font-extrabold text-[var(--color-accent)] whitespace-nowrap">
                              {formatCurrency(calcMonthly(effectivePrice, 0))}
                              <span className="text-xs font-normal text-[var(--color-text-tertiary)]">/mo</span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-[var(--color-text-tertiary)]">
                            <span>10% Down</span>
                            <span className="font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                              {formatCurrency(calcMonthly(effectivePrice, 10))}/mo
                            </span>
                          </div>
                        </div>

        <div className="space-y-1 mt-auto">
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

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
        </div>
      </footer>
    </div>
  );
}
