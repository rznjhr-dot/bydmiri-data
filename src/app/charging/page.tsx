"use client";

import Link from "next/link";
import ChargingTimeEstimator from "@/components/ChargingTimeEstimator";
import charging from "@/data/charging.json";

export default function ChargingPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            Charging
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
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
                <h3 className="font-bold text-neutral-800 text-sm mb-1.5 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  {city.city}
                </h3>
                <div className="space-y-1">
                  {city.stations.map((station, i) => (
                    <div key={i} className="bg-neutral-50 rounded p-1.5 text-xs">
                      <p className="font-medium text-neutral-700 truncate text-xs">{station.location}</p>
                      <div className="flex justify-between mt-0.5 text-[0.65rem] text-neutral-400">
                        <span>{station.power}</span>
                        <span>{station.provider}</span>
                      </div>
                    </div>
                  ))}
                  {city.stations.length === 0 && (
                    <p className="text-xs text-neutral-400 italic">No charging stations listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}
