"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import rjeosData from "@/data/rjeos.json";
import vehiclesData from "@/data/vehicles.json";
import type { RJEOSData, RJEOSSelections, RJEOSOutputSize, RJEOSDesignDirection, RJEOSScene, RJEOSSalesAdvisor } from "@/types/rjeos";

const rjeos = rjeosData as RJEOSData;
const vehicles = vehiclesData as Array<{ model: string; variants: Array<{ name: string; otr: number; otrWithoutInsurance: number; rebate: number; range: number; battery: number; chargeCost: number; maxChargePower: string }> }>;

const defaultSelections: RJEOSSelections = {
  outputSize: "4:5",
  modelIdx: 0,
  variantIdx: 0,
  scene: "studio",
  designDirection: "luxury",
  headline: "",
  talkingPoint: "",
  showPrice: true,
  showFeatures: true,
  showCTA: false,
  showLogo: true,
  salesAdvisor: "portrait",
};

function buildConstitutionHeader(): string {
  return `╔══════════════════════════════════════════════════════╗
║                    RJEOS™                            ║
║     RIDZUAN JAHARI EDITORIAL OPERATING SYSTEM        ║
║              CONSTITUTION v${rjeos.constitution.version}                    ║
║              STATUS: ${rjeos.constitution.status}                         ║
╚══════════════════════════════════════════════════════╝`;
}

function heroName(vehicle: { model: string }, variant: { name: string }): string {
  return `${vehicle.model} ${variant.name}`;
}

function buildCampaignParameters(selections: RJEOSSelections, headline: string): string {
  const outputSize = rjeos.outputSizes.find((o) => o.id === selections.outputSize);
  const direction = rjeos.designDirections.find((d) => d.id === selections.designDirection);
  const scene = rjeos.scenes.find((s) => s.id === selections.scene);
  const advisor = rjeos.salesAdvisorModes.find((a) => a.id === selections.salesAdvisor);

  const vehicle = vehicles[selections.modelIdx];
  const variant = vehicle?.variants[selections.variantIdx];

  return `═══ CAMPAIGN PARAMETERS ═══
Output Size: ${outputSize?.name || selections.outputSize} (${outputSize?.dimensions || ""})
Vehicle: ${vehicle && variant ? heroName(vehicle, variant) : "—"}
Design Direction: ${direction?.name || selections.designDirection} — ${direction?.description || ""}
Scene: ${scene?.name || selections.scene} — ${scene?.description || ""}
Sales Advisor: ${advisor?.name || selections.salesAdvisor} — ${advisor?.description || ""}
${headline ? `Headline: "${headline}"` : "Headline: [Not set]"}
${selections.talkingPoint ? `Subtitle: ${selections.talkingPoint}` : ""}`;
}

function buildTypographyBlock(): string {
  const t = rjeos.typography;
  return `═══ TYPOGRAPHY ═══
Model Name: ${t.modelName}
Headline: ${t.headline}
Price: ${t.price}
Features: ${t.features}
Signature: ${t.signature}`;
}

function buildHierarchyBlock(): string {
  return `═══ VISUAL HIERARCHY ═══
${rjeos.hierarchy.order.map((item, i) => `${" ".repeat(i * 2)}↓ ${item}`).join("\n")}`;
}

function buildRestrictionsBlock(selections: RJEOSSelections): string {
  const parts: string[] = [];
  parts.push("═══ RESTRICTIONS ═══");
  parts.push("• AI SHALL NOT generate another vehicle");
  parts.push("• AI SHALL NOT modify body shape, wheels, mirrors, paint, headlights, taillights, or proportions");
  parts.push("• Only permitted: background removal, retouching, reflection/contrast/exposure enhancement, sharpening, ground shadow");
  parts.push("• No promotional language allowed");

  const visibleForbidden = rjeos.forbiddenWords.slice(0, 5);
  parts.push(`• Forbidden words: ${visibleForbidden.join(", ")}${rjeos.forbiddenWords.length > 5 ? "..." : ""}`);

  if (selections.salesAdvisor === "hidden" || selections.salesAdvisor === "signature") {
    parts.push("• No portrait — all portrait instructions removed");
  }
  if (selections.salesAdvisor === "hidden") {
    parts.push("• No sales advisor elements at all");
  }

  return parts.join("\n");
}

function buildCreativeBrief(selections: RJEOSSelections): string {
  const vehicle = vehicles[selections.modelIdx];
  const variant = vehicle?.variants[selections.variantIdx];
  const direction = rjeos.designDirections.find((d) => d.id === selections.designDirection);
  const scene = rjeos.scenes.find((s) => s.id === selections.scene);
  const advisor = rjeos.salesAdvisorModes.find((a) => a.id === selections.salesAdvisor);

  const brief: string[] = [];
  brief.push("═══ CREATIVE BRIEF ═══");
  brief.push("");
  brief.push(`A premium automotive editorial campaign artwork for ${vehicle?.model} ${variant?.name}.`);
  brief.push("");
  brief.push(`Design Direction: ${direction?.name || selections.designDirection}.`);
  brief.push(`${direction?.visualLanguage || ""}`);
  brief.push("");
  brief.push(`Scene: ${scene?.name || selections.scene}.`);
  brief.push(`${scene?.environmentDescription || ""}`);
  brief.push("");

  if (selections.headline) {
    brief.push(`Headline: "${selections.headline}" — ${rjeos.typography.headline}`);
  }

  brief.push("");
  brief.push("The artwork must communicate confidence before information. Luxury before promotion. Emotion before specification.");
  brief.push("Every visual element must appear intentional and premium. No clutter. No AI artefacts. No promotional language.");

  if (advisor?.id === "portrait") {
    brief.push("");
    brief.push("A professional sales advisor portrait is included, styled to match the campaign's premium aesthetic.");
  } else if (advisor?.id === "signature") {
    brief.push("");
    brief.push("Signature only: RIDZUAN JAHARI | BYD MIRI with Tracking +120.");
  }

  return brief.join("\n");
}

function buildCreativePackage(selections: RJEOSSelections): string {
  const parts: string[] = [];

  // Constitution
  parts.push(buildConstitutionHeader());

  // Core articles
  parts.push("");
  parts.push("═══ CORE ARTICLES ═══");
  for (const article of rjeos.constitution.articles) {
    if (article.number <= 3) {
      parts.push(`\nARTICLE ${String(article.number).padStart(3, "0")} — ${article.title}`);
      parts.push(article.content);
    }
  }

  // Campaign parameters
  parts.push("\n" + buildCampaignParameters(selections, selections.headline));

  // Vehicle data
  const vehicle = vehicles[selections.modelIdx];
  const variant = vehicle?.variants[selections.variantIdx];
  if (vehicle && variant) {
    parts.push(`\n═══ VEHICLE DATA ═══
Model: ${vehicle.model} ${variant.name}
OTR Price: RM${variant.otr.toLocaleString("en-MY")}
Range: ${variant.range} km
Battery: ${variant.battery} kWh
Max Charge: ${variant.maxChargePower}`);
  }

  // Typography
  parts.push("\n" + buildTypographyBlock());

  // Hierarchy
  parts.push("\n" + buildHierarchyBlock());

  // Creative brief
  parts.push("\n" + buildCreativeBrief(selections));

  // Restrictions
  parts.push("\n" + buildRestrictionsBlock(selections));

  // Show/Hide elements
  parts.push("\n═══ VISIBLE ELEMENTS ═══");
  if (selections.showLogo) parts.push("✓ BYD Logo — placed at top of visual hierarchy");
  else parts.push("✗ BYD Logo — hidden");
  if (selections.showFeatures) parts.push("✓ Features — maximum 3, listed after vehicle");
  else parts.push("✗ Features — hidden");
  if (selections.showPrice) parts.push("✓ Price — second largest text element");
  else parts.push("✗ Price — hidden");
  if (selections.showCTA) parts.push("✓ CTA — placed before signature");
  else parts.push("✗ CTA — hidden");

  // Output size
  const outputSize = rjeos.outputSizes.find((o) => o.id === selections.outputSize);
  parts.push(`\n═══ FORMAT ═══
Aspect Ratio: ${selections.outputSize} (${outputSize?.dimensions || ""})`);

  // Final objective
  parts.push(`\n═══ FINAL OBJECTIVE ═══
${rjeos.constitution.articles[14].content}`);

  return parts.join("\n");
}

function ScenarioCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all cursor-pointer ${
        selected
          ? "border-warning/60 bg-warning-subtle text-text-primary font-medium shadow-sm"
          : "border-border-primary bg-bg-secondary text-text-tertiary hover:border-border-hover hover:bg-bg-hover"
      }`}
    >
      <span className="font-medium block">{label}</span>
      <span className={`text-[0.6rem] ${selected ? "text-warning" : "text-text-tertiary"} block mt-0.5 leading-tight`}>
        {description}
      </span>
    </button>
  );
}

function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
        selected
          ? "bg-warning text-white shadow-sm"
          : "bg-bg-tertiary text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border-primary text-warning focus:ring-warning/30 h-4 w-4"
      />
      <span className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">{label}</span>
    </label>
  );
}

export default function RJEOSPage() {
  const [selections, setSelections] = useState<RJEOSSelections>(defaultSelections);
  const [copied, setCopied] = useState(false);
  const [constitutionOpen, setConstitutionOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [talkingPoint, setTalkingPoint] = useState("");

  const currentVehicle = vehicles[selections.modelIdx] || vehicles[0];
  const currentVariant = currentVehicle?.variants[selections.variantIdx] || currentVehicle?.variants[0];

  // Reset variant when model changes
  useEffect(() => {
    setSelections((prev) => ({ ...prev, variantIdx: 0 }));
  }, [selections.modelIdx]);

  const creativePackage = useMemo(
    () => buildCreativePackage({ ...selections, headline, talkingPoint }),
    [selections, headline, talkingPoint]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(creativePackage);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = creativePackage;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [creativePackage]);

  const update = <K extends keyof RJEOSSelections>(key: K, value: RJEOSSelections[K]) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  // Count articles for display
  const totalArticles = rjeos.constitution.articles.length;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero Header ─────────────────────────────── */}
      <section className="border-b border-border-primary bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white text-sm font-black tracking-tight">RJ</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  RJEOS<span className="text-warning">™</span>
                </h1>
                <span className="bg-warning-subtle text-warning text-[0.55rem] font-semibold px-2 py-0.5 rounded border border-warning/30">
                  v{rjeos.version}
                </span>
                <span className="bg-bg-tertiary text-text-tertiary text-[0.55rem] font-semibold px-2 py-0.5 rounded border border-border-primary">
                  CONSTITUTION LOCKED
                </span>
              </div>
              <p className="text-sm text-text-tertiary mt-0.5">
                Ridzuan Jahari Editorial Operating System — Premium Automotive Editorial Campaign Engine
              </p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── Constitution Reference ─────────────────── */}
        <section className="mb-6">
          <button
            onClick={() => setConstitutionOpen(!constitutionOpen)}
            className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning-subtle flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-warning"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div className="text-left">
                <h2 className="font-bold text-text-primary text-sm">RJEOS Master Constitution</h2>
                <p className="text-[0.6rem] text-text-tertiary">{totalArticles} Articles · Version {rjeos.constitution.version} · Status: {rjeos.constitution.status}</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-text-tertiary transition-transform ${constitutionOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {constitutionOpen && (
            <div className="mt-2 rounded-xl border border-border-primary bg-bg-secondary/50 divide-y divide-border-primary max-h-[60vh] overflow-y-auto">
              {rjeos.constitution.articles.map((article) => (
                <div key={article.number} className="p-3 sm:p-4">
                  <h3 className="text-xs font-bold text-warning/80 uppercase tracking-wider mb-1">
                    Article {String(article.number).padStart(3, "0")} — {article.title}
                  </h3>
                  <p className="text-[0.7rem] text-text-secondary leading-relaxed">{article.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Main Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Controls ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Campaign Controls</h2>
              <span className="text-[0.55rem] text-text-tertiary font-medium">User may ONLY modify these</span>
            </div>

            {/* Output Size */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Output Size <span className="text-warning/70">· Article 005</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {rjeos.outputSizes.map((size) => (
                  <PillButton
                    key={size.id}
                    label={`${size.name} (${size.id})`}
                    selected={selections.outputSize === size.id}
                    onClick={() => update("outputSize", size.id as RJEOSOutputSize)}
                  />
                ))}
              </div>
            </div>

            {/* Vehicle */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Vehicle <span className="text-warning/70">· Article 008</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-text-tertiary text-[0.6rem] block mb-0.5">Model</label>
                  <select
                    value={selections.modelIdx}
                    onChange={(e) => update("modelIdx", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all"
                  >
                    {vehicles.map((v, i) => (
                      <option key={v.model} value={i}>{v.model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-tertiary text-[0.6rem] block mb-0.5">Variant</label>
                  <select
                    value={selections.variantIdx}
                    onChange={(e) => update("variantIdx", Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all"
                  >
                    {currentVehicle.variants.map((v, i) => (
                      <option key={v.name} value={i}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Quick specs */}
              <div className="mt-2 grid grid-cols-3 gap-2 text-[0.6rem]">
                <div><span className="text-text-tertiary">OTR:</span> <span className="text-text-primary font-medium">RM{currentVariant.otr.toLocaleString("en-MY")}</span></div>
                <div><span className="text-text-tertiary">Range:</span> <span className="text-text-primary font-medium">{currentVariant.range} km</span></div>
                <div><span className="text-text-tertiary">Battery:</span> <span className="text-text-primary font-medium">{currentVariant.battery} kWh</span></div>
              </div>
            </div>

            {/* Scene */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Scene <span className="text-warning/70">· Article 007</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {rjeos.scenes.map((scene) => (
                  <ScenarioCard
                    key={scene.id}
                    label={scene.name}
                    description={scene.description}
                    selected={selections.scene === scene.id}
                    onClick={() => update("scene", scene.id as RJEOSScene)}
                  />
                ))}
              </div>
            </div>

            {/* Design Direction */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Design Direction <span className="text-warning/70">· Article 006</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rjeos.designDirections.map((dir) => (
                  <ScenarioCard
                    key={dir.id}
                    label={dir.name}
                    description={dir.description}
                    selected={selections.designDirection === dir.id}
                    onClick={() => update("designDirection", dir.id as RJEOSDesignDirection)}
                  />
                ))}
              </div>
            </div>

            {/* Headline */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Headline <span className="text-warning/70">· Article 004</span>
              </h3>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Enter campaign headline..."
                className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all"
              />
              <p className="text-[0.55rem] text-text-tertiary mt-1">Satoshi Medium · Tracking +20 · Sentence Case</p>
            </div>

            {/* Talking Point */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Subtitle / Talking Point <span className="text-warning/70">· Hero</span>
              </h3>
              <input
                type="text"
                value={talkingPoint}
                onChange={(e) => setTalkingPoint(e.target.value)}
                placeholder="e.g. 0-100km/h in 3.8s"
                className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning/40 transition-all"
              />
              <p className="text-[0.55rem] text-text-tertiary mt-1">Appears as subtitle below model name in hero title</p>
            </div>

            {/* Show/Hide */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Show / Hide Elements <span className="text-warning/70">· Article 004</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ToggleRow id="showLogo" label="BYD Logo" checked={selections.showLogo} onChange={(v) => update("showLogo", v)} />
                <ToggleRow id="showPrice" label="Price" checked={selections.showPrice} onChange={(v) => update("showPrice", v)} />
                <ToggleRow id="showFeatures" label="Features" checked={selections.showFeatures} onChange={(v) => update("showFeatures", v)} />
                <ToggleRow id="showCTA" label="CTA" checked={selections.showCTA} onChange={(v) => update("showCTA", v)} />
              </div>
            </div>

            {/* Sales Advisor */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Sales Advisor <span className="text-warning/70">· Article 009</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {rjeos.salesAdvisorModes.map((mode) => (
                  <ScenarioCard
                    key={mode.id}
                    label={mode.name}
                    description={mode.description}
                    selected={selections.salesAdvisor === mode.id}
                    onClick={() => update("salesAdvisor", mode.id as RJEOSSalesAdvisor)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ─── Output Panel ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Creative Package</h2>
              <span className="text-[0.55rem] text-warning/60 font-medium">Constitution injected</span>
            </div>

            {/* Creative Package Preview */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary overflow-hidden">
              <div className="bg-bg-tertiary text-text-primary p-4 sm:p-5 font-mono text-[0.65rem] leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
                {creativePackage || (
                  <span className="text-text-tertiary italic">Select campaign parameters to generate creative package...</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-warning hover:brightness-110 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-warning/20"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  COPY CREATIVE PACKAGE
                </>
              )}
            </button>

            {/* Current Config Summary */}
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-3 sm:p-4">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Current Configuration</h3>
              <div className="space-y-1">
                {[
                  { label: "Output Size", value: `${rjeos.outputSizes.find((o) => o.id === selections.outputSize)?.name || selections.outputSize} (${selections.outputSize})` },
                  { label: "Vehicle", value: `${currentVehicle.model} ${currentVariant.name}` },
                  { label: "Design Direction", value: rjeos.designDirections.find((d) => d.id === selections.designDirection)?.name || selections.designDirection },
                  { label: "Scene", value: rjeos.scenes.find((s) => s.id === selections.scene)?.name || selections.scene },
                  { label: "Sales Advisor", value: rjeos.salesAdvisorModes.find((a) => a.id === selections.salesAdvisor)?.name || selections.salesAdvisor },
                  { label: "Headline", value: headline || "—" },
                  { label: "Subtitle", value: talkingPoint || "—" },
                  { label: "BYD Logo", value: selections.showLogo ? "Visible" : "Hidden" },
                  { label: "Price", value: selections.showPrice ? "Visible" : "Hidden" },
                  { label: "Features", value: selections.showFeatures ? "Visible" : "Hidden" },
                  { label: "CTA", value: selections.showCTA ? "Visible" : "Hidden" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[0.6rem]">
                    <span className="text-text-tertiary">{item.label}</span>
                    <span className="text-text-primary font-medium truncate ml-2 text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border-primary bg-bg-primary mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-text-tertiary">
            RJEOS™ — Ridzuan Jahari Editorial Operating System v{rjeos.version}
          </p>
        </div>
      </footer>
    </div>
  );
}
