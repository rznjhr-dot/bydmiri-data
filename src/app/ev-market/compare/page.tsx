"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import vehicles from "@/data/vehicles.json";
import competitors from "@/data/competitors.json";
import { getRebate } from "@/utils/promotions";
import type { CompetitorBrand, CompetitorModel, CompetitorVariant } from "@/types/ev-market";

interface BYDVariant {
  name: string; otr: number; rebate: number; range: number; rangeNedc: number; battery: number;
  motorPower: number; torque?: number; zeroToHundred?: string; drive?: string; acCharging?: string; maxChargePower: string;
}
interface BYDModel { model: string; segment?: string; variants: BYDVariant[]; }

const bydModels = vehicles as BYDModel[];
type CompBrandData = CompetitorBrand; type CompModelData = CompetitorModel; type CompVariantData = CompetitorVariant;

const competitorMap: Record<string, { brandId: string; modelName: string }[]> = {
  "Atto 2": [{ brandId: "proton", modelName: "e.MAS 5" }],
  "Atto 3": [
    { brandId: "proton", modelName: "e.MAS 7" }, { brandId: "mg", modelName: "MG4 EV" },
    { brandId: "mg", modelName: "MG S5 EV" }, { brandId: "chery", modelName: "OMODA E5" }, { brandId: "leapmotor", modelName: "B10" },
  ],
  "Sealion 7": [
    { brandId: "leapmotor", modelName: "C10" }, { brandId: "leapmotor", modelName: "C10 Plus" }, { brandId: "tesla", modelName: "Model Y" },
  ],
  "Seal": [{ brandId: "mg", modelName: "MG4 EV" }, { brandId: "tesla", modelName: "Model 3" }],
  "Seal 6": [{ brandId: "mg", modelName: "MG4 EV" }, { brandId: "mg", modelName: "MG S5 EV" }, { brandId: "tesla", modelName: "Model 3" }],
  "M6": [],
};

function formatCurrency(amount: number): string {
  return `RM ${Math.round(amount).toLocaleString("en-MY")}`;
}

function formatEMarkup(amount: number): string {
  if (amount === 0) return "";
  if (amount % 1000 === 0) return `+RM${(amount / 1000).toFixed(0)}k EM`;
  return `+RM${amount.toLocaleString()} EM`;
}

function calcMonthly(price: number): string {
  const downpayment = price * 0.1;
  const loanAmount = price - downpayment;
  const totalInterest = loanAmount * 0.023 * 9;
  const monthly = (loanAmount + totalInterest) / 108;
  return formatCurrency(monthly) + "/mo";
}

function estInsurance(price: number): number {
  if (price < 100000) return 2300;
  if (price < 150000) return 3000;
  if (price <= 200000) return 3500;
  return 4000;
}

function estInsuranceStr(price: number): string {
  if (price < 100000) return "~RM2,300/yr";
  if (price < 150000) return "~RM3,000/yr";
  if (price <= 200000) return "~RM3,500/yr";
  return "~RM4,000/yr";
}

export default function ComparePage() {
  const [selectedBYDModel, setSelectedBYDModel] = useState<string>("Atto 3");
  const [selectedBYDVariant, setSelectedBYDVariant] = useState<string>("Ultra");
  const [selectedBrand, setSelectedBrand] = useState<string>("proton");
  const [selectedCompModel, setSelectedCompModel] = useState<string>("");
  const [selectedCompVariant, setSelectedCompVariant] = useState<string>("");

  const compData = competitors as { brands: CompBrandData[] };
  const bydModel = bydModels.find((m) => m.model === selectedBYDModel);
  const bydVariant = bydModel?.variants.find((v) => v.name === selectedBYDVariant);
  const selectedBrandData = compData.brands.find((b) => b.id === selectedBrand);
  const availableModels = selectedBrandData?.models || [];
  const compModel = availableModels.find((m) => m.model === selectedCompModel);
  const compVariant = compModel?.variants.find((v) => v.name === selectedCompVariant);
  const bydVariants = bydModel?.variants || [];
  const compVariants = compModel?.variants || [];
  const suggestions = competitorMap[selectedBYDModel] || [];

  useEffect(() => {
    if (suggestions.length > 0) {
      const first = suggestions[0];
      const brand = compData.brands.find((b) => b.id === first.brandId);
      if (brand) {
        setSelectedBrand(first.brandId);
        const model = brand.models.find((m) => m.model === first.modelName);
        if (model) { setSelectedCompModel(first.modelName); setSelectedCompVariant(model.variants[0]?.name || ""); }
      }
    }
  }, [selectedBYDModel]);

  const comparisonRows = useMemo(() => {
    if (!bydVariant || !compVariant) return [];
    return [
      { label: "Segment", byd: bydModel?.segment || "—", comp: compModel?.segment || "—" },
      { label: "Type", byd: "BEV", comp: compModel?.type === "BEV" ? "BEV" : compModel?.type || "—" },
      { label: "Variant", byd: bydVariant.name, comp: compVariant.name },
      { label: "OTR Price", byd: formatCurrency(bydVariant.otr), comp: `${formatCurrency(compVariant.otr)}${formatEMarkup(selectedBrandData?.emMarkup || 0)}` },
      ...(compVariant.otrAfterRebate || true ? (() => { const r = getRebate(bydModel!.model, bydVariant.name) ?? bydVariant.rebate; return [{ label: "After Rebate", byd: `${formatCurrency(bydVariant.otr - r)} (promo -RM${r.toLocaleString()})`, comp: `${formatCurrency(compVariant.otrAfterRebate || compVariant.otr)}${formatEMarkup(selectedBrandData?.emMarkup || 0)}` }]; })() : []),
      { label: "Monthly (9yr, 10% down)", byd: (() => { const r = getRebate(bydModel!.model, bydVariant.name) ?? bydVariant.rebate; return calcMonthly(bydVariant.otr - r); })(), comp: (() => { const base = compVariant.otrAfterRebate || compVariant.otr; const total = base + (selectedBrandData?.emMarkup || 0) + estInsurance(base); return `${calcMonthly(total)} (incl. EM + ins)`; })() },
      { label: "Range", byd: `${bydVariant.rangeNedc} km (NEDC)`, comp: compVariant.rangeNedc ? `${compVariant.rangeNedc} km (NEDC)` : `${compVariant.range} km` },
      { label: "Battery", byd: `${bydVariant.battery} kWh LFP`, comp: `${compVariant.battery} kWh` },
      { label: "Motor", byd: `${bydVariant.motorPower} kW`, comp: `${compVariant.motorPower} kW` },
      { label: "Torque", byd: bydVariant.torque ? `${bydVariant.torque} Nm` : "—", comp: compVariant.torque ? `${compVariant.torque} Nm` : "—" },
      { label: "AC Charging", byd: bydVariant.acCharging || "7 kW", comp: compVariant.acCharging },
      { label: "DC Charging", byd: bydVariant.maxChargePower, comp: compVariant.dcCharging },
      ...(compVariant.v2l ? [{ label: "V2L", byd: "3.3 kW ✓", comp: compVariant.v2l }] : [{ label: "V2L", byd: "3.3 kW ✓", comp: "—" }]),
      { label: "Drive", byd: bydVariant.drive || "—", comp: compVariant.drive || "—" },
      ...(bydVariant.zeroToHundred || compVariant.zeroToHundred ? [{ label: "0-100 km/h", byd: bydVariant.zeroToHundred ? `${bydVariant.zeroToHundred}s` : "—", comp: compVariant.zeroToHundred ? `${compVariant.zeroToHundred}s` : "—" }] : []),
      { label: "Warranty", byd: "6 yr + 8 yr batt", comp: compVariant.warranty },
    ];
  }, [bydVariant, compVariant, bydModel, compModel]);

  return (
    <main
      id="main-content"
      className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10 subpixel-antialiased"
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="mb-6 sm:mb-8">
        <Link href="/ev-market" className="inline-flex items-center gap-1 text-xs sm:text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-primary)] mb-2 transition-colors font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </Link>
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-1">Compare EVs</h1>
        <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] leading-relaxed">
          BYD ranges in <strong className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">NEDC</strong>.
          <span className="block text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">* Indicative estimates only. BYD: EM w/ ins. Competitors: WM + EM markup + est. ins in monthly. Rebates as of Jul 2026, T&Cs apply. Actual prices may vary — verify with dealer.</span>
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10">
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-3.5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-[0.5rem] sm:text-[0.6rem] font-black text-white">BYD</span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">BYD Model</h2>
          </div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">Model</label>
              <select value={selectedBYDModel} onChange={(e) => { const m = bydModels.find((m) => m.model === e.target.value); setSelectedBYDModel(e.target.value); setSelectedBYDVariant(m?.variants[0]?.name || ""); }} className="select !text-sm !py-2.5">
                {bydModels.map((m) => (<option key={m.model} value={m.model}>{m.model}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">Variant</label>
              <select value={selectedBYDVariant} onChange={(e) => setSelectedBYDVariant(e.target.value)} className="select !text-sm !py-2.5">
                {bydVariants.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-3.5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-hover)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                <rect x="2" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h2 className="text-sm sm:text-base font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">Competitor</h2>
            {suggestions.length > 0 && <span className="text-[0.5rem] sm:text-[0.6rem] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-auto">Auto</span>}
          </div>
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">Brand</label>
              <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setSelectedCompModel(""); setSelectedCompVariant(""); }} className="select !text-sm !py-2.5">
                {compData.brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">Model</label>
              <select value={selectedCompModel} onChange={(e) => { const m = availableModels.find((m) => m.model === e.target.value); setSelectedCompModel(e.target.value); setSelectedCompVariant(m?.variants[0]?.name || ""); }} className="select !text-sm !py-2.5" disabled={availableModels.length === 0}>
                <option value="">Select</option>
                {availableModels.map((m) => (<option key={m.model} value={m.model}>{m.model}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">Variant</label>
              <select value={selectedCompVariant} onChange={(e) => setSelectedCompVariant(e.target.value)} className="select !text-sm !py-2.5" disabled={compVariants.length === 0}>
                {compVariants.length === 0 && <option value="">Select</option>}
                {compVariants.map((v) => (<option key={v.name} value={v.name}>{v.name}</option>))}
              </select>
            </div>
          </div>
          {compVariant?.notes && <p className="mt-2 text-xs sm:text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] leading-relaxed">{compVariant.notes}</p>}
          {selectedBrandData?.emNote && <p className="mt-1.5 text-[0.6rem] sm:text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">EM: {selectedBrandData.emNote}</p>}
          {suggestions.length > 1 && (
            <div className="mt-2.5 pt-2.5 border-t border-[var(--color-border-primary)] dark:border-[var(--color-border-hover)]">
              <p className="text-[0.55rem] sm:text-[0.65rem] font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1 uppercase">Others</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(1).map((s) => {
                  const brand = compData.brands.find((b) => b.id === s.brandId);
                  return (
                    <button key={`${s.brandId}-${s.modelName}`} onClick={() => { setSelectedBrand(s.brandId); setSelectedCompModel(s.modelName); const m = compData.brands.find((b) => b.id === s.brandId)?.models.find((m) => m.model === s.modelName); setSelectedCompVariant(m?.variants[0]?.name || ""); }}
                      className="text-[0.6rem] sm:text-xs font-bold px-2 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] dark:hover:bg-[var(--color-text-tertiary)] transition-colors cursor-pointer min-h-[36px]">
                      {brand?.name} {s.modelName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {comparisonRows.length > 0 ? (
        <>
        {/* BYD Advantages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { icon: "🔋", title: "Blade Battery", desc: "LFP chemistry — safer, no thermal runaway, 5,000+ cycle life" },
            { icon: "🛡️", title: "6+8 Year Warranty", desc: "6 yr vehicle + 8 yr/160k km battery — best in class" },
            { icon: "🔌", title: "V2L Standard", desc: "3.3 kW Vehicle-to-Load on all models — power devices anywhere" },
            { icon: "🌏", title: "World #1 EV Maker", desc: "Largest EV manufacturer globally — proven technology at scale" },
          ].map((adv) => (
            <div key={adv.title} className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200 dark:border-blue-800/40 p-2.5 sm:p-4">
              <p className="text-lg sm:text-xl mb-0.5">{adv.icon}</p>
              <p className="text-[0.65rem] sm:text-sm font-black text-blue-800 dark:text-blue-200">{adv.title}</p>
              <p className="text-[0.55rem] sm:text-xs font-medium text-blue-600 dark:text-blue-300 leading-relaxed mt-0.5">{adv.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[var(--color-border-primary)] dark:border-[var(--color-border-hover)] bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-hover)]">
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3.5 text-[0.65rem] sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider w-[130px] sm:w-[220px]">Spec</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3.5 text-[0.65rem] sm:text-sm font-bold text-accent uppercase tracking-wider">BYD</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3.5 text-[0.65rem] sm:text-sm font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] uppercase tracking-wider">{selectedBrandData?.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-secondary)] dark:divide-[var(--color-border-primary)]">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-hover)]/50 transition-colors">
                    <td className="px-3 sm:px-5 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] whitespace-nowrap">{row.label}</td>
                    <td className={`px-3 sm:px-5 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-bold whitespace-nowrap ${row.byd !== "—" && row.comp !== "—" && compareValues(row.label, row.byd, row.comp) === "byd" ? "text-accent" : "text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]"}`}>{row.byd}</td>
                    <td className={`px-3 sm:px-5 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-bold whitespace-nowrap ${row.byd !== "—" && row.comp !== "—" && compareValues(row.label, row.byd, row.comp) === "comp" ? "text-orange-600 dark:text-orange-400" : "text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]"}`}>{row.comp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedBrandData?.emMarkup !== 0 && comparisonRows.length > 0 && (
            <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[var(--color-bg-tertiary)] dark:bg-[var(--color-bg-hover)] border-t border-[var(--color-border-primary)] dark:border-[var(--color-border-hover)]">
              <p className="text-[0.55rem] sm:text-xs font-bold text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] leading-relaxed">
                * Indicative estimates for reference only. EM markup: +RM{selectedBrandData?.emMarkup?.toLocaleString()} (confirmed or est.). Insurance est: RM2,300/yr (&lt;RM100k), RM3,000/yr (RM100k-150k), RM3,500/yr (RM150k-200k), RM4,000/yr (&gt;RM200k). Rebates as of Jul 2026, T&Cs apply. Actual OTR, rebates & monthly may differ — verify with respective dealers. BYD pricing is East Malaysia with insurance included.
              </p>
            </div>
          )}
        </div>
        </>
      ) : (
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)] rounded-xl shadow-sm border border-[var(--color-border-primary)] p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base font-black text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">Select models to compare</p>
          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">Auto-suggests best competitor match.</p>
        </div>
      )}

      {/* Talking Points */}
      {comparisonRows.length > 0 && (
        <div className="mt-4 sm:mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-700 p-3.5 sm:p-6">
          <h3 className="text-sm sm:text-base font-black text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Talking Points
          </h3>
          <ul className="space-y-1.5">
            {selectedBYDVariant && compVariant && (
              <>
                <li className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex gap-1.5 leading-relaxed font-medium">
                  <span className="font-black shrink-0">💰</span>
                  <span>BYD {formatCurrency(bydVariant!.otr - (getRebate(bydModel!.model, bydVariant!.name) ?? bydVariant!.rebate))}{compVariant.otrAfterRebate ? ` vs ${selectedBrandData?.name} ${formatCurrency(compVariant.otrAfterRebate)}` : ` vs ${selectedBrandData?.name} ${formatCurrency(compVariant.otr)}`}</span>
                </li>
                <li className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex gap-1.5 leading-relaxed font-medium">
                  <span className="font-black shrink-0">🔋</span>
                  <span>BYD {bydVariant!.rangeNedc} km | {selectedBrandData?.name} {compVariant.rangeNedc || compVariant.range} km</span>
                </li>
                {bydVariant!.zeroToHundred && (
                  <li className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex gap-1.5 leading-relaxed font-medium">
                    <span className="font-black shrink-0">⚡</span>
                    <span>0-100: BYD {bydVariant!.zeroToHundred}s{compVariant.zeroToHundred ? ` | ${selectedBrandData?.name} ${compVariant.zeroToHundred}s` : ""}</span>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </main>
  );
}

function compareValues(label: string, bydVal: string, compVal: string): "byd" | "comp" | "none" {
  if (bydVal === "—" || compVal === "—") return "none";
  // Strip currency/unit suffixes for numeric comparison
  const cleanByd = bydVal.replace(/[^0-9.]/g, ""); const cleanComp = compVal.replace(/[^0-9.]/g, "");
  const b = parseFloat(cleanByd); const c = parseFloat(cleanComp);
  if (isNaN(b) || isNaN(c)) return "none";
  if (label === "Range" || label === "Battery" || label === "Motor" || label === "Torque" || label === "DC Charging") return b > c ? "byd" : c > b ? "comp" : "none";
  if (label === "OTR Price" || label === "After Rebate" || label.startsWith("Monthly")) return b < c ? "byd" : c < b ? "comp" : "none";
  if (label === "0-100 km/h") return b < c ? "byd" : c < b ? "comp" : "none";
  return "none";
}
