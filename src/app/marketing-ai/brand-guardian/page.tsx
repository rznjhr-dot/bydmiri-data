"use client";

import { useState } from "react";
import Link from "next/link";
import branding from "@/data/marketing/branding.json";
import type { BrandingData, BrandRule } from "@/types/marketing";

const typedBranding = branding as unknown as BrandingData;

const severityColors: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function BrandGuardianPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredRules: BrandRule[] =
    filterSeverity === "all"
      ? typedBranding.rules
      : typedBranding.rules.filter((r) => r.severity === filterSeverity);

  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/marketing-ai"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Marketing AI
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Brand Guardian</h1>
          <p className="text-sm text-neutral-400 mt-1">Protect BYD branding with compliance rules and automated rejection reasons</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Brand Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card">
            <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Colours</h3>
            <div className="space-y-1">
              {Object.entries(typedBranding.brandIdentity.colors).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-4 h-4 rounded border border-neutral-200"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-neutral-500 capitalize">{name}</span>
                  <span className="text-neutral-400 font-mono">{hex}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Typography</h3>
            <div className="space-y-1 text-xs text-neutral-500">
              {Object.entries(typedBranding.brandIdentity.typography).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Tone</h3>
            <div className="space-y-1 text-xs text-neutral-500">
              {Object.entries(typedBranding.brandIdentity.tone).map(([key, val]) => (
                <div key={key}>
                  <span className="text-neutral-400 capitalize">{key}: </span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Rules */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-title mb-0">Compliance Rules ({typedBranding.rules.length})</h2>
            <div className="flex gap-1">
              {["all", "critical", "high", "medium"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`text-[0.6rem] px-2 py-0.5 rounded font-medium transition-colors ${
                    filterSeverity === sev
                      ? "bg-accent text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`card py-2.5 border-l-4 ${
                  rule.severity === "critical"
                    ? "border-l-red-500"
                    : rule.severity === "high"
                    ? "border-l-amber-500"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-[0.55rem] font-semibold px-1.5 py-0.5 rounded border ${severityColors[rule.severity] ?? ""}`}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <p className="text-xs text-neutral-600 flex-1">{rule.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rejection Reasons */}
        <section>
          <h2 className="section-title">Rejection Reasons</h2>
          <div className="card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {typedBranding.rejectionReasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span className="text-danger shrink-0 mt-0.5">✕</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prompt Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">AI Prompt: Brand Guardian</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/brand-guardian.md</code> to auto-reject brand violations across all rules.
            Every AI-generated design must pass Brand Guardian review before publishing.
          </p>
        </section>
      </main>
    </div>
  );
}
