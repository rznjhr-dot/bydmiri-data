"use client";

/**
 * Live JPJ "current running numbers" board.
 *
 * Production: /api/jpj-plates is a Netlify function that fetches JPJ.my
 * server-side and returns sanitized JSON. Local dev: next.config.ts rewrites
 * the same path to the raw JPJ page, which is parsed in the browser.
 */

import { useCallback, useEffect, useState } from "react";
import { PageSection } from "@/components/PageShell";
import { JPJ_PROXY_PATH, JPJ_URL } from "@/config/jpj";
import {
  isRunningNumbersData,
  parseRunningNumbers,
  type JpjRunningNumbersData,
} from "@/utils/jpjPlates";

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: JpjRunningNumbersData };

function Plate({ plate }: { plate: string }) {
  const match = plate.match(/^([A-Z]+)(\d+)([A-Z]*)$/);
  if (!match) return <span>{plate}</span>;
  return (
    <span className="font-mono text-xs tabular-nums tracking-[0.08em]">
      <span className="font-bold text-[var(--color-figure-black)]">{match[1]}</span>
      <span className="mx-0.5">{match[2]}</span>
      {match[3] && (
        <span className="font-bold text-[var(--color-figure-black)]">{match[3]}</span>
      )}
    </span>
  );
}

export default function JpjRunningNumbers() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch(`${JPJ_PROXY_PATH}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      let data: JpjRunningNumbersData | null = null;

      try {
        const json: unknown = JSON.parse(text);
        if (isRunningNumbersData(json)) data = json;
      } catch {
        // Dev proxy returns raw HTML — parse it below.
      }

      if (!data) data = parseRunningNumbers(text);
      if (!data.regions.length) throw new Error("JPJ page format changed");

      setState({ status: "ready", data });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updated =
    state.status === "ready" && state.data.updated
      ? state.data.updated.replace(" @ ", ", ")
      : "";

  return (
    <PageSection
      eyebrow="JPJ · Live data"
      title="Current running numbers"
      description={
        updated
          ? `Updated ${updated}`
          : "Latest plates published by JPJ.my"
      }
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={state.status === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-primary)] px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] transition-colors cursor-pointer hover:border-[var(--color-figure-black)] hover:text-[var(--color-figure-black)] disabled:opacity-50 disabled:cursor-wait"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={state.status === "loading" ? "animate-spin" : ""}
            >
              <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Refresh
          </button>
          <a
            href={JPJ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border-primary)] px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-figure-black)] hover:text-[var(--color-figure-black)]"
          >
            JPJ.my
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      }
      flush
    >
      {state.status === "loading" && (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-primary)]">
          {[1, 2, 3].map((col) => (
            <div key={col} className="px-5 py-4">
              <div className="mb-3 h-2 w-24 rounded bg-[var(--color-bg-tertiary)]" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="flex justify-between gap-4">
                    <div className="h-2 w-20 rounded bg-[var(--color-bg-tertiary)]" />
                    <div className="h-2 w-14 rounded bg-[var(--color-bg-tertiary)]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="px-5 py-6 sm:px-6">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Live data is unavailable right now.
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
            Check your connection or view the latest plates directly on JPJ.my.
          </p>
          <a
            href={JPJ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm underline text-[var(--color-text-tertiary)] hover:text-[var(--color-figure-black)]"
          >
            Open JPJ.my
          </a>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-primary)]">
            {state.data.regions.map((region) => (
              <div key={region.name} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
                    {region.name}
                  </p>
                  <span className="rounded-full border border-[var(--color-border-primary)] px-1.5 text-[0.58rem] font-medium text-[var(--color-text-tertiary)]">
                    {region.rows.length}
                  </span>
                </div>
                <div className="md:max-h-64 md:overflow-y-auto">
                  {region.rows.map((row) => (
                    <div
                      key={row.state}
                      className={`flex items-baseline justify-between gap-2 border-b border-dashed border-[var(--color-border-primary)]/60 py-1.5 last:border-0 ${
                        row.unavailable ? "opacity-40" : ""
                      }`}
                    >
                      <span className="text-[0.65rem] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
                        {row.state}
                      </span>
                      <Plate plate={row.plate} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-[var(--color-border-primary)] px-5 py-2.5 text-[0.58rem] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] sm:px-6">
            <span>Source · JPJ.my</span>
            <span>Rows marked * are unavailable</span>
          </div>
        </>
      )}
    </PageSection>
  );
}
