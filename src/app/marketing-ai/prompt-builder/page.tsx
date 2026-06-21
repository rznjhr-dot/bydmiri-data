"use client";

import { useState } from "react";
import Link from "next/link";
import prompts from "@/data/marketing/prompts.json";
import type { PromptsData, PromptTool } from "@/types/marketing";

const typedPrompts = prompts as unknown as PromptsData;

export default function PromptBuilderPage() {
  const [selectedTool, setSelectedTool] = useState(typedPrompts.tools[0]?.id ?? "");

  const tool = typedPrompts.tools.find((t) => t.id === selectedTool);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Prompt Builder</h1>
          <p className="text-sm text-neutral-400 mt-1">Craft precision prompts for GPT Image, Midjourney, Flux, Stable Diffusion, Veo, and Runway</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{typedPrompts.tools.length}</div><div className="stat-label">AI Tools</div></div>
          <div className="stat"><div className="stat-value">{typedPrompts.promptEnhancers.length}</div><div className="stat-label">Enhancer Types</div></div>
          <div className="stat"><div className="stat-value">Modular</div><div className="stat-label">Architecture</div></div>
        </div>

        {/* Tool Selector */}
        <div>
          <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">AI Tool</label>
          <div className="flex flex-wrap gap-1.5">
            {typedPrompts.tools.map((t) => (
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
          <>
            {/* Tool Details */}
            <div className="card border-l-4 border-l-accent">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-bold text-neutral-800 text-sm">{tool.name}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">{tool.description}</p>
                </div>
                <span className="badge badge-gray text-[0.55rem]">{tool.model}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Best For</h3>
                  <div className="flex flex-wrap gap-1">
                    {tool.bestFor.map((b) => (
                      <span key={b} className="text-[0.6rem] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{b}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Parameters</h3>
                  <div className="flex flex-wrap gap-1">
                    {tool.parameters.map((p) => (
                      <span key={p} className="text-[0.6rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded">{p.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100">
                <h3 className="text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">Template Prefix</h3>
                <pre className="bg-neutral-50 border border-neutral-200/60 rounded-lg p-2.5 text-xs font-mono text-neutral-600 whitespace-pre-wrap">
                  {tool.templatePrefix}
                </pre>
              </div>
            </div>

            {/* Prompt Enhancers */}
            <section>
              <h2 className="section-title">Prompt Enhancers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {typedPrompts.promptEnhancers.map((enhancer) => (
                  <div key={enhancer.id} className="card">
                    <h3 className="font-semibold text-neutral-800 text-xs mb-1.5 uppercase tracking-wider">{enhancer.label}</h3>
                    <div className="flex flex-wrap gap-1">
                      {enhancer.options.map((opt) => (
                        <span key={opt} className="text-[0.6rem] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{opt}</span>
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
          <h2 className="font-bold text-neutral-800 text-sm mb-2">AI Prompt: Prompt Builder</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/prompt-builder.md</code> to generate optimised prompts.
            Architecture supports adding new AI tools without refactoring — just add to <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">prompts.json</code>.
          </p>
        </section>
      </main>
    </div>
  );
}
