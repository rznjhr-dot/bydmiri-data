"use client";

import { useState } from "react";
import { marketingEvents } from "@/data";
import type { EventCategory } from "@/types/marketing";
import { PageShell, PageSection } from "@/components/PageShell";

export default function MarketingIntelligencePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredCategories: EventCategory[] =
    activeCategory === "all"
      ? marketingEvents.categories
      : marketingEvents.categories.filter((c) => c.id === activeCategory);

  const allEvents = marketingEvents.categories.flatMap((c) => c.events);
  const totalEvents = allEvents.length;

  return (
    <PageShell
      title="Marketing Intelligence"
      eyebrow="Marketing AI · Intelligence"
      description="Marketing director view of the events, festive dates, and cultural moments worth planning around."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{totalEvents}</div><div className="stat-label">Total Events</div></div>
        <div className="stat"><div className="stat-value">{marketingEvents.categories.length}</div><div className="stat-label">Categories</div></div>
        <div className="stat"><div className="stat-value">Next 30 Days</div><div className="stat-label">Priority Window</div></div>
      </div>

      <PageSection
        eyebrow="Calendar"
        title="Opportunities"
        description="Filter the calendar by category, then open an event to see its lead time and angle."
      >
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`pill ${activeCategory === "all" ? "pill-active" : ""}`}
          >
            All Categories
          </button>
          {marketingEvents.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pill ${activeCategory === cat.id ? "pill-active" : ""}`}
            >
              {cat.label} ({cat.events.length})
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-5">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <h3 className="label text-[0.62rem] text-[var(--color-text-tertiary)]">
                {category.label}
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {category.events.map((event) => (
                  <div key={event.name} className="card border-l-2 border-l-[var(--color-figure-black)]">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{event.name}</h4>
                      <span className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded font-medium shrink-0">{event.date}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{event.opportunity}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">Lead: {event.leadTime}</span>
                      <span className="text-[0.7rem] text-[var(--color-text-tertiary)]">{event.type.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="How the intelligence director reads the calendar."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          This module uses a dedicated AI prompt at <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/marketing-intelligence.md</code>.
          The prompt instructs the AI to analyse events, suggest campaigns, recommend audiences, and define emotional direction.
        </p>
      </PageSection>
    </PageShell>
  );
}
