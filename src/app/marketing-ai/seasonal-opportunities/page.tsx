"use client";

import { useState } from "react";
import Link from "next/link";
import events from "@/data/marketing/events.json";
import type { EventsData, EventCategory } from "@/types/marketing";

const typedEvents = events as unknown as EventsData;

const seasonalSignals = [
  {
    id: "fuel_price",
    title: "Fuel Price Increase",
    description: "When fuel prices rise, promote EV cost savings",
    campaignIdea: "Switch & Save — highlight cost per km vs petrol",
    triggers: ["RON95 price increase", "Diesel subsidy changes", "Fuel price news"],
  },
  {
    id: "school_holidays",
    title: "School Holidays",
    description: "Family travel season — promote spacious EVs",
    campaignIdea: "Family Adventure Awaits — road trip ready vehicles",
    triggers: ["School term break", "Year-end holidays", "Mid-year break"],
  },
  {
    id: "rain_season",
    title: "Rain / Monsoon Season",
    description: "Highlight EV safety and all-weather performance",
    campaignIdea: "Safe In Any Weather — EV stability and safety features",
    triggers: ["Monsoon season start", "Flood warnings", "Heavy rain forecast"],
  },
  {
    id: "travel_season",
    title: "Travel Season",
    description: "Balik kampung and holiday travel promotions",
    campaignIdea: "Long Distance? No Problem — EV range and charging confidence",
    triggers: ["Holiday season", "School holidays", "Long weekends"],
  },
  {
    id: "year_end",
    title: "Year-End / Bonus Season",
    description: "Bonus spending and year-end promotions",
    campaignIdea: "Treat Yourself — year-end EV deals",
    triggers: ["December bonus", "Year-end clearance", "New year new car"],
  },
  {
    id: "roadshow",
    title: "Roadshow / Test Drive Events",
    description: "Local events and exhibition promotions",
    campaignIdea: "Experience The Future — test drive events near you",
    triggers: ["Local exhibition", "Mall roadshow", "Test drive event"],
  },
];

export default function SeasonalOpportunitiesPage() {
  const [selectedSignal, setSelectedSignal] = useState(seasonalSignals[0]?.id ?? "");

  const signal = seasonalSignals.find((s) => s.id === selectedSignal);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Seasonal Opportunity Engine</h1>
          <p className="text-sm text-neutral-400 mt-1">Monitor economic, weather, travel, and seasonal signals for marketing campaigns</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{seasonalSignals.length}</div><div className="stat-label">Signal Types</div></div>
          <div className="stat"><div className="stat-value">Real-time</div><div className="stat-label">Monitoring</div></div>
          <div className="stat"><div className="stat-value">AI-Powered</div><div className="stat-label">Suggestions</div></div>
        </div>

        {/* Signal Selector */}
        <div>
          <label className="text-sm font-semibold text-neutral-700 mb-1.5 block">Seasonal Signals</label>
          <div className="flex flex-wrap gap-1.5">
            {seasonalSignals.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSignal(s.id)}
                className={`pill ${selectedSignal === s.id ? "pill-active" : ""}`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {signal && (
          <div className="card border-l-4 border-l-accent">
            <h2 className="font-bold text-neutral-800 text-sm mb-1">{signal.title}</h2>
            <p className="text-xs text-neutral-500 mb-3">{signal.description}</p>

            <div className="card bg-accent/5 border border-accent/10 mb-3">
              <h3 className="text-xs font-semibold text-neutral-600 mb-1">Suggested Campaign</h3>
              <p className="text-sm font-medium text-accent">{signal.campaignIdea}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wider">Triggers to Monitor</h3>
              <div className="flex flex-wrap gap-1">
                {signal.triggers.map((tr) => (
                  <span key={tr} className="text-[0.6rem] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{tr}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Events Reference */}
        <section>
          <h2 className="section-title">Calendar Support</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {typedEvents.categories.map((cat) => (
              <div key={cat.id} className="card">
                <h3 className="font-semibold text-neutral-800 text-sm mb-1">{cat.label}</h3>
                <p className="text-xs text-neutral-400 mb-1.5">{cat.events.length} events</p>
                <div className="flex flex-wrap gap-1">
                  {cat.events.slice(0, 4).map((e) => (
                    <span key={e.name} className="text-[0.55rem] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{e.name}</span>
                  ))}
                  {cat.events.length > 4 && (
                    <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">+{cat.events.length - 4}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prompt Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">AI Prompt: Seasonal Opportunities</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/seasonal-opportunities.md</code> to monitor economic,
            seasonal, industry, and cultural signals — automatically suggesting marketing campaigns.
          </p>
        </section>
      </main>
    </div>
  );
}
