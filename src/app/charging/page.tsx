"use client";

import { PageSection, PageShell } from "@/components/PageShell";
import ChargingTimeEstimator from "@/components/ChargingTimeEstimator";
import { charging } from "@/data";

export default function ChargingPage() {
  return (
    <PageShell
      title="Charging"
      description="Estimate charging time and cost, then browse the station network."
      eyebrow="Energy"
      width="wide"
    >
      <ChargingTimeEstimator />

      <PageSection
        eyebrow="Network"
        title="Charging stations"
        description="Locations, charger output, and provider across Miri and nearby towns."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {charging.cities.map((city) => (
            <div
              key={city.city}
              className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50 p-3"
            >
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[var(--color-text-tertiary)]"
                  aria-hidden="true"
                >
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                {city.city}
              </h3>
              <div className="mt-2 space-y-1.5">
                {city.stations.map((station, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-[var(--color-border-primary)]/70 bg-[var(--color-bg-secondary)] px-2 py-1.5 text-xs"
                  >
                    <p className="truncate font-medium text-[var(--color-text-secondary)]">
                      {station.location}
                    </p>
                    <div className="mt-0.5 flex justify-between gap-2 text-[0.7rem] text-[var(--color-text-tertiary)]">
                      <span className="whitespace-nowrap">{station.power}</span>
                      <span className="min-w-0 truncate text-right">
                        {station.provider}
                      </span>
                    </div>
                  </div>
                ))}
                {city.stations.length === 0 && (
                  <p className="text-xs italic text-[var(--color-text-tertiary)]">
                    No charging stations listed.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          <strong className="font-semibold text-[var(--color-text-secondary)]">
            Note:
          </strong>{" "}
          {charging.disclaimer}
        </p>
      </div>
    </PageShell>
  );
}
