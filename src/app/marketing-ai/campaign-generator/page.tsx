"use client";

import { useState } from "react";
import { marketingCampaigns, marketingTimeline } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

export default function CampaignGeneratorPage() {
  const [selectedType, setSelectedType] = useState(marketingCampaigns.campaignTypes[0]?.id ?? "");

  const campaign = marketingCampaigns.campaignTypes.find((c) => c.id === selectedType);

  return (
    <PageShell
      title="Campaign Generator Engine"
      eyebrow="Marketing AI · Campaign Generator"
      description="Builds complete 18-asset campaign packages with the right format and timeline for every channel."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{marketingCampaigns.campaignTypes.length}</div><div className="stat-label">Campaign Types</div></div>
        <div className="stat"><div className="stat-value">{Object.keys(marketingCampaigns.assetFormats).length}</div><div className="stat-label">Asset Formats</div></div>
        <div className="stat"><div className="stat-value">{marketingTimeline.timelines.length}</div><div className="stat-label">Timelines</div></div>
      </div>

      <PageSection
        eyebrow="Configuration"
        title="Campaign package"
        description="Pick a campaign type to see its assets, objectives, calls to action, and default timeline."
      >
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Campaign type</label>
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
          <div className="card border-l-2 border-l-[var(--color-figure-black)] mt-4">
            <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{campaign.name}</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">{campaign.description}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Assets ({campaign.assets.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {campaign.assets.map((asset) => (
                    <span key={asset} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{asset}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Objectives</h4>
                <div className="flex flex-wrap gap-1">
                  {campaign.objectives.map((obj) => (
                    <span key={obj} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{obj.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
              <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Suggested CTAs</h4>
              <div className="flex flex-wrap gap-1">
                {campaign.suggestedCTA.map((cta) => (
                  <span key={cta} className="text-[0.7rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded font-medium">{cta}</span>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
              <div className="data-row">
                <span className="data-row-label">Default timeline</span>
                <span className="data-row-value">{campaign.defaultTimeline}</span>
              </div>
            </div>
          </div>
        )}
      </PageSection>

      {campaign && (
        <>
          <PageSection
            eyebrow="Specifications"
            title="Asset specifications"
            description="Format and channel requirements for each asset in this package."
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {campaign.assets.map((assetKey) => {
                const fmt = marketingCampaigns.assetFormats[assetKey];
                if (!fmt) return null;
                return (
                  <div key={assetKey} className="card">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
          </PageSection>

          <PageSection
            eyebrow="Timeline"
            title="Campaign timelines"
            description="Week-by-week phasing templates with their key activities."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </PageSection>
        </>
      )}

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="The generator prompt behind every campaign package."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/campaign-generator.md</code> to generate full campaign packages
          with 18 assets including poster, carousel, story, social posts, scripts, emails, and creative briefs.
        </p>
      </PageSection>
    </PageShell>
  );
}
