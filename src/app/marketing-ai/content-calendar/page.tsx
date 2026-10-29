"use client";

import { useState, useMemo } from "react";
import { marketingEvents, marketingSchedules } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

export default function ContentCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const allEvents = useMemo(() => {
    return marketingEvents.categories.flatMap((cat) =>
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
    <PageShell
      title="Content Calendar AI"
      eyebrow="Marketing AI · Content Calendar"
      description="Auto-detects celebrations, holidays, and monthly campaign opportunities from today's date."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat"><div className="stat-value">{allEvents.length}</div><div className="stat-label">Total Events</div></div>
        <div className="stat"><div className="stat-value">{marketingSchedules.platforms.length}</div><div className="stat-label">Platforms</div></div>
        <div className="stat"><div className="stat-value">{selectedMonth === "all" ? "All Time" : selectedMonth}</div><div className="stat-label">Viewing</div></div>
      </div>

      <PageSection
        eyebrow="Planning"
        title="Events and opportunities"
        description="Every dated moment in the calendar, grouped by month and flagged when it is close."
      >
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

        <div className="card border-l-2 border-l-[var(--color-figure-black)] bg-accent/5 mt-4">
          <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">Today is {today}</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
            {filteredEvents.filter((e) => e.date >= today).length} upcoming events match your filter.
          </p>
          <div className="flex flex-wrap gap-1">
            {filteredEvents.slice(0, 5).map((e) => (
              <span key={e.name} className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-white border border-[var(--color-border-primary)]/60 px-1.5 py-0.5 rounded">
                {e.name} — {e.date}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <div
              key={`${event.name}-${event.date}`}
              className={`card border-l-4 ${
                event.date < today
                  ? "border-l-[var(--color-border-primary)] opacity-60"
                  : "border-l-[var(--color-figure-black)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{event.name}</h3>
                <span className="text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded font-medium shrink-0">{event.category}</span>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{event.opportunity}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.7rem] text-[var(--color-text-tertiary)]">{event.date}</span>
                <span className="text-[var(--color-text-tertiary)]">·</span>
                <span className="text-[0.7rem] text-[var(--color-text-tertiary)]">Lead: {event.leadTime}</span>
                {event.date >= today && event.date <= getDateDaysAhead(14) && (
                  <span className="text-[0.7rem] text-white bg-[var(--color-figure-black)] border border-[var(--color-figure-black)] px-1.5 py-0.5 rounded font-semibold">URGENT</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Cadence"
        title="Platform posting schedules"
        description="Recommended frequency, posting windows, and content mix for each channel."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {marketingSchedules.platforms.map((platform) => (
            <div key={platform.id} className="card">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1">{platform.name}</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{platform.recommendedFrequency}</p>
              <div className="space-y-1 mb-2">
                {platform.bestTimes.map((time) => (
                  <div key={time} className="flex items-center gap-1.5 text-[0.7rem] text-[var(--color-text-tertiary)]">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[var(--color-border-primary)]" />
                    {time}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[var(--color-border-primary)]">
                <h4 className="text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Content mix</h4>
                <div className="space-y-0.5">
                  {platform.contentMix.map((mix) => (
                    <div key={mix.type} className="flex items-center justify-between gap-2 text-[0.7rem]">
                      <span className="text-[var(--color-text-tertiary)] capitalize">{mix.type.replace(/_/g, " ")}</span>
                      <span className="font-medium text-[var(--color-text-secondary)]">{mix.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Model"
        title="AI prompt"
        description="How the calendar detects and ranks date-based opportunities."
      >
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/content-calendar.md</code> to detect date-based opportunities
          and recommend campaigns automatically based on today&apos;s date.
        </p>
      </PageSection>
    </PageShell>
  );
}

function getDateDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().substring(0, 10);
}
