"use client";

import { useState } from "react";
import Link from "next/link";
import events from "@/data/marketing/events.json";
import type { EventsData, EventCategory } from "@/types/marketing";

const typedEvents = events as unknown as EventsData;

export default function MarketingIntelligencePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredCategories: EventCategory[] =
    activeCategory === "all"
      ? typedEvents.categories
      : typedEvents.categories.filter((c) => c.id === activeCategory);

  const allEvents = typedEvents.categories.flatMap((c) => c.events);
  const totalEvents = allEvents.length;

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Marketing Intelligence</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Marketing Director — analyses events, festive calendars, and opportunities</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{totalEvents}</div><div className="stat-label">Total Events</div></div>
          <div className="stat"><div className="stat-value">{typedEvents.categories.length}</div><div className="stat-label">Categories</div></div>
          <div className="stat"><div className="stat-value">Next 30 Days</div><div className="stat-label">Priority Window</div></div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`pill ${activeCategory === "all" ? "pill-active" : ""}`}
          >
            All Categories
          </button>
          {typedEvents.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pill ${activeCategory === cat.id ? "pill-active" : ""}`}
            >
              {cat.label} ({cat.events.length})
            </button>
          ))}
        </div>

        {/* Events by Category */}
        {filteredCategories.map((category) => (
          <section key={category.id}>
            <h2 className="section-title">{category.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.events.map((event) => (
                <div key={event.name} className="card border-l-4 border-l-accent">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{event.name}</h3>
                    <span className="text-[0.6rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded font-medium">{event.date}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{event.opportunity}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">Lead: {event.leadTime}</span>
                    <span className="text-[0.6rem] text-[var(--color-text-tertiary)]">{event.type.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Intelligence Prompt */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-[var(--color-text-primary)] text-sm mb-2">AI Prompt: Marketing Intelligence Director</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
            This module uses a dedicated AI prompt at <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/marketing-intelligence.md</code>.
            The prompt instructs the AI to analyse events, suggest campaigns, recommend audiences, and define emotional direction.
          </p>
        </section>
      </main>
    </div>
  );
}
