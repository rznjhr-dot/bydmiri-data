"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import templatesData from "@/data/prompt-studio/templates.json";
import blocksData from "@/data/prompt-studio/blocks.json";
import rulesData from "@/data/prompt-studio/rules.json";
import vehiclesData from "@/data/vehicles.json";
import companyData from "@/data/company.json";
import type { GeneratorTemplate, BlocksData, RulesData, TaglineOption } from "@/types/prompt-studio";

const templates = (templatesData as { templates: GeneratorTemplate[] }).templates;
const blocks = (blocksData as BlocksData).blocks;
const promptStructure = (blocksData as BlocksData).promptStructure;
const strictRules = (rulesData as RulesData).categories.find((c) => c.id === "strict_output");
const vehicles = vehiclesData as Array<{ model: string; variants: Array<{ name: string; otr: number; otrWithoutInsurance: number; rebate: number; range: number; battery: number; chargeCost: number; maxChargePower: string }> }>;
const company = companyData as { rebatePeriod: string };

function buildDynamicVehicleBlock(model: string, variant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }): string {
  return `Vehicle: BYD ${model} ${variant.name}. OTR Price: RM${variant.otr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}. Range: ${variant.range} km. Battery: ${variant.battery} kWh. Max Charge: ${variant.maxChargePower}. Monthly Rebate (${company.rebatePeriod}): -RM${variant.rebate.toLocaleString("en-MY")}.`;
}

function buildVehicleContext(model: string, variant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }): string {
  return `═══ VEHICLE DATA CONTEXT ═══
Model: BYD ${model} ${variant.name}
OTR Price: RM${variant.otr.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly Rebate (${company.rebatePeriod}): -RM${variant.rebate.toLocaleString("en-MY")}
Range: ${variant.range} km
Battery: ${variant.battery} kWh`;
}

function buildStrictRulesHeader(useOwnPhotos: boolean): string {
  if (!strictRules) return "";
  const dos = useOwnPhotos ? strictRules.dos : strictRules.dos.filter((_, i) => i < 2);
  return `═══ STRICT RULES — MUST FOLLOW ═══\n${dos.map((d: string) => `• ${d}`).join("\n")}`;
}

function blockName(id: string): string {
  return blocks.find((b) => b.id === id)?.name || id;
}
function optionName(blockId: string, optionId: string): string {
  const block = blocks.find((b) => b.id === blockId);
  return block?.options.find((o) => o.id === optionId)?.name || optionId;
}

function getSelectedContent(selections: Record<string, string>, vehicleModel: string, vehicleVariant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }): string {
  return promptStructure
    .map((blockId) => {
      if (blockId === "vehicle") return buildDynamicVehicleBlock(vehicleModel, vehicleVariant);
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return "";
      const optionId = selections[blockId];
      const option = block.options.find((o) => o.id === optionId);
      return option?.content || "";
    })
    .filter(Boolean)
    .join("\n\n");
}

const styleBlockIds = ["editorial", "typography", "composition", "camera", "lighting", "colour", "background", "mood"];

function getInitialSelections(template: GeneratorTemplate): Record<string, string> {
  const s: Record<string, string> = {};
  for (const sel of template.blocks) s[sel.blockId] = sel.selectedOptionId;
  for (const block of blocks) {
    if (!s[block.id]) {
      const def = block.options.find((o) => o.selected);
      s[block.id] = def?.id || block.options[0]?.id || "";
    }
  }
  return s;
}

function GeneratorCard({ template, vehicleModel, vehicleVariant, useOwnPhotos }: { template: GeneratorTemplate; vehicleModel: string; vehicleVariant: { name: string; otr: number; rebate: number; range: number; battery: number; maxChargePower: string }; useOwnPhotos: boolean }) {
  const [copied, setCopied] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>(() => getInitialSelections(template));

  // Tagline state for delivery generator
  const [selectedTaglines, setSelectedTaglines] = useState<Set<string>>(() => {
    if (template.id !== "delivery" || !template.taglines) return new Set();
    return new Set(template.taglines.filter((t) => t.selected).map((t) => t.id));
  });

  const [ratio, setRatio] = useState<"1:1" | "4:5">("1:1");

  const isDelivery = template.id === "delivery";

  // Randomize style selections (not for delivery)
  const randomizeStyles = useCallback(() => {
    if (isDelivery) return;
    setSelections((prev) => {
      const next = { ...prev };
      for (const blockId of styleBlockIds) {
        const block = blocks.find((b) => b.id === blockId);
        if (block && block.options.length > 0) {
          const randomOption = block.options[Math.floor(Math.random() * block.options.length)];
          next[blockId] = randomOption.id;
        }
      }
      return next;
    });
  }, [isDelivery]);

  // Toggle tagline selection
  const toggleTagline = useCallback((taglineId: string) => {
    setSelectedTaglines((prev) => {
      const next = new Set(prev);
      if (next.has(taglineId)) next.delete(taglineId);
      else next.add(taglineId);
      return next;
    });
  }, []);

  // Build prompt based on type
  const prompt = useMemo(() => {
    if (isDelivery) {
      const taglineTexts = (template.taglines || [])
        .filter((t) => selectedTaglines.has(t.id))
        .map((t) => t.text.replace(/\{model\}/g, vehicleModel));

      return `═══ PROMPT ═══\n\n${taglineTexts.join("\n")}\n\nYour new BYD ${vehicleModel} ${vehicleVariant.name} has arrived! 🎉\n\nA proud moment at BYD Miri — another happy customer driving home in their brand new electric vehicle.\n\nThank you for choosing BYD. Welcome to the family!\n\n───\nridzuan jahari | byd miri\n\nAspect Ratio: ${ratio}`;
    }

    const body = getSelectedContent(selections, vehicleModel, vehicleVariant);
    const header = buildStrictRulesHeader(useOwnPhotos);
    return `${header}\n\n${buildVehicleContext(vehicleModel, vehicleVariant)}\n\n═══ PROMPT ═══\n\n${body}`;
  }, [isDelivery, template.taglines, selectedTaglines, vehicleModel, vehicleVariant, selections, useOwnPhotos]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-neutral-800 text-sm">{template.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{template.platform}</span>
            <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{template.aspectRatio}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {template.bestFor.slice(0, 2).map((item) => (
              <span key={item} className="text-[0.5rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline checkboxes (Delivery only) */}
      {isDelivery && template.taglines && template.taglines.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <p className="text-[0.65rem] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Taglines / Captions</p>
          <div className="space-y-1">
            {template.taglines.map((tagline) => (
              <label key={tagline.id} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTaglines.has(tagline.id)}
                  onChange={() => toggleTagline(tagline.id)}
                  className="mt-0.5 rounded border-neutral-300 text-purple-600 focus:ring-purple-500/30 h-3.5 w-3.5 shrink-0"
                />
                <span className="text-[0.6rem] text-neutral-600 group-hover:text-neutral-800 transition-colors leading-snug">
                  {tagline.text.replace(/\{model\}/g, vehicleModel)}
                </span>
              </label>
            ))}
          </div>

          {/* Ratio selection */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100">
            <p className="text-[0.65rem] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Aspect Ratio</p>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={`ratio-${template.id}`}
                  checked={ratio === "1:1"}
                  onChange={() => setRatio("1:1")}
                  className="rounded-full border-neutral-300 text-purple-600 focus:ring-purple-500/30 h-3.5 w-3.5"
                />
                <span className="text-[0.6rem] text-neutral-600 group-hover:text-neutral-800 transition-colors">1:1 Square</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={`ratio-${template.id}`}
                  checked={ratio === "4:5"}
                  onChange={() => setRatio("4:5")}
                  className="rounded-full border-neutral-300 text-purple-600 focus:ring-purple-500/30 h-3.5 w-3.5"
                />
                <span className="text-[0.6rem] text-neutral-600 group-hover:text-neutral-800 transition-colors">4:5 Portrait</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Block Configuration Summary (non-delivery only) */}
      {!isDelivery && (
        <details className="mt-2 group">
          <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700 transition-colors">Configured blocks ({template.blocks.length})</summary>
          <div className="mt-2 space-y-1 pl-1">
            {template.blocks.map((sel) => (
              <div key={sel.blockId} className="flex items-center justify-between text-[0.6rem]">
                <span className="text-neutral-400">{blockName(sel.blockId)}</span>
                <span className="text-neutral-600 font-medium">{optionName(sel.blockId, selections[sel.blockId] || sel.selectedOptionId)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Prompt Preview */}
      <div className="mt-3 bg-neutral-900 text-neutral-100 p-3 rounded-lg font-mono text-[0.6rem] leading-relaxed max-h-32 overflow-y-auto">
        {prompt ? (
          prompt.slice(0, 500) + (prompt.length > 500 ? "..." : "")
        ) : (
          <span className="text-neutral-500 italic">No prompt content</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-2">
        {/* Randomize Styles (non-delivery only) */}
        {!isDelivery && (
          <button
            onClick={randomizeStyles}
            className="py-2 px-3 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-500 font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Randomize style blocks"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            Randomize
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy Prompt
            </>
          )}
        </button>
        <Link
          href={`/ai-prompt-studio/builder`}
          className="flex-1 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-medium text-xs transition-all flex items-center justify-center gap-1.5"
        >
          Open Builder
        </Link>
      </div>
    </div>
  );
}

function GeneratorsContent() {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const [search, setSearch] = useState("");
  const [modelIdx, setModelIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [useOwnPhotos, setUseOwnPhotos] = useState(false);

  const currentVehicle = vehicles[modelIdx] || vehicles[0];
  const currentVariant = currentVehicle?.variants[variantIdx] || currentVehicle?.variants[0];

  useEffect(() => {
    setVariantIdx(0);
  }, [modelIdx]);

  const filtered = templates.filter((t) => {
    if (templateParam && t.id !== templateParam) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Generators</h1>
              <p className="text-sm text-neutral-400 mt-0.5">{templates.length} specialised prompt generators for every content format</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Vehicle Context Selector */}
        <section className="card card-elevated p-3 sm:p-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Vehicle Context</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[0.65rem] text-neutral-400 block mb-0.5">Model</label>
              <select
                value={modelIdx}
                onChange={(e) => setModelIdx(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              >
                {vehicles.map((v, i) => (
                  <option key={v.model} value={i}>{v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] text-neutral-400 block mb-0.5">Variant</label>
              <select
                value={variantIdx}
                onChange={(e) => setVariantIdx(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              >
                {currentVehicle.variants.map((v, i) => (
                  <option key={v.name} value={i}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] text-neutral-400 block mb-0.5">Monthly Rebate ({company.rebatePeriod})</label>
              <p className="text-sm font-bold text-green-700">-RM{currentVariant.rebate.toLocaleString("en-MY")}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[0.65rem] text-neutral-400 block mb-0.5">Range / Battery</label>
              <p className="text-sm font-semibold text-neutral-800">{currentVariant.range} km / {currentVariant.battery} kWh</p>
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
        </section>

        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search generators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200/60 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
          />
        </div>

        {/* Generator Info */}
        <div className="card border-l-4 border-l-purple-500 bg-purple-50/50">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Each generator comes with a pre-configured set of block selections optimised for its specific format.
            Click <strong>Copy Prompt</strong> to copy directly, or <strong>Open Builder</strong> to customise further.
            Vehicle data context (pricing, rebates, specs) is pulled directly from the knowledge base — no made-up numbers.
          </p>
        </div>

        {/* Generator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((template) => (
            <GeneratorCard key={template.id} template={template} vehicleModel={currentVehicle.model} vehicleVariant={currentVariant} useOwnPhotos={useOwnPhotos} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm text-neutral-400 text-center py-8">No generators found</div>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio</p>
        </div>
      </footer>
    </div>
  );
}

export default function GeneratorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </div>
    }>
      <GeneratorsContent />
    </Suspense>
  );
}
