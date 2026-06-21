"use client";

import { useState } from "react";
import Link from "next/link";

const modules = [
  {
    id: "intelligence",
    name: "Marketing Intelligence",
    description: "Analyses events, festive calendars, and opportunities",
    status: "active",
  },
  {
    id: "campaign-generator",
    name: "Campaign Generator",
    description: "Generates complete 18-asset campaign packages",
    status: "active",
  },
  {
    id: "prompt-builder",
    name: "Prompt Builder",
    description: "Crafts precision prompts for 6 AI tools",
    status: "active",
  },
  {
    id: "creative-director",
    name: "Creative Director",
    description: "Reviews creative quality across 9 criteria",
    status: "active",
  },
  {
    id: "brand-guardian",
    name: "Brand Guardian",
    description: "Protects BYD branding with compliance rules",
    status: "active",
  },
  {
    id: "sales-psychology",
    name: "Sales Psychology",
    description: "Maps personas to marketing strategy",
    status: "active",
  },
  {
    id: "content-calendar",
    name: "Content Calendar AI",
    description: "Auto-detects celebrations and opportunities",
    status: "active",
  },
  {
    id: "seasonal-opportunities",
    name: "Seasonal Opportunities",
    description: "Monitors seasonal signals for campaigns",
    status: "active",
  },
];

const decisionFramework = [
  { step: "What", label: "Campaign type and theme", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { step: "When", label: "Timeline and posting schedule", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { step: "Why", label: "Business objective", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { step: "Who", label: "Target audience persona", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { step: "Priority", label: "Critical / High / Medium / Low", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { step: "Content Mix", label: "Asset types and platform distribution", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { step: "Frequency", label: "Posting frequency per platform", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { step: "Outcome", label: "KPIs and success metrics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

export default function MarketingBrainPage() {
  const [activeStep, setActiveStep] = useState(0);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Marketing Brain</h1>
          <p className="text-sm text-neutral-400 mt-1">Chief Marketing Officer — orchestrates all modules, decides strategy, delegates work</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Decision Framework */}
        <section>
          <h2 className="section-title">Decision Framework</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {decisionFramework.map((df, i) => (
              <button
                key={df.step}
                onClick={() => setActiveStep(i)}
                className={`card card-interactive text-center ${
                  activeStep === i ? "ring-2 ring-accent bg-accent/5" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center ${
                  activeStep === i ? "bg-accent text-white" : "bg-neutral-100 text-neutral-500"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={df.icon} /></svg>
                </div>
                <h3 className="font-semibold text-neutral-800 text-xs">{df.step}</h3>
                <p className="text-[0.55rem] text-neutral-400 mt-0.5">{df.label}</p>
              </button>
            ))}
          </div>

          {decisionFramework[activeStep] && (
            <div className="card border-l-4 border-l-accent mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-accent">{decisionFramework[activeStep].step}</span>
                <span className="text-xs text-neutral-400">—</span>
                <span className="text-sm font-medium text-neutral-700">{decisionFramework[activeStep].label}</span>
              </div>
              <p className="text-xs text-neutral-500">
                The Marketing Brain evaluates this dimension when making strategic decisions. All modules align to this framework.
              </p>
            </div>
          )}
        </section>

        {/* Module Orchestration */}
        <section>
          <h2 className="section-title">Module Orchestration</h2>
          <p className="text-xs text-neutral-500 mb-2">
            The Marketing Brain never generates content directly. It delegates to the appropriate module:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={`/marketing-ai/${mod.id}`}
                className="card card-interactive flex items-center justify-between py-2.5"
              >
                <div>
                  <h3 className="font-semibold text-neutral-800 text-sm">{mod.name}</h3>
                  <p className="text-xs text-neutral-400">{mod.description}</p>
                </div>
                <span className="text-xs text-accent font-medium">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">System Architecture</h2>
          <div className="text-xs text-neutral-500 leading-relaxed space-y-2">
            <p>
              The Marketing Brain is the CMO-level orchestrator. It <strong>analyses</strong> market conditions,
              <strong> decides</strong> campaign strategy, <strong>prioritises</strong> opportunities,
              <strong> delegates</strong> to specialised modules, and <strong>reviews</strong> outcomes.
            </p>
            <p>
              This architecture ensures each module has a single responsibility while the Brain maintains
              strategic coherence across all marketing activities.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-600 mb-1">AI Prompt</h3>
            <p className="text-xs text-neutral-500">
              Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/marketing-brain.md</code> for CMO-level orchestration.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
