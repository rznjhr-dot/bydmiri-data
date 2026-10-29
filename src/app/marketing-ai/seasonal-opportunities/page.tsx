"use client";

import { useState } from "react";
import { marketingEvents } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

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
    <PageShell
      title="Seasonal Opportunity Engine"
      eyebrow="Marketing AI · Seasonal Opportunities"
      description="Monitors economic, weather, travel, and seasonal signals and turns them into campaign angles."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{seasonalSignals.length}</div><div className="stat-label">Signal Types</div></div>
        <div className="stat"><div className="stat-value">Real-time</div><div className="stat-label">Monitoring</div></div>
        <div className="stat"><div className="stat-value">AI-Powered</div><div className="stat-label">Suggestions</div></div>
      </div>

      <PageSection
        eyebrow="Signals"
        title="Seasonal signals"
        description="Select a signal to see the triggers worth monitoring and a matching campaign angle."
      >
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Seasonal signals</label>
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
          <div className="card border-l-2 border-l-[var(--color-figure-black)] mt-4">
            <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{signal.title}</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">{signal.description}</p>

            <div className="card bg-accent/5 border border-accent/10 mb-3">
              <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Suggested campaign</h4>
              <p className="text-sm font-medium text-accent">{signal.campaignIdea}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Triggers to monitor</h4>
              <div className="flex flex-wrap gap-1">
                {signal.triggers.map((tr) => (
                  <span key={tr} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{tr}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageSection>

      <PageSection
        eyebrow="Support"
        title="Calendar support"
        description="Dated events that reinforce each seasonal signal."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {marketingEvents.categories.map((cat) => (
            <div key={cat.id} className="card">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1">{cat.label}</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1.5">{cat.events.length} events</p>
              <div className="flex flex-wrap gap-1">
                {cat.events.slice(0, 4).map((e) => (
                  <span key={e.name} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">{e.name}</span>
                ))}
                {cat.events.length > 4 && (
                  <span className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">+{cat.events.length - 4}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="How the engine reads economic and seasonal signals."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/seasonal-opportunities.md</code> to monitor economic,
          seasonal, industry, and cultural signals — automatically suggesting marketing campaigns.
        </p>
      </PageSection>
    </PageShell>
  );
}
