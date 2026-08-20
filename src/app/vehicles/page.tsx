"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { company, vehicles } from "@/data";
import { formatCurrency, calcMonthlyFromPrice } from "@/utils/finance";
import {
  getRebate,
  getPromotionOptions,
  getDefaultPromotion,
  type PromotionOption,
} from "@/utils/promotions";

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
}: {
  model: string;
  variantName: string;
  choice: Record<string, number>;
  onChoose: (key: string, rebate: number) => void;
}) {
  const options = getPromotionOptions(model, variantName);
  if (!options || options.length < 2) return null;
  const key = promoKey(model, variantName);
  const selected = choice[key] ?? getDefaultPromotion(model, variantName)?.rebate;
  const activeOpt = options.find((o) => o.rebate === selected);
  return (
    <div className="mb-1">
      <p className="text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
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
              className={`inline-flex items-center gap-1 rounded-full border text-[0.7rem] px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[var(--shadow-accent)]"
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
        <p className="text-[0.7rem] text-[var(--color-accent)] mt-1">Includes {activeOpt.free_gift}</p>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
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

  const totalVariants = filteredVehicles.reduce(
    (acc, v) => acc + v.variants.length,
    0
  );

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
            {filteredVehicles.length} models &middot; {totalVariants} variants &middot; {company.branch}
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
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
          /* ─── Unified dense table — one row per variant ─── */
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="veh-table w-full border-collapse">
                <thead className="sticky top-14 sm:top-16 z-10 bg-[var(--color-bg-secondary)]">
                  <tr className="border-b border-[var(--color-border-primary)]">
                    <th className="text-left font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Model / Variant
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Range
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Batt
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Rebate
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      OTR w/ Ins.
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      Effective
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                      0%/mo
                    </th>
                    <th className="text-right font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                      10%/mo
                    </th>
                    <th className="w-8" aria-label="Expand" />
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) =>
                    vehicle.variants.map((variant, vi) => {
                      const rebate = effectiveRebate(vehicle.model, variant.name);
                      const effective = variant.otr - rebate;
                      const rowKey = `${vehicle.model}-${variant.name}`;
                      const isOpen = expanded === rowKey;
                      return (
                        <Fragment key={rowKey}>
                          {/* Model group separator */}
                          {vi === 0 && (
                            <tr key={`${vehicle.model}-group`} className="bg-[var(--color-bg-tertiary)]/60">
                              <td colSpan={9} className="py-1.5 px-3">
                                <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
                                  {vehicle.model}
                                </span>
                                {vehicle.segment && (
                                  <span className="text-[0.65rem] text-[var(--color-text-tertiary)] ml-2 uppercase tracking-wider">
                                    {vehicle.segment}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                          <tr
                            key={rowKey}
                            onClick={() => setExpanded(isOpen ? null : rowKey)}
                            className={`border-b border-[var(--color-border-secondary)] cursor-pointer transition-colors ${
                              isOpen ? "bg-[var(--color-accent-light)]/60" : "hover:bg-[var(--color-accent-light)]/40"
                            }`}
                          >
                            <td className="pr-2">
                              <span className="font-semibold text-[var(--color-text-primary)]">{variant.name}</span>
                            </td>
                            <td className="text-right text-[var(--color-text-tertiary)] tabular-nums whitespace-nowrap">
                              {variant.range}km
                            </td>
                            <td className="text-right text-[var(--color-text-tertiary)] tabular-nums whitespace-nowrap">
                              {variant.battery ? `${variant.battery}kWh` : "—"}
                            </td>
                            <td className="text-right font-semibold text-[var(--color-success)] tabular-nums whitespace-nowrap">
                              {rebate > 0 ? `-${formatCurrency(rebate)}` : "—"}
                            </td>
                            <td className="text-right font-medium text-[var(--color-text-secondary)] tabular-nums whitespace-nowrap">
                              {formatCurrency(variant.otr)}
                            </td>
                            <td className="text-right font-bold text-[var(--color-text-primary)] tabular-nums whitespace-nowrap">
                              {formatCurrency(effective)}
                            </td>
                            <td className="text-right font-extrabold text-[var(--color-accent)] tabular-nums whitespace-nowrap">
                              {formatCurrency(calcMonthlyFromPrice(effective, 0))}
                            </td>
                            <td className="text-right font-bold text-[var(--color-accent)] tabular-nums whitespace-nowrap">
                              {formatCurrency(calcMonthlyFromPrice(effective, 10))}
                            </td>
                            <td className="text-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`text-[var(--color-text-tertiary)] transition-transform inline-block ${isOpen ? "rotate-180" : ""}`}
                              >
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </td>
                          </tr>
                          {/* Expanded detail — everything from the old card */}
                          {isOpen && (
                            <tr key={`${rowKey}-detail`} className="border-b border-[var(--color-border-secondary)] bg-[var(--color-accent-light)]/30">
                              <td colSpan={9} className="px-3 py-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Price breakdown */}
                                  <div>
                                    <p className="text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">
                                      Price Breakdown
                                    </p>
                                    <div className="space-y-1">
                                      <div className="data-row">
                                        <span className="data-row-label">OTR without Insurance</span>
                                        <span className="data-row-value">{formatCurrency(variant.otrWithoutInsurance)}</span>
                                      </div>
                                      <div className="data-row">
                                        <span className="data-row-label">
                                          Est. Insurance
                                          {variant.sumInsured && (
                                            <span className="text-[0.7rem] text-blue-400 ml-1 font-normal">
                                              (Sum RM {variant.sumInsured.toLocaleString("en-MY")})
                                            </span>
                                          )}
                                        </span>
                                        <span className="data-row-value">
                                          {formatCurrency(variant.otr - variant.otrWithoutInsurance)}
                                        </span>
                                      </div>
                                      <div className="data-row">
                                        <span className="data-row-label">Booking Fee</span>
                                        <span className="data-row-value">
                                          {variant.bookingFee ? formatCurrency(variant.bookingFee) : "—"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Tech specs */}
                                  <div>
                                    <p className="text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">
                                      Specs
                                    </p>
                                    <div className="space-y-1">
                                      {variant.motorPower && (
                                        <div className="data-row">
                                          <span className="data-row-label">Power</span>
                                          <span className="data-row-value">{variant.motorPower} kW</span>
                                        </div>
                                      )}
                                      {variant.zeroToHundred && (
                                        <div className="data-row">
                                          <span className="data-row-label">0–100 km/h</span>
                                          <span className="data-row-value">{variant.zeroToHundred}s</span>
                                        </div>
                                      )}
                                      {variant.maxChargePower && (
                                        <div className="data-row">
                                          <span className="data-row-label">Max Charge</span>
                                          <span className="data-row-value">{variant.maxChargePower}</span>
                                        </div>
                                      )}
                                      {variant.acCharging && (
                                        <div className="data-row">
                                          <span className="data-row-label">AC Charging</span>
                                          <span className="data-row-value">{variant.acCharging}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Promotion selector */}
                                  <div>
                                    <PromoSelector
                                      model={vehicle.model}
                                      variantName={variant.name}
                                      choice={promoChoice}
                                      onChoose={handlePromoChoice}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
