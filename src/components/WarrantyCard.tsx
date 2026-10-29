"use client";

import { useRef, useCallback } from "react";
import { warranty } from "@/data";
import { PageSection } from "@/components/PageShell";

export default function WarrantyCard() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = useCallback(async () => {
    if (!resultsRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "warranty-coverage.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // silently fail
    }
  }, []);

  return (
    <PageSection
      eyebrow="Coverage"
      title="Warranty by component"
      description="Standard coverage terms across the BYD range. Download the card set as a PNG for customers."
      action={
        <button
          type="button"
          onClick={handleScreenshot}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-primary)] px-2.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] transition-colors cursor-pointer hover:border-[var(--color-figure-black)] hover:text-[var(--color-figure-black)]"
          aria-label="Download warranty coverage as PNG"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          PNG
        </button>
      }
    >
      <div ref={resultsRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {warranty.categories.map((cat) => (
          <div
            key={cat.title}
            className="flex flex-col rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
                {cat.title}
              </h3>
              <div className="shrink-0 text-right leading-none">
                <p className="display text-lg leading-none text-[var(--color-figure-black)]">
                  {cat.years}
                  <span className="ml-1 text-[0.6rem] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                    years
                  </span>
                </p>
                <p className="mt-1 text-[0.65rem] text-[var(--color-text-tertiary)]">
                  or {cat.mileage}*
                </p>
              </div>
            </div>
            {cat.items.length > 0 && (
              <ul className="mt-2.5 space-y-1">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-1.5 text-xs text-[var(--color-text-secondary)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-text-tertiary)]" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--color-text-tertiary)]">
        {warranty.disclaimer}
      </p>
    </PageSection>
  );
}
