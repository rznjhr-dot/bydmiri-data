"use client";

import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import warranty from "@/data/warranty.json";

export default function WarrantyCard() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = useCallback(async () => {
    if (!resultsRef.current) return;
    try {
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
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title mb-0">Warranty Coverage</h2>
        <button
          type="button"
          onClick={handleScreenshot}
          className="p-1.5 rounded-md text-neutral-300 hover:text-teal-600 hover:bg-teal-50 dark:hover:text-teal-400 dark:hover:bg-teal-900/30 transition-all cursor-pointer touch-target"
          aria-label="Screenshot warranty"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      </div>
      <div
        ref={resultsRef}
        className="grid grid-cols-2 gap-1.5"
      >
        {warranty.categories.map((cat) => (
          <div
            key={cat.title}
            className="card !p-2.5 border-l-[3px] border-teal-500 flex flex-col"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 className="font-bold text-neutral-800 text-[0.7rem] sm:text-xs leading-tight">
                {cat.title}
              </h3>
              <div className="text-right shrink-0 leading-none">
                <p className="text-sm sm:text-base font-black text-teal-700 leading-tight">{cat.years}<span className="text-[0.5rem] sm:text-[0.6rem] font-bold ml-0.5">years</span></p>
                <p className="text-[0.55rem] sm:text-[0.65rem] font-semibold text-teal-500 leading-tight mt-0.5">or {cat.mileage}*</p>
              </div>
            </div>
            {cat.items.length > 0 && (
              <ul className="space-y-0">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1 text-[0.65rem] sm:text-xs text-neutral-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400 shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="text-[0.55rem] text-neutral-400 mt-1 text-right">
        {warranty.disclaimer}
      </p>
    </section>
  );
}
