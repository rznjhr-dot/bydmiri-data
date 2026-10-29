"use client";

import { useState } from "react";
import { marketingPrompts } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

export default function PromptBuilderPage() {
  const [selectedTool, setSelectedTool] = useState(marketingPrompts.tools[0]?.id ?? "");

  const tool = marketingPrompts.tools.find((t) => t.id === selectedTool);

  return (
    <PageShell
      title="Prompt Builder"
      eyebrow="Marketing AI · Prompt Builder"
      description="Crafts precision prompts for GPT Image, Midjourney, Flux, Stable Diffusion, Veo, and Runway."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{marketingPrompts.tools.length}</div><div className="stat-label">AI Tools</div></div>
        <div className="stat"><div className="stat-value">{marketingPrompts.promptEnhancers.length}</div><div className="stat-label">Enhancer Types</div></div>
        <div className="stat"><div className="stat-value">Modular</div><div className="stat-label">Architecture</div></div>
      </div>

      <PageSection
        eyebrow="Configuration"
        title="Tool prompt"
        description="Select a tool to see where it excels, which parameters it accepts, and the prefix every prompt starts with."
      >
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5 block">AI tool</label>
          <div className="flex flex-wrap gap-1.5">
            {marketingPrompts.tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTool(t.id)}
                className={`pill ${selectedTool === t.id ? "pill-active" : ""}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {tool && (
          <div className="card border-l-2 border-l-[var(--color-figure-black)] mt-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{tool.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{tool.description}</p>
              </div>
              <span className="badge badge-gray text-[0.7rem] shrink-0">{tool.model}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Best for</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.bestFor.map((b) => (
                    <span key={b} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{b}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Parameters</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.parameters.map((p) => (
                    <span key={p} className="text-[0.7rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded">{p.replace(/_/g, " ")}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
              <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Template prefix</h4>
              <pre className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]/60 rounded-lg p-2.5 text-xs font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
                {tool.templatePrefix}
              </pre>
            </div>
          </div>
        )}
      </PageSection>

      <PageSection
        eyebrow="Modifiers"
        title="Prompt enhancers"
        description="Reusable option sets that sharpen a prompt without changing its intent."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {marketingPrompts.promptEnhancers.map((enhancer) => (
            <div key={enhancer.id} className="card">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-xs mb-1.5 uppercase tracking-wider">{enhancer.label}</h3>
              <div className="flex flex-wrap gap-1">
                {enhancer.options.map((opt) => (
                  <span key={opt} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="The builder prompt and how the prompt library is structured."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/prompt-builder.md</code> to generate optimised prompts.
          Architecture supports adding new AI tools without refactoring — just add to <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">prompts.json</code>.
        </p>
      </PageSection>
    </PageShell>
  );
}
