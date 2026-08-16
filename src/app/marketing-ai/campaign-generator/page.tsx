"use client";

import { useState } from "react";
import Link from "next/link";
import { marketingCampaigns, marketingTimeline } from "@/data";

export default function CampaignGeneratorPage() {
  const [selectedType, setSelectedType] = useState(marketingCampaigns.campaignTypes[0]?.id ?? "");

  const campaign = marketingCampaigns.campaignTypes.find((c) => c.id === selectedType);

  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/marketing-ai"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Marketing AI
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Campaign Generator Engine</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Generates complete 18-asset campaign packages for every channel</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{marketingCampaigns.campaignTypes.length}</div><div className="stat-label">Campaign Types</div></div>
          <div className="stat"><div className="stat-value">{Object.keys(marketingCampaigns.assetFormats).length}</div><div className="stat-label">Asset Formats</div></div>
          <div className="stat"><div className="stat-value">{marketingTimeline.timelines.length}</div><div className="stat-label">Timelines</div></div>
        </div>

        {/* Campaign Type Selector */}
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Campaign Type</label>
          <div className="flex flex-wrap gap-1.5">
            {marketingCampaigns.campaignTypes.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setSelectedType(ct.id)}
                className={`pill ${selectedType === ct.id ? "pill-active" : ""}`}
              >
                {ct.name}
              </button>
            ))}
          </div>
        </div>

        {campaign && (
          <>
            {/* Campaign Details */}
            <div className="card border-l-4 border-l-accent">
              <h2 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{campaign.name}</h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3">{campaign.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Assets ({campaign.assets.length})</h3>
                  <div className="flex flex-wrap gap-1">
                    {campaign.assets.map((asset) => (
                      <span key={asset} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{asset}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Objectives</h3>
                  <div className="flex flex-wrap gap-1">
                    {campaign.objectives.map((obj) => (
                      <span key={obj} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{obj.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Suggested CTAs</h3>
                <div className="flex flex-wrap gap-1">
                  {campaign.suggestedCTA.map((cta) => (
                    <span key={cta} className="text-[0.7rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded font-medium">{cta}</span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
                <div className="data-row">
                  <span className="data-row-label">Default Timeline</span>
                  <span className="data-row-value">{campaign.defaultTimeline}</span>
                </div>
              </div>
            </div>

            {/* Asset Formats Reference */}
            <section>
              <h2 className="section-title">Asset Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.assets.map((assetKey) => {
                  const fmt = marketingCampaigns.assetFormats[assetKey];
                  if (!fmt) return null;
                  return (
                    <div key={assetKey} className="card">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--color-text-primary)] text-sm capitalize">{assetKey}</h3>
                        <span className="badge badge-gray text-[0.7rem]">{fmt.format ?? fmt.type}</span>
                      </div>
                      {fmt.dimensions && (
                        <p className="text-xs text-[var(--color-text-tertiary)]">{fmt.dimensions} · {fmt.platforms.join(", ")}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Timeline Templates */}
            <section>
              <h2 className="section-title">Campaign Timelines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {marketingTimeline.timelines.map((tl) => (
                  <div key={tl.id} className="card">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1">{tl.name}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{tl.description}</p>
                    <div className="space-y-1">
                      {tl.phases.map((phase) => (
                        <div key={phase.week} className="flex items-start gap-2 text-xs">
                          <span className="font-semibold text-accent shrink-0 w-16">Week {phase.week}</span>
                          <div>
                            <span className="font-medium text-[var(--color-text-secondary)]">{phase.phase}</span>
                            <p className="text-[var(--color-text-tertiary)] text-[0.7rem]">{phase.activities.join(" · ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Prompt Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-[var(--color-text-primary)] text-sm mb-2">AI Prompt: Campaign Generator</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
            Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono">src/data/prompts/campaign-generator.md</code> to generate full campaign packages
            with 18 assets including poster, carousel, story, social posts, scripts, emails, and creative briefs.
          </p>
        </section>
      </main>
    </div>
  );
}
