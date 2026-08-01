"use client";

import Link from "next/link";
import ChargingTimeEstimator from "@/components/ChargingTimeEstimator";
import charging from "@/data/charging.json";

export default function ChargingPage() {
  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Charging
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Charging time estimator &amp; station network
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* ─── Charging Time Estimator ──── */}
        <ChargingTimeEstimator />

        {/* ─── Charging Network ──────────── */}
        <section>
          <h2 className="section-title">Charging Network</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {charging.cities.map((city) => (
              <div key={city.city} className="card card-elevated">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1.5 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  {city.city}
                </h3>
                <div className="space-y-1">
                  {city.stations.map((station, i) => (
                    <div key={i} className="bg-[var(--color-bg-tertiary)] rounded p-1.5 text-xs">
                      <p className="font-medium text-[var(--color-text-secondary)] truncate text-xs">{station.location}</p>
                      <div className="flex justify-between mt-0.5 text-[0.65rem] text-[var(--color-text-tertiary)]">
                        <span>{station.power}</span>
                        <span>{station.provider}</span>
                      </div>
                    </div>
                  ))}
                  {city.stations.length === 0 && (
                    <p className="text-xs text-[var(--color-text-tertiary)] italic">No charging stations listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Disclaimer ──────────── */}
        <section>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong className="font-semibold">Note:</strong>{" "}
              {charging.disclaimer}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}
