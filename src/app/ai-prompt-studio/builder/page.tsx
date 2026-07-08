"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import blocksData from "@/data/prompt-studio/blocks.json";
import rulesData from "@/data/prompt-studio/rules.json";
import vehiclesData from "@/data/vehicles.json";
import companyData from "@/data/company.json";
import { getRebate } from "@/utils/promotions";
import type { PromptBlock, BlockOption, BlocksData, RulesData } from "@/types/prompt-studio";

const data = blocksData as BlocksData;
const { blocks, promptStructure } = data;
const rules = (rulesData as RulesData).categories.find((c) => c.id === "strict_output");
const vehicles = vehiclesData as Array<{ model: string; variants: Array<{ name: string; otr: number; otrWithoutInsurance: number; rebate: number; range: number; battery: number; chargeCost: number; maxChargePower: string }> }>;
const company = companyData as { rebatePeriod: string };

function buildDynamicVehicleBlock(model: string, variant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }): string {
  const rebate = getRebate(model, variant.name) ?? variant.rebate;
  return `Vehicle: BYD ${model} ${variant.name}. OTR Price: RM${variant.otr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}. Range: ${variant.range} km. Battery: ${variant.battery} kWh. Max Charge: ${variant.maxChargePower}. Monthly Rebate (${company.rebatePeriod}): -RM${rebate.toLocaleString("en-MY")}.`;
}

function buildStrictRulesHeader(useOwnPhotos: boolean): string {
  if (!rules) return "";
  const dos = useOwnPhotos ? rules.dos : rules.dos.filter((_, i) => i < 2);
  return `═══ STRICT RULES — MUST FOLLOW ═══\n${dos.map((d: string) => `• ${d}`).join("\n")}`;
}

function buildVehicleContext(model: string, variant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }): string {
  const rebate = getRebate(model, variant.name) ?? variant.rebate;
  return `═══ VEHICLE DATA CONTEXT ═══
Model: BYD ${model} ${variant.name}
OTR Price: RM${variant.otr.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly Rebate (${company.rebatePeriod}): -RM${rebate.toLocaleString("en-MY")}
Range: ${variant.range} km
Battery: ${variant.battery} kWh
Max Charge: ${variant.maxChargePower}`;
}

function formatPrompt(selections: Record<string, string>, model: string, variant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }, useOwnPhotos: boolean): string {
  const body = promptStructure
    .map((blockId) => {
      if (blockId === "vehicle") return buildDynamicVehicleBlock(model, variant);
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return "";
      const optionId = selections[blockId];
      const option = block.options.find((o) => o.id === optionId);
      return option?.content || "";
    })
    .filter(Boolean)
    .join("\n\n");
  const ctx = buildVehicleContext(model, variant);
  const header = buildStrictRulesHeader(useOwnPhotos);
  return `${header}\n\n${ctx}\n\n═══ PROMPT ═══\n\n${body}`;
}

function getDefaultSelections(): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const block of blocks) {
    const selected = block.options.find((o) => o.selected);
    defaults[block.id] = selected?.id || block.options[0]?.id || "";
  }
  return defaults;
}

function getSelectedOption(block: PromptBlock, selections: Record<string, string>): BlockOption | undefined {
  const id = selections[block.id];
  return block.options.find((o) => o.id === id);
}

export default function PromptBuilderPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modelIdx, setModelIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [useOwnPhotos, setUseOwnPhotos] = useState(false);

  const currentVehicle = vehicles[modelIdx] || vehicles[0];
  const currentVariant = currentVehicle?.variants[variantIdx] || currentVehicle?.variants[0];

  // Reset variant index when model changes
  useEffect(() => {
    setVariantIdx(0);
  }, [modelIdx]);

  useEffect(() => {
    setSelections(getDefaultSelections());
  }, []);

  const assembledPrompt = formatPrompt(selections, currentVehicle.model, currentVariant, useOwnPhotos);
  const totalSelected = Object.values(selections).filter(Boolean).length;
  const allSelected = totalSelected === blocks.length;

  const handleSelect = (blockId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [blockId]: optionId }));
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = assembledPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [assembledPrompt]);

  const handleSave = () => {
    const history = JSON.parse(localStorage.getItem("ps_history") || "[]");
    history.unshift({
      id: Date.now().toString(),
      name: `Prompt ${new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      prompt: assembledPrompt,
      created: new Date().toISOString(),
      action: "generated",
      generator: "Prompt Builder",
      favorite: false,
    });
    localStorage.setItem("ps_history", JSON.stringify(history.slice(0, 100)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSelections(getDefaultSelections());
    setExpandedBlock(null);
  };

  if (!selections || Object.keys(selections).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/ai-prompt-studio"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            AI Prompt Studio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
                Prompt Builder
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                Visually assemble production-grade prompts from modular building blocks
              </p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── Vehicle Context ─────────────────────────────── */}
        <section className="mb-6">
          <h2 className="section-title mb-2">Vehicle Context</h2>
          <div className="card card-elevated p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Model */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Model</label>
                <select
                  value={modelIdx}
                  onChange={(e) => setModelIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                >
                  {vehicles.map((v, i) => (
                    <option key={v.model} value={i}>{v.model}</option>
                  ))}
                </select>
              </div>
              {/* Variant */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Variant</label>
                <select
                  value={variantIdx}
                  onChange={(e) => setVariantIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                >
                  {currentVehicle.variants.map((v, i) => (
                    <option key={v.name} value={i}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Data Summary */}
            <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-neutral-400 block">OTR Price</span>
                <span className="font-semibold text-neutral-800">RM{currentVariant.otr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Monthly Rebate ({company.rebatePeriod})</span>
                <span className="font-semibold text-green-700 text-sm">-RM{(getRebate(currentVehicle.model, currentVariant.name) ?? currentVariant.rebate).toLocaleString("en-MY")}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Range</span>
                <span className="font-semibold text-neutral-800">{currentVariant.range} km</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Battery</span>
                <span className="font-semibold text-neutral-800">{currentVariant.battery} kWh</span>
              </div>
            </div>
            {/* Own Photos Toggle */}
            <label className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 cursor-pointer">
              <input
                type="checkbox"
                checked={useOwnPhotos}
                onChange={(e) => setUseOwnPhotos(e.target.checked)}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500/30 h-4 w-4"
              />
              <span className="text-xs text-neutral-600">I will provide my own vehicle photos</span>
              <span className="text-[0.55rem] text-neutral-400 ml-auto">{useOwnPhotos ? "Actual photos required" : "AI generates vehicle image"}</span>
            </label>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Block Selectors */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title mb-0">Building Blocks</h2>
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] text-neutral-400 font-medium">{totalSelected}/{blocks.length} selected</span>
                <button onClick={handleReset} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer">Reset</button>
              </div>
            </div>

            {blocks.map((block) => {
              const selected = getSelectedOption(block, selections);
              const isExpanded = expandedBlock === block.id;
              return (
                <div key={block.id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-[0.6rem] font-bold text-purple-600">{block.order}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-neutral-800 text-sm">{block.name}</h3>
                        <p className="text-[0.6rem] text-neutral-400 truncate">{selected?.name || "Select an option"}</p>
                      </div>
                    </div>
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
                      className={`text-neutral-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
                      {block.options.map((option) => {
                        const isActive = selections[block.id] === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelect(block.id, option.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                              isActive
                                ? "bg-purple-100 border border-purple-200 text-purple-700 font-medium"
                                : "bg-neutral-50 border border-neutral-100 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-200"
                            }`}
                          >
                            <span className="font-medium">{option.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right — Prompt Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title mb-0">Generated Prompt</h2>
              <span className={`text-[0.55rem] font-semibold px-1.5 py-0.5 rounded ${
                allSelected ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>
                {allSelected ? "Complete" : `${blocks.length - totalSelected} blocks remaining`}
              </span>
            </div>

            {/* Preview */}
            <div className="card p-0 overflow-hidden">
              <div className="bg-neutral-900 text-neutral-100 p-4 sm:p-5 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {assembledPrompt || (
                  <span className="text-neutral-500 italic">Select blocks on the left to build your prompt...</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCopy}
                disabled={!assembledPrompt}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    COPY PROMPT
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSave}
                  disabled={!assembledPrompt}
                  className="py-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-300 disabled:cursor-not-allowed text-neutral-600 font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saved ? (
                    <>Saved</>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Save to History
                    </>
                  )}
                </button>
                <Link
                  href={`/ai-prompt-studio/saved`}
                  className="py-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-medium text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  Saved Prompts
                </Link>
              </div>
            </div>

            {/* Selected Summary */}
            <div className="card">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Current Configuration</h3>
              <div className="space-y-1">
                {blocks.map((block) => {
                  const selected = getSelectedOption(block, selections);
                  return (
                    <div key={block.id} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">{block.name}</span>
                      <span className="text-neutral-700 font-medium truncate ml-2 text-right max-w-[60%]">{selected?.name || "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
