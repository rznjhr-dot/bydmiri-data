"use client";

import { useState, useMemo, useCallback } from "react";
import vehicles from "@/data/vehicles.json";
import finance from "@/data/finance.json";
import salesRules from "@/data/sales_rules.json";
import charging from "@/data/charging.json";
import company from "@/data/company.json";

type Variant = {
  name: string;
  otr: number;
  rebate: number;
  range: number;
  battery: number | null;
  chargeCost?: number;
};

const templates = [
  { id: "product", label: "Product Description", icon: "📋" },
  { id: "sales", label: "Sales Pitch", icon: "🎯" },
  { id: "social", label: "Social Media Post", icon: "📱" },
  { id: "qa", label: "Customer Q&A", icon: "💬" },
  { id: "compare", label: "Vehicle Comparison", icon: "⚖️" },
  { id: "image", label: "Image Generation", icon: "📸" },
];

const scenes = [
  { id: "showroom", label: "Showroom" },
  { id: "outdoor", label: "Outdoor" },
];

const audiences = [
  { id: "general", label: "General" },
  { id: "family", label: "Family" },
  { id: "fleet", label: "Fleet / Company" },
  { id: "first-ev", label: "First-Time EV Buyer" },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "enthusiastic", label: "Enthusiastic" },
];

export default function PromptGenerator() {
  const [template, setTemplate] = useState(templates[0].id);
  const [model1, setModel1] = useState(vehicles[0].model);
  const [variant1Idx, setVariant1Idx] = useState(0);
  const [model2, setModel2] = useState(vehicles[1]?.model ?? vehicles[0].model);
  const [variant2Idx, setVariant2Idx] = useState(0);
  const [audience, setAudience] = useState(audiences[0].id);
  const [tone, setTone] = useState(tones[0].id);
  const [scene, setScene] = useState(scenes[0].id);
  const [copied, setCopied] = useState(false);

  const vehicle1 = vehicles.find((v) => v.model === model1)!;
  const variant1: Variant = vehicle1.variants[variant1Idx];
  const vehicle2 = vehicles.find((v) => v.model === model2)!;
  const variant2: Variant = vehicle2.variants[variant2Idx];

  const rebateLine = (v: Variant) =>
    v.rebate > 0
      ? `Rebate: RM${v.rebate.toLocaleString()} (Sarawak Energy Berhad)`
      : null;

  const batteryLine = (v: Variant) =>
    v.battery ? `Battery: ${v.battery}kWh` : null;

  const chargeCostLine = (v: Variant) =>
    v.chargeCost
      ? `Full charge cost: RM${v.chargeCost.toFixed(2)} (at RM0.30/kWh)`
      : null;

  const vehicleBlock = (model: string, variant: Variant) => {
    const lines = [
      `- **Model:** ${model} ${variant.name}`,
      `- **OTR Price:** RM${variant.otr.toLocaleString()}`,
      `- **Range:** ${variant.range}km`,
      rebateLine(variant),
      batteryLine(variant),
      chargeCostLine(variant),
    ].filter(Boolean);
    return lines.join("\n");
  };

  const prompt = useMemo(() => {
    if (template === "image") {
      const vehicleDesc = `${model1} ${variant1.name}`;
      const sceneDesc =
        scene === "showroom"
          ? "inside a prestigious luxury showroom with dramatic spotlighting, polished floor reflections, minimalistic elegant backdrop"
          : "in an upscale outdoor setting at golden hour, architectural modern backdrop, subtle bokeh, premium ambience";

      return [
        `Professional automotive photograph of a BYD ${vehicleDesc}, ${sceneDesc}.`,
        `Magazine cover quality, editorial automotive photography, high-end car advertisement aesthetic.`,
        `Professional photo grading with deep contrast, rich colour grading, cinematic lighting.`,
        `1:1 square aspect ratio, medium format look, sharp focus on vehicle, depth of field.`,
        `Very light vignette, subtle darkening at edges, elegant mood, exclusive atmosphere.`,
        `Class and sophistication, premium lifestyle, luxury automotive poster, refined tones.`,
        `--ar 1:1 --style raw --v 6.1 --s 250`,
      ]
        .join(" ")
        .replace(/\s+/g, " ");
    }

    const sections: string[] = [];

    sections.push(
      "## SOURCE OF TRUTH INSTRUCTION\n" +
        "You are generating content for BYD Miri (Sarawak, Malaysia). " +
        "Use the verified data below as your single source of truth. " +
        "If there is any conflict between your training data and this information, this information overrides everything."
    );

    sections.push(
      "## SALES RULES\n" +
        "DO NOT mention: " +
        salesRules.doNotSell.join(", ") +
        ".\n" +
        "Instead, focus on: " +
        salesRules.sell.join(", ") +
        ".\n" +
        `Core philosophy: ${salesRules.ridzuanRule}`
    );

    sections.push(
      "## FINANCE CONTEXT\n" +
        `- Interest Rate: ${finance.interestRate}%\n` +
        `- Loan Margin: ${finance.loanMargin}%\n` +
        `- Available Tenures: ${finance.availableTenures.join(", ")} years`
    );

    sections.push(
      `## TARGET AUDIENCE\n${audiences.find((a) => a.id === audience)?.label}`
    );

    sections.push(
      `## TONE\n${tones.find((t) => t.id === tone)?.label}`
    );

    if (template === "compare") {
      sections.push(
        "## VEHICLE 1\n" +
          vehicleBlock(model1, variant1) +
          "\n\n## VEHICLE 2\n" +
          vehicleBlock(model2, variant2)
      );
    } else {
      sections.push("## VEHICLE DATA\n" + vehicleBlock(model1, variant1));
    }

    const nearby = charging.cities.filter((c) =>
      c.stations.some((s) => s.power.includes("DC"))
    );
    sections.push(
      "## CHARGING NETWORK (SARAWAK)\n" +
        "Available DC fast charging locations:\n" +
        nearby
          .slice(0, 4)
          .map(
            (c) =>
              `- ${c.city}: ${c.stations
                .filter((s) => s.power.includes("DC"))
                .map((s) => `${s.location} (${s.power})`)
                .join(", ")}`
          )
          .join("\n")
    );

    sections.push(
      "## COMPANY\n" +
        `${company.company} - ${company.branch}\n` +
        `Sales Consultant: ${company.salesConsultant}\n` +
        `Contact: ${company.phone}`
    );

    const templateInstructions: Record<string, string> = {
      product:
        "Write a compelling product description for this electric vehicle. " +
        "Highlight savings, comfort, technology, and family usability. " +
        "Keep it conversational and avoid technical jargon.",
      sales:
        "Write a persuasive sales pitch for this electric vehicle. " +
        "Focus on ownership experience, savings over fuel cars, and why now is the time to switch to EV. " +
        "Address common objections a Malaysian buyer might have.",
      social:
        "Write a short social media post (captions for Facebook/Instagram) promoting this electric vehicle. " +
        "Make it engaging, shareable, and suitable for a Malaysian audience. " +
        "Include 3-5 relevant hashtags.",
      qa:
        "Write a helpful answer to a customer asking about this electric vehicle. " +
        "Anticipate 3 follow-up questions they might ask and provide answers. " +
        "Be honest, reassuring, and focus on real-world usability.",
      compare:
        "Compare these two electric vehicles in a clear, helpful way. " +
        "Help the customer understand which one suits their needs better. " +
        "Consider factors like range, price, size, and family suitability. " +
        "End with a recommendation based on different use cases.",
    };

    sections.push("## TASK\n" + (templateInstructions[template] ?? ""));

    sections.push(
      "## OUTPUT REQUIREMENTS\n" +
        "- Write in English (Malaysian context)\n" +
        "- Do NOT use technical jargon (kWh, kW, Nm)\n" +
        "- Focus on benefits, not specifications\n" +
        "- Be accurate with all pricing and figures\n" +
        `- Include a clear call-to-action to contact ${company.salesConsultant} at ${company.phone}`
    );

    return sections.join("\n\n");
  }, [template, model1, variant1Idx, model2, variant2Idx, audience, tone, scene]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  return (
    <section>
      <h2 className="section-title">AI Prompt Generator</h2>
      <div className="card card-elevated space-y-1.5">
        {/* Template Pills */}
        <div className="flex flex-wrap gap-1">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`pill text-xs ${
                template === t.id ? "pill-active" : ""
              }`}
            >
              <span className="mr-0.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {/* Vehicle 1 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
              {template === "compare" ? "Vehicle 1" : "Vehicle"}
            </label>
            <select
              value={model1}
              onChange={(e) => {
                setModel1(e.target.value);
                setVariant1Idx(0);
              }}
              className="select"
            >
              {vehicles.map((v) => (
                <option key={v.model} value={v.model}>
                  {v.model}
                </option>
              ))}
            </select>
            {vehicle1.variants.length > 1 && (
              <select
                value={variant1Idx}
                onChange={(e) => setVariant1Idx(Number(e.target.value))}
                className="select mt-1"
              >
                {vehicle1.variants.map((v, i) => (
                  <option key={v.name} value={i}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vehicle 2 (comparison only) */}
          {template === "compare" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                Vehicle 2
              </label>
              <select
                value={model2}
                onChange={(e) => {
                  setModel2(e.target.value);
                  setVariant2Idx(0);
                }}
                className="select"
              >
                {vehicles.map((v) => (
                  <option key={v.model} value={v.model}>
                    {v.model}
                  </option>
                ))}
              </select>
              {vehicle2.variants.length > 1 && (
                <select
                  value={variant2Idx}
                  onChange={(e) => setVariant2Idx(Number(e.target.value))}
                  className="select mt-1.5"
                >
                  {vehicle2.variants.map((v, i) => (
                    <option key={v.name} value={i}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Scene selector for Image mode */}
        {template === "image" ? (
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
              Scene
            </label>
            <div className="flex gap-1">
              {scenes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScene(s.id)}
                  className={`pill ${scene === s.id ? "pill-active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                Target Audience
              </label>
              <div className="flex flex-wrap gap-1">
                {audiences.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAudience(a.id)}
                    className={`pill text-xs ${
                      audience === a.id ? "pill-active" : ""
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
                Tone
              </label>
              <div className="flex flex-wrap gap-1">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`pill text-xs ${
                      tone === t.id ? "pill-active" : ""
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generated Prompt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Generated Prompt
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className={`btn btn-sm ${
                copied ? "!bg-green-50 !text-green-700 !border-green-200" : "btn-secondary"
              }`}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="bg-neutral-900 text-neutral-100 rounded-lg p-1.5 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto font-mono scrollbar-thin">
            {prompt}
          </pre>
        </div>
      </div>
    </section>
  );
}
