"use client";

import { useState } from "react";
import { marketingBranding } from "@/data";
import type { BrandRule } from "@/types/marketing";
import { PageShell, PageSection } from "@/components/PageShell";

const severityColors: Record<string, string> = {
  critical: "bg-[var(--color-figure-black)] text-white border-[var(--color-figure-black)]",
  high: "bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)]",
  medium: "bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)]",
};

const severityEdges: Record<string, string> = {
  critical: "border-l-[var(--color-figure-black)]",
  high: "border-l-[var(--color-machine-gray)]",
  medium: "border-l-[var(--color-border-primary)]",
};

export default function BrandGuardianPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredRules: BrandRule[] =
    filterSeverity === "all"
      ? marketingBranding.rules
      : marketingBranding.rules.filter((r) => r.severity === filterSeverity);

  return (
    <PageShell
      title="Brand Guardian"
      eyebrow="Marketing AI · Brand Guardian"
      description="Protects BYD branding with compliance rules and a clear list of rejection reasons."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <PageSection
        eyebrow="Identity"
        title="Brand system"
        description="The colours, typography, and tone every asset is measured against."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Colours</h3>
            <div className="space-y-1">
              {Object.entries(marketingBranding.brandIdentity.colors).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-4 h-4 shrink-0 rounded border border-[var(--color-border-primary)]"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[var(--color-text-tertiary)] capitalize">{name}</span>
                  <span className="text-[var(--color-text-tertiary)] font-mono break-all">{hex}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Typography</h3>
            <div className="space-y-1 text-xs text-[var(--color-text-tertiary)]">
              {Object.entries(marketingBranding.brandIdentity.typography).map(([key, val]) => (
                <div key={key} className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--color-text-tertiary)] capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Tone</h3>
            <div className="space-y-1 text-xs text-[var(--color-text-tertiary)]">
              {Object.entries(marketingBranding.brandIdentity.tone).map(([key, val]) => (
                <div key={key}>
                  <span className="text-[var(--color-text-tertiary)] capitalize">{key}: </span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Compliance"
        title={`Compliance rules (${marketingBranding.rules.length})`}
        description="Filter by severity. Critical rules block publishing outright."
        action={
          <div className="flex flex-wrap gap-1">
            {["all", "critical", "high", "medium"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`text-[0.7rem] px-2 py-0.5 rounded font-medium transition-colors ${
                  filterSeverity === sev
                    ? "bg-accent text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-primary)]"
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-1.5">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`card py-2.5 border-l-4 ${severityEdges[rule.severity] ?? severityEdges.medium}`}
            >
              <div className="flex items-start gap-2">
                <span className={`text-[0.7rem] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${severityColors[rule.severity] ?? ""}`}>
                  {rule.severity.toUpperCase()}
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] flex-1 min-w-0">{rule.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Enforcement"
        title="Rejection reasons"
        description="The most common grounds for sending an asset back to the creative team."
      >
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {marketingBranding.rejectionReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
              <span className="text-danger shrink-0 mt-0.5">✕</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="The review prompt that enforces every rule above."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/brand-guardian.md</code> to auto-reject brand violations across all rules.
          Every AI-generated design must pass Brand Guardian review before publishing.
        </p>
      </PageSection>
    </PageShell>
  );
}
