"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import events from "@/data/marketing/events.json";
import schedules from "@/data/marketing/schedules.json";
import type { EventsData, SchedulesData } from "@/types/marketing";

const typedEvents = events as unknown as EventsData;
const typedSchedules = schedules as unknown as SchedulesData;

export default function ContentCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const allEvents = useMemo(() => {
    return typedEvents.categories.flatMap((cat) =>
      cat.events.map((e) => ({ ...e, category: cat.label }))
    );
  }, []);

  const monthOptions = [
    "all",
    ...Array.from(new Set(allEvents.map((e) => e.date.substring(0, 7)))).sort(),
  ];

  const filteredEvents =
    selectedMonth === "all"
      ? allEvents
      : allEvents.filter((e) => e.date.startsWith(selectedMonth));

  const today = new Date().toISOString().substring(0, 10);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Content Calendar AI</h1>
          <p className="text-sm text-neutral-400 mt-1">Auto-detect celebrations, holidays, and monthly campaign opportunities</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat"><div className="stat-value">{allEvents.length}</div><div className="stat-label">Total Events</div></div>
          <div className="stat"><div className="stat-value">{typedSchedules.platforms.length}</div><div className="stat-label">Platforms</div></div>
          <div className="stat"><div className="stat-value">{selectedMonth === "all" ? "All Time" : selectedMonth}</div><div className="stat-label">Viewing</div></div>
        </div>

        {/* Month Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedMonth("all")}
            className={`pill ${selectedMonth === "all" ? "pill-active" : ""}`}
          >
            All Months
          </button>
          {monthOptions.filter((m) => m !== "all").map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`pill ${selectedMonth === month ? "pill-active" : ""}`}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Today's Opportunities */}
        <div className="card border-l-4 border-l-accent bg-accent/5">
          <h2 className="font-bold text-neutral-800 text-sm mb-1">Today is {today}</h2>
          <p className="text-xs text-neutral-500 mb-2">
            {filteredEvents.filter((e) => e.date >= today).length} upcoming events match your filter.
          </p>
          <div className="flex flex-wrap gap-1">
            {filteredEvents.slice(0, 5).map((e) => (
              <span key={e.name} className="text-[0.6rem] text-neutral-500 bg-white border border-neutral-200/60 px-1.5 py-0.5 rounded">
                {e.name} — {e.date}
              </span>
            ))}
          </div>
        </div>

        {/* Events List */}
        <section>
          <h2 className="section-title">Events & Opportunities ({filteredEvents.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredEvents.map((event) => (
              <div
                key={`${event.name}-${event.date}`}
                className={`card border-l-4 ${
                  event.date < today
                    ? "border-l-neutral-300 opacity-60"
                    : "border-l-accent"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-neutral-800 text-sm">{event.name}</h3>
                  <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">{event.category}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-1">{event.opportunity}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] text-neutral-400">{event.date}</span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-[0.6rem] text-neutral-400">Lead: {event.leadTime}</span>
                  {event.date >= today && event.date <= getDateDaysAhead(14) && (
                    <span className="text-[0.55rem] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">URGENT</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Posting Schedules */}
        <section>
          <h2 className="section-title">Platform Posting Schedules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {typedSchedules.platforms.map((platform) => (
              <div key={platform.id} className="card">
                <h3 className="font-semibold text-neutral-800 text-sm mb-1">{platform.name}</h3>
                <p className="text-xs text-neutral-500 mb-2">{platform.recommendedFrequency}</p>
                <div className="space-y-1 mb-2">
                  {platform.bestTimes.map((time) => (
                    <div key={time} className="text-[0.6rem] text-neutral-400">⏰ {time}</div>
                  ))}
                </div>
                <div className="pt-2 border-t border-neutral-100">
                  <h4 className="text-[0.6rem] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Content Mix</h4>
                  <div className="space-y-0.5">
                    {platform.contentMix.map((mix) => (
                      <div key={mix.type} className="flex items-center justify-between text-[0.6rem]">
                        <span className="text-neutral-500 capitalize">{mix.type.replace(/_/g, " ")}</span>
                        <span className="font-medium text-neutral-600">{mix.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prompt Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">AI Prompt: Content Calendar</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/content-calendar.md</code> to detect date-based opportunities
            and recommend campaigns automatically based on today's date.
          </p>
        </section>
      </main>
    </div>
  );
}

function getDateDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().substring(0, 10);
}
