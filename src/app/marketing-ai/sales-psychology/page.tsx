"use client";

import { useState } from "react";
import { marketingPsychology } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

export default function SalesPsychologyPage() {
  const [selectedPersona, setSelectedPersona] = useState(marketingPsychology.personas[0]?.id ?? "");

  const persona = marketingPsychology.personas.find((p) => p.id === selectedPersona);
  const matchedStrategies = marketingPsychology.strategies.filter((s) =>
    s.bestFor.includes(selectedPersona)
  );

  return (
    <PageShell
      title="Sales Psychology Engine"
      eyebrow="Marketing AI · Sales Psychology"
      description="Maps each customer persona to the strategy, tone, and buying triggers that move them."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{marketingPsychology.personas.length}</div><div className="stat-label">Personas</div></div>
        <div className="stat"><div className="stat-value">{marketingPsychology.strategies.length}</div><div className="stat-label">Strategies</div></div>
        <div className="stat"><div className="stat-value">Psychology-Based</div><div className="stat-label">Approach</div></div>
      </div>

      <PageSection
        eyebrow="Personas"
        title="Customer persona"
        description="Select a persona to see its priorities, triggers, and suggested message."
      >
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Customer persona</label>
          <div className="flex flex-wrap gap-1.5">
            {marketingPsychology.personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`pill ${selectedPersona === p.id ? "pill-active" : ""}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {persona && (
          <div className="card border-l-2 border-l-[var(--color-figure-black)] mt-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--color-text-primary)] text-lg">{persona.name}</h3>
                <p className="text-sm text-[var(--color-text-tertiary)]">{persona.description}</p>
              </div>
              <span className="badge badge-blue text-[0.7rem] shrink-0">{persona.tone.replace(/_/g, " ")}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Priorities</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.priorities.map((pr) => (
                    <span key={pr} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{pr.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Buying triggers</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.buyingTriggers.map((tr) => (
                    <span key={tr} className="text-[0.7rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded">{tr}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] space-y-2">
              <div className="data-row">
                <span className="data-row-label">Suggested headline</span>
                <span className="data-row-value text-accent text-right">&quot;{persona.suggestedHeadline}&quot;</span>
              </div>
              <div className="data-row">
                <span className="data-row-label">Suggested CTA</span>
                <span className="data-row-value text-right">{persona.suggestedCTA}</span>
              </div>
              <div className="data-row">
                <span className="data-row-label">Visual direction</span>
                <span className="data-row-value text-right max-w-[60%] text-xs">{persona.visualDirection}</span>
              </div>
            </div>
          </div>
        )}
      </PageSection>

      {matchedStrategies.length > 0 && (
        <PageSection
          eyebrow="Recommendations"
          title="Recommended strategies"
          description="Strategy patterns that fit the selected persona."
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {matchedStrategies.map((s) => (
              <div key={s.id} className="card">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-0.5">{s.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">{s.description}</p>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      <PageSection
        eyebrow="Directory"
        title="All personas"
        description="Jump to any persona in the engine."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {marketingPsychology.personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`card card-interactive text-left ${
                selectedPersona === p.id ? "ring-2 ring-accent" : ""
              }`}
            >
              <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-0.5">{p.name}</h3>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] line-clamp-2">{p.description}</p>
            </button>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="The persona-matching prompt used by this module."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/sales-psychology.md</code> to match customer personas
          with marketing strategies, headlines, tones, and buying triggers.
        </p>
      </PageSection>
    </PageShell>
  );
}
