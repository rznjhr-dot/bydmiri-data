"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Options as Html2CanvasOptions } from "html2canvas";
import { company, vehicles, finance, promotions, pricingMeta } from "@/data";
import { formatCurrency, calcMonthlyFromPrice } from "@/utils/finance";
import { getRebate } from "@/utils/promotions";

/* Optional columns — insert between "Model" and "OTR w/ Ins." */
const OPTIONAL_COLUMNS = [
  { key: "range", label: "Range" },
  { key: "power", label: "Power" },
  { key: "roadTax", label: "Road Tax" },
  { key: "insurance", label: "Insurance" },
  { key: "battery", label: "Battery" },
] as const;

type ColumnKey = (typeof OPTIONAL_COLUMNS)[number]["key"];

function optionalCellValue(key: ColumnKey, variant: {
  range?: number;
  rangeNedc?: number;
  battery: number | null;
  motorPower?: number;
  roadTax?: number;
  otr: number;
  otrWithoutInsurance: number;
}): string {
  switch (key) {
    case "range":
      return `${(variant.rangeNedc ?? variant.range ?? 0).toLocaleString("en-MY")} km`;
    case "power":
      return variant.motorPower ? `${variant.motorPower} kW` : "—";
    case "roadTax":
      return variant.roadTax ? formatCurrency(variant.roadTax) : "—";
    case "insurance":
      return formatCurrency(variant.otr - variant.otrWithoutInsurance);
    case "battery":
      return variant.battery ? `${variant.battery} kWh` : "—";
  }
}

/* Adaptive density: total visible columns (fixed 5 + optional toggles).
 * Editorial sizing — numerals stay confident, only line-height/padding
 * breathe. Max spread is 1.5px of font so the sheet never looks
 * "accessibility mode". */
const DENSITY_STEPS = [
  { maxCols: 6, fs: "0.8125rem", headFs: "0.625rem", py: "0.5625rem", px: "0.625rem", lh: 1.35 },
  { maxCols: 7, fs: "0.78125rem", headFs: "0.625rem", py: "0.5rem", px: "0.5625rem", lh: 1.35 },
  { maxCols: 8, fs: "0.75rem", headFs: "0.6rem", py: "0.4375rem", px: "0.5rem", lh: 1.4 },
  { maxCols: 10, fs: "0.71875rem", headFs: "0.6rem", py: "0.375rem", px: "0.4375rem", lh: 1.4 },
] as const;

function densityFor(totalCols: number) {
  return DENSITY_STEPS.find((step) => totalCols <= step.maxCols) ?? DENSITY_STEPS[DENSITY_STEPS.length - 1];
}

/* Embed a pHYs chunk into a PNG so editors/printers read the intended
 * DPI. Without it PNGs carry no density info and default to 72 DPI.
 * Chunk layout: length(4) + "pHYs"(4) + xPPM(4) + yPPM(4) + unit(1) + crc32(4).
 * CRC32 validated against test vector "123456789" → 0xcbf43926. */
async function pngWithDpi(blob: Blob, dpi: number): Promise<Blob> {
  const src = new Uint8Array(await blob.arrayBuffer());
  const ppm = Math.round(dpi / 0.0254); // pixels per metre
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9); // data length
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  chunk[16] = 1; // unit specifier: metre
  // CRC over chunk type + data
  const crcInput = chunk.subarray(4, 17);
  let c = ~0;
  for (let i = 0; i < crcInput.length; i++) {
    c ^= crcInput[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  view.setUint32(17, ~c >>> 0);
  // Insert after IHDR (8-byte signature + 25-byte IHDR chunk = offset 33)
  const out = new Uint8Array(src.length + chunk.length);
  out.set(src.subarray(0, 33), 0);
  out.set(chunk, 33);
  out.set(src.subarray(33), 33 + chunk.length);
  return new Blob([out], { type: "image/png" });
}

type DownPct = 0 | 10 | "both";

const DOWN_OPTIONS: { key: DownPct; label: string }[] = [
  { key: 0, label: "0% Down" },
  { key: 10, label: "10% Down" },
  { key: "both", label: "Both" },
];

type ExportQuality = "full" | "compact";

type Orientation = "portrait" | "landscape";

const ORIENTATION_OPTIONS: { key: Orientation; label: string }[] = [
  { key: "portrait", label: "Portrait" },
  { key: "landscape", label: "Landscape" },
];

/* ─── True A4 output ───────────────────────────────────────────
 * A4 is 210 × 297 mm. For a real print sheet we render the table at a
 * comfortable logical width, then letterbox it onto an exact
 * A4-proportioned canvas at the target DPI and embed a matching pHYs
 * chunk, so the PNG prints at true A4 size and stays sharp.
 *
 *   renderW  — logical CSS px width the sheet is laid out at before
 *              scaling (kept wide enough for the densest column set).
 *   marginMm — unprinted border baked onto the sheet.
 */
const A4_MM = { w: 210, h: 297 } as const;
const PRINT_DPI = 300; // print-grade; ~2480×3508 px on A4 portrait
const PAGE_MARGIN_MM = 8;

const RENDER_WIDTH: Record<Orientation, number> = {
  portrait: 900,
  landscape: 1280,
};

/** Exact A4 pixel dimensions for a given DPI + orientation. */
function a4Pixels(orientation: Orientation, dpi: number) {
  const long = Math.round((Math.max(A4_MM.w, A4_MM.h) / 25.4) * dpi);
  const short = Math.round((Math.min(A4_MM.w, A4_MM.h) / 25.4) * dpi);
  return orientation === "landscape"
    ? { width: long, height: short }
    : { width: short, height: long };
}

export default function PricelistPage() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downPct, setDownPct] = useState<DownPct>(0);
  const [promoChoice] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [optionalCols, setOptionalCols] = useState<ColumnKey[]>([]);
  const [exportQuality, setExportQuality] = useState<ExportQuality>("full");
  const [orientation, setOrientation] = useState<Orientation>("portrait");

  /* Swap the @page size live so Print / PDF honours the chosen
   * orientation without a separate print stylesheet. The tag is removed
   * on unmount so other pages keep the default A4 portrait. */
  useEffect(() => {
    let tag = document.getElementById("pl-page-orientation") as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "pl-page-orientation";
      document.head.appendChild(tag);
    }
    tag.textContent =
      orientation === "landscape" ? "@page { size: A4 landscape; }" : "@page { size: A4 portrait; }";
    return () => {
      tag?.remove();
    };
  }, [orientation]);

  const toggleColumn = (key: ColumnKey) =>
    setOptionalCols((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );

  const showBoth = downPct === "both";
  const monthlyCols: number[] = showBoth ? [0, 10] : [downPct];

  /* 4 fixed columns + enabled optional ones + extra monthly column when Both */
  const totalCols = 4 + optionalCols.length + monthlyCols.length;
  const density = densityFor(totalCols);

  const effectiveRebate = (model: string, variantName: string, fallback: number): number => {
    const key = `${model}::${variantName}`;
    if (promoChoice[key] !== undefined) return promoChoice[key];
    return getRebate(model, variantName) ?? fallback;
  };

  const rows = useMemo(
    () =>
      vehicles.flatMap((v) =>
        v.variants.map((variant) => ({
          model: v.model,
          segment: v.segment ?? "",
          variant,
          rebate: effectiveRebate(v.model, variant.name, variant.rebate),
        }))
      ),
    [promoChoice]
  );

  const handleDownload = useCallback(async () => {
    if (!sheetRef.current) return;
    setSaving(true);
    try {
      /* Full (print): lay the sheet out at a fixed logical width, render
         it crisp, then letterbox onto an exact A4 canvas at PRINT_DPI so
         the file is a true A4 sheet (portrait 210×297mm / landscape
         297×210mm) that prints at the right size and stays sharp.
         Compact (web): 2× the CURRENT viewport — a screen asset for
         WhatsApp/Instagram, no A4 sizing or DPI tag. */
      const isFull = exportQuality === "full";
      const renderW = RENDER_WIDTH[orientation];
      const renderScale = isFull ? PRINT_DPI / 96 : Math.min(2, (window.devicePixelRatio || 1) * 1.5);
      const { default: html2canvas } = await import("html2canvas");
      const opts: Partial<Html2CanvasOptions> = {
        backgroundColor: "#ffffff",
        scale: renderScale,
        windowWidth: renderW,
      };
      const canvas = await html2canvas(sheetRef.current, opts);

      let outCanvas = canvas;
      let dpiTag: number | null = null;

      if (isFull) {
        /* Content box inside the A4 margins, in output pixels. */
        const page = a4Pixels(orientation, PRINT_DPI);
        const margin = Math.round((PAGE_MARGIN_MM / 25.4) * PRINT_DPI);
        const maxW = page.width - margin * 2;
        const maxH = page.height - margin * 2;
        const fit = Math.min(maxW / canvas.width, maxH / canvas.height);

        outCanvas = document.createElement("canvas");
        outCanvas.width = page.width;
        outCanvas.height = page.height;
        const ctx = outCanvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, page.width, page.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const drawW = canvas.width * fit;
        const drawH = canvas.height * fit;
        ctx.drawImage(
          canvas,
          (page.width - drawW) / 2,
          Math.max(margin, (page.height - drawH) / 2),
          drawW,
          drawH
        );
        dpiTag = PRINT_DPI;
      }

      const blob = await new Promise<Blob | null>((res) =>
        outCanvas.toBlob(res, "image/png")
      );
      if (!blob) throw new Error("toBlob failed");
      const finalBlob = dpiTag ? await pngWithDpi(blob, dpiTag) : blob;
      const link = document.createElement("a");
      link.download = `byd-miri-pricelist-${company.campaignVersion}-${orientation}${isFull ? "-a4-300dpi" : "-web"}.png`;
      link.href = URL.createObjectURL(finalBlob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [exportQuality, orientation]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="page-header" data-print="hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Official Pricelist
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            {company.branch} &middot; {company.rebatePeriod} campaign &middot; valid {promotions.validFrom} to {promotions.validTo}
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Controls (screen only) */}
        <div data-print="hide" className="flex flex-wrap items-center gap-2">
          {/* Down-payment segmented control: 0% / 10% / Both */}
          <div
            role="radiogroup"
            aria-label="Down payment scenario"
            className="relative inline-flex items-center p-0.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
          >
            {DOWN_OPTIONS.map((opt) => {
              const active = downPct === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDownPct(opt.key)}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    active ? "text-white" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            <span
              aria-hidden
              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--color-accent)] shadow-[var(--shadow-accent)] transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
              style={{
                width: "calc((100% - 0.5rem) / 3)",
                transform: `translateX(calc(${DOWN_OPTIONS.findIndex((o) => o.key === downPct)} * (100% + 0.25rem)))`,
              }}
            />
          </div>

          {/* Orientation: Portrait / Landscape — drives PNG + Print/PDF */}
          <div
            role="radiogroup"
            aria-label="Page orientation"
            className="relative inline-flex items-center p-0.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
          >
            {ORIENTATION_OPTIONS.map((opt) => {
              const active = orientation === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setOrientation(opt.key)}
                  className={`relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    active ? "text-white" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {opt.key === "portrait" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="1.5"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="1.5"/></svg>
                  )}
                  {opt.label}
                </button>
              );
            })}
            <span
              aria-hidden
              className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--color-accent)] shadow-[var(--shadow-accent)] transition-transform duration-[250ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
              style={{
                width: "calc((100% - 0.5rem) / 2)",
                transform: `translateX(${ORIENTATION_OPTIONS.findIndex((o) => o.key === orientation)} * (100% + 0.25rem))`,
              }}
            />
          </div>

          {/* Optional column toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            {OPTIONAL_COLUMNS.map((col) => {
              const active = optionalCols.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={`pill ${active ? "pill-active" : ""}`}
                  aria-pressed={active}
                >
                  {active && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                  {col.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print / PDF
            </button>
            {/* Export quality: A4 (exact A4 sheet @ 300 DPI) vs
                Web (current viewport, small file for social) */}
            <div
              role="radiogroup"
              aria-label="Export quality"
              className="inline-flex items-center p-0.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
            >
              {([
                { key: "full", label: "A4 · 300 DPI" },
                { key: "compact", label: "Web" },
              ] as { key: ExportQuality; label: string }[]).map((opt) => {
                const active = exportQuality === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setExportQuality(opt.key)}
                    className={`px-3 py-1 rounded-full text-[0.7rem] font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)]"
                        : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleDownload} disabled={saving} className="btn btn-primary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {saving ? "Saving..." : "PNG"}
            </button>
          </div>
        </div>

        {/* ─── Pricelist sheet ─────────────────────────────── */}
        <div
          ref={sheetRef}
          data-orientation={orientation}
          className="pl-card card card-elevated !p-5 sm:!p-8 bg-white mx-auto transition-[max-width] duration-300"
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            /* Screen preview mirrors the A4 sheet width (portrait 210mm,
               landscape 297mm), capped to the container. */
            maxWidth: orientation === "landscape" ? "min(297mm, 100%)" : "min(210mm, 100%)",
          }}
        >
          {/* Masthead */}
          <header className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b-2 border-[var(--color-text-primary)]">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {company.company}
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] mt-0.5">
                BYD Miri &mdash; Pricelist {company.rebatePeriod}
              </h2>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mt-1">
                {company.address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Sales Consultant
              </p>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">{company.salesConsultant}</p>
              <p className="text-sm font-bold text-[var(--color-accent)]">{company.phone}</p>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mt-1">
                Valid: {promotions.validFrom} &ndash; {promotions.validTo}
              </p>
            </div>
          </header>

          {/* Table — density adapts to number of visible columns */}
          <div className="mt-4 overflow-x-auto">
            <table
              className="pl-table w-full border-collapse"
              style={
                {
                  "--pl-fs": density.fs,
                  "--pl-head-fs": density.headFs,
                  "--pl-py": density.py,
                  "--pl-px": density.px,
                  "--pl-lh": density.lh,
                } as React.CSSProperties
              }
            >
              <thead>
                <tr className="border-b border-[var(--color-border-primary)]">
                  <th className="text-left font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Model / Variant
                  </th>
                  {optionalCols.map((key) => (
                    <th
                      key={key}
                      className="text-right font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]"
                    >
                      {OPTIONAL_COLUMNS.find((c) => c.key === key)?.label}
                    </th>
                  ))}
                  <th className="text-right font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    OTR w/ Ins.
                  </th>
                  <th className="text-right font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Rebate
                  </th>
                  <th className="text-right font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Effective
                  </th>
                  {monthlyCols.map((pct) => (
                    <th
                      key={pct}
                      className="text-right font-bold uppercase tracking-wider text-[var(--color-accent)]"
                    >
                      {pct}% DP
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ model, segment, variant, rebate }) => {
                  const effective = variant.otr - rebate;
                  return (
                    <tr
                      key={`${model}-${variant.name}`}
                      className="border-b border-[var(--color-border-secondary)] last:border-b-0 hover:bg-[var(--color-accent-light)]/40 transition-colors"
                    >
                      <td data-label="Model" className="pr-3">
                        <span className="font-bold tracking-[-0.01em] text-[var(--color-text-primary)]">{model}</span>{" "}
                        <span className="font-medium text-[var(--color-text-secondary)]">{variant.name}</span>
                        {segment && (
                          <span className={`pl-segment ml-1.5 ${totalCols <= 6 ? "hidden sm:inline" : ""}`}>
                            &middot; {segment}
                          </span>
                        )}
                      </td>
                      {optionalCols.map((key) => (
                        <td
                          key={key}
                          data-label={OPTIONAL_COLUMNS.find((c) => c.key === key)?.label}
                          className="text-right font-normal text-[var(--color-text-tertiary)] tabular-nums whitespace-nowrap"
                        >
                          {optionalCellValue(key, variant)}
                        </td>
                      ))}
                      <td data-label="OTR w/ Ins." className="text-right font-medium text-[var(--color-text-secondary)] tabular-nums whitespace-nowrap">
                        {formatCurrency(variant.otr)}
                      </td>
                      <td data-label="Rebate" className="text-right font-semibold text-[var(--color-success)] tabular-nums whitespace-nowrap">
                        {rebate > 0 ? `-${formatCurrency(rebate)}` : "—"}
                      </td>
                      <td data-label="Effective" className="text-right font-bold tracking-[-0.01em] text-[var(--color-text-primary)] tabular-nums whitespace-nowrap">
                        {formatCurrency(effective)}
                      </td>
                      {monthlyCols.map((pct, mi) => (
                        <td
                          key={pct}
                          data-label={`Monthly (${pct}% DP)`}
                          className={`pl-monthly text-right font-extrabold tracking-[-0.01em] text-[var(--color-accent)] tabular-nums whitespace-nowrap ${mi === 0 ? "pl-3" : ""}`}
                        >
                          {formatCurrency(calcMonthlyFromPrice(effective, pct))}/mo
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <footer className="mt-5 pt-3 border-t border-[var(--color-border-primary)] space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.7rem] font-semibold text-[var(--color-text-secondary)]">
              <span>Estimated financing rate: {finance.interestRate.toFixed(2)}% p.a.</span>
              <span className="text-[var(--color-text-tertiary)]">&middot;</span>
              <span>Tenure: {finance.defaultTenure} years</span>
              <span className="text-[var(--color-text-tertiary)]">&middot;</span>
              <span>Booking fee: RM1,000</span>
            </div>
            <p className="text-[0.65rem] leading-relaxed text-[var(--color-text-tertiary)]" style={{ textAlign: "justify", textJustify: "inter-word" }}>
              {pricingMeta.disclaimer} {promotions.notes}
            </p>
            <p className="text-[0.65rem] leading-relaxed text-[var(--color-text-tertiary)]">
              <span className="font-semibold text-[var(--color-text-secondary)]">Warranty:</span>{" "}
              6 years / 150,000 km vehicle warranty and 8 years / 160,000 km Blade Battery warranty, whichever comes first. Full warranty terms and conditions apply.
            </p>
            {/* Colophon — centered typographic lockup */}
            <div className="pt-2 mt-1 border-t border-[var(--color-border-secondary)]">
              <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center text-[0.65rem] uppercase text-[var(--color-text-tertiary)]" style={{ letterSpacing: "0.14em" }}>
                <span className="font-bold text-[var(--color-text-secondary)]">{company.salesConsultant}</span>
                <span aria-hidden className="text-[var(--color-border-primary)]">|</span>
                <span>BYD {company.company} {company.branch.replace(/^BYD\s+/i, "")}</span>
                <span aria-hidden className="text-[var(--color-border-primary)]">|</span>
                <span className="font-semibold text-[var(--color-accent)]">bydmiri.com</span>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
