"use client";

import { useState } from "react";
import Link from "next/link";
import psychology from "@/data/marketing/psychology.json";
import type { PsychologyData, PsychologyPersona } from "@/types/marketing";

const typedPsychology = psychology as unknown as PsychologyData;

export default function SalesPsychologyPage() {
  const [selectedPersona, setSelectedPersona] = useState(typedPsychology.personas[0]?.id ?? "");

  const persona = typedPsychology.personas.find((p) => p.id === selectedPersona);
  const matchedStrategies = typedPsychology.strategies.filter((s) =>
    s.bestFor.includes(selectedPersona)
  );

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Sales Psychology Engine</h1>
          <p className="text-sm text-neutral-400 mt-1">Map customer personas to marketing strategy, tone, and buying triggers</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{typedPsychology.personas.length}</div><div className="stat-label">Personas</div></div>
          <div className="stat"><div className="stat-value">{typedPsychology.strategies.length}</div><div className="stat-label">Strategies</div></div>
          <div className="stat"><div className="stat-value">Psychology-Based</div><div className="stat-label">Approach</div></div>
        </div>

        {/* Persona Selector */}
        <div>
          <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Customer Persona</label>
          <div className="flex flex-wrap gap-1.5">
            {typedPsychology.personas.map((p) => (
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
          <>
            {/* Persona Detail */}
            <div className="card border-l-4 border-l-accent">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-bold text-neutral-800 text-lg">{persona.name}</h2>
                  <p className="text-sm text-neutral-500">{persona.description}</p>
                </div>
                <span className="badge badge-blue text-[0.55rem]">{persona.tone.replace(/_/g, " ")}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Priorities</h3>
                  <div className="flex flex-wrap gap-1">
                    {persona.priorities.map((pr) => (
                      <span key={pr} className="text-[0.6rem] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{pr.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Buying Triggers</h3>
                  <div className="flex flex-wrap gap-1">
                    {persona.buyingTriggers.map((tr) => (
                      <span key={tr} className="text-[0.6rem] text-accent bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded">{tr}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                <div className="data-row">
                  <span className="data-row-label">Suggested Headline</span>
                  <span className="data-row-value text-accent">"{persona.suggestedHeadline}"</span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Suggested CTA</span>
                  <span className="data-row-value">{persona.suggestedCTA}</span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Visual Direction</span>
                  <span className="data-row-value text-right max-w-[60%] text-xs">{persona.visualDirection}</span>
                </div>
              </div>
            </div>

            {/* Recommended Strategies */}
            {matchedStrategies.length > 0 && (
              <section>
                <h2 className="section-title">Recommended Strategies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchedStrategies.map((s) => (
                    <div key={s.id} className="card">
                      <h3 className="font-semibold text-neutral-800 text-sm mb-0.5">{s.name}</h3>
                      <p className="text-xs text-neutral-500">{s.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* All Personas Reference */}
        <section>
          <h2 className="section-title">All Personas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {typedPsychology.personas.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`card card-interactive text-left ${
                  selectedPersona === p.id ? "ring-2 ring-accent" : ""
                }`}
              >
                <h3 className="font-semibold text-neutral-800 text-sm mb-0.5">{p.name}</h3>
                <p className="text-[0.6rem] text-neutral-400 line-clamp-2">{p.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Prompt Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">AI Prompt: Sales Psychology</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/sales-psychology.md</code> to match customer personas
            with marketing strategies, headlines, tones, and buying triggers.
          </p>
        </section>
      </main>
    </div>
  );
}
