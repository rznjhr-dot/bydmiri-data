"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import vehiclesRaw from "@/data/vehicles.json";
import promotionsRaw from "@/data/promotions.json";
import finance from "@/data/finance.json";

/* ─── Types ─────────────────────────────────────────────────── */

type FieldKey = "otr" | "rebate" | "promotion";

type VehicleVariant = Record<string, unknown> & { name?: string };
type VehicleModel = { model: string; segment?: string; variants: VehicleVariant[] };
type VehiclesFile = VehicleModel[];

type PromotionsFile = {
  [key: string]: unknown;
  rebates?: Record<string, Record<string, number>>;
  variantPromotions?: Record<string, Record<string, string[]>>;
};

interface RowState {
  model: string;
  variant: string;
  otr: number;
  rebate: number;
  promo: string[];
  otrInput: string;
  rebateInput: string;
  promoInput: string;
  noChange: Record<FieldKey, boolean>;
}

interface ChangeItem {
  key: string;
  model: string;
  variant: string;
  field: FieldKey;
  label: string;
  oldText: string;
  newText: string;
  promoAdded: string[];
  promoRemoved: string[];
}

/* ─── Helpers ───────────────────────────────────────────────── */

const vehicles = vehiclesRaw as unknown as VehiclesFile;
const promotions = promotionsRaw as unknown as PromotionsFile;

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calcMonthly(effectivePrice: number): number {
  const rate = finance.interestRate / 100;
  const tenure = finance.defaultTenure;
  const loan = effectivePrice * (finance.loanMargin / 100);
  const totalInterest = loan * rate * tenure;
  return (loan + totalInterest) / (tenure * 12);
}

function parseNum(s: string): number | null {
  const t = s.trim().replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function parseLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean);
}

function linesEqual(a: string[], b: string[]): boolean {
  const norm = (arr: string[]) => [...arr].sort().join("\n");
  return norm(a) === norm(b);
}

function slug(s: string): string {
  return s.replace(/\s+/g, "-").toLowerCase();
}

function fieldKey(model: string, variant: string, field: FieldKey): string {
  return `change-${slug(model)}-${slug(variant)}-${field}`;
}

function buildRows(): RowState[] {
  const vp = (promotions.variantPromotions ?? {}) as Record<
    string,
    Record<string, string[]>
  >;
  const rows: RowState[] = [];
  for (const m of vehicles) {
    for (const v of m.variants) {
      const name = String(v.name ?? "");
      const otr = typeof v.otr === "number" ? v.otr : 0;
      const rebate = typeof v.rebate === "number" ? v.rebate : 0;
      const promo = vp[m.model]?.[name] ?? [];
      rows.push({
        model: m.model,
        variant: name,
        otr,
        rebate,
        promo,
        otrInput: String(otr),
        rebateInput: String(rebate),
        promoInput: promo.join("\n"),
        noChange: { otr: true, rebate: true, promotion: true },
      });
    }
  }
  return rows;
}

function detectChanges(rows: RowState[]): ChangeItem[] {
  const list: ChangeItem[] = [];
  for (const r of rows) {
    const otr = parseNum(r.otrInput);
    if (!r.noChange.otr && otr !== null && otr !== r.otr) {
      list.push({
        key: fieldKey(r.model, r.variant, "otr"),
        model: r.model,
        variant: r.variant,
        field: "otr",
        label: "OTR",
        oldText: fmt(r.otr),
        newText: fmt(otr),
        promoAdded: [],
        promoRemoved: [],
      });
    }
    const rebate = parseNum(r.rebateInput);
    if (!r.noChange.rebate && rebate !== null && rebate !== r.rebate) {
      list.push({
        key: fieldKey(r.model, r.variant, "rebate"),
        model: r.model,
        variant: r.variant,
        field: "rebate",
        label: "Rebate",
        oldText: fmt(r.rebate),
        newText: fmt(rebate),
        promoAdded: [],
        promoRemoved: [],
      });
    }
    if (!r.noChange.promotion) {
      const newLines = parseLines(r.promoInput);
      if (!linesEqual(r.promo, newLines)) {
        list.push({
          key: fieldKey(r.model, r.variant, "promotion"),
          model: r.model,
          variant: r.variant,
          field: "promotion",
          label: "Promotion",
          oldText: r.promo.map((p) => `• ${p}`).join("\n") || "—",
          newText: newLines.map((p) => `• ${p}`).join("\n") || "—",
          promoAdded: newLines.filter((x) => !r.promo.includes(x)),
          promoRemoved: r.promo.filter((x) => !newLines.includes(x)),
        });
      }
    }
  }
  return list;
}

function buildPreviewText(changes: ChangeItem[]): string {
  const parts: string[] = ["===================================="];
  changes.forEach((c) => {
    parts.push(
      `${c.model.toUpperCase()} ${c.variant.toUpperCase()}`,
      c.label,
      c.oldText,
      "↓",
      c.newText
    );
    if (c.field === "promotion") {
      parts.pop(); // drop newText duplicate — promotion uses Added/Removed
      parts.push("Added:");
      if (c.promoAdded.length) parts.push(...c.promoAdded.map((p) => `• ${p}`));
      else parts.push("(none)");
      parts.push("Removed:");
      if (c.promoRemoved.length) parts.push(...c.promoRemoved.map((p) => `• ${p}`));
      else parts.push("(none)");
    }
    parts.push("------------------------------------");
  });
  parts.pop(); // remove trailing separator
  parts.push("====================================");
  return parts.join("\n");
}

function buildPromptText(changes: ChangeItem[]): string {
  const blocks: string[] = [];
  for (const c of changes) {
    const lines = [`${c.model.toUpperCase()} ${c.variant.toUpperCase()}`];
    if (c.field === "promotion") {
      lines.push("- Promotion:");
      c.promoRemoved.forEach((p) => lines.push(`Remove: ${p}`));
      c.promoAdded.forEach((p) => lines.push(`Add: ${p}`));
    } else {
      lines.push(`- ${c.label}:`, `${c.oldText} → ${c.newText}`);
    }
    blocks.push(lines.join("\n"));
  }
  return [
    "Update the BYD database.",
    "",
    "Only modify the following:",
    "",
    blocks.join("\n\n"),
    "",
    "Do not modify any other model.",
    "Return the updated database only.",
    "",
    "Include ONLY modified fields.",
  ].join("\n");
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

/* ─── Sub-components ────────────────────────────────────────── */

function NoChangeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
        checked
          ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-border-primary)]"
          : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 shadow-sm"
      }`}
    >
      {checked ? (
        <>
          <span className="w-3 h-3 rounded-full bg-neutral-400 text-white flex items-center justify-center text-[0.5rem] leading-none">✓</span>
          No Changes
        </>
      ) : (
        <>
          <span className="w-3 h-3 rounded-full bg-amber-500 text-white flex items-center justify-center text-[0.5rem] leading-none">✎</span>
          Editing
        </>
      )}
    </button>
  );
}

function CurrentChip({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 font-mono text-[0.7rem] border ${
        muted
          ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] border-[var(--color-border-primary)]"
          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)]"
      }`}
    >
      {value}
    </span>
  );
}

function FieldRow({
  id,
  label,
  current,
  inputValue,
  disabled,
  changed,
  onChange,
  onNoChange,
}: {
  id: string;
  label: string;
  current: string;
  inputValue: string;
  disabled: boolean;
  changed: boolean;
  onChange: (v: string) => void;
  onNoChange: (v: boolean) => void;
}) {
  return (
    <div
      id={id}
      className={`grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_180px_auto] gap-x-4 gap-y-1.5 items-center py-2.5 border-b border-[var(--color-border-primary)]/70 last:border-0 scroll-mt-36 ${
        changed
          ? "bg-amber-50/60 -mx-3 px-3 border-l-4 border-l-amber-400 rounded-r-xl"
          : "px-1"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
          {label}
        </p>
        {changed && (
          <span className="badge badge-amber !text-[0.55rem] !px-1.5 !py-0">
            CHANGED
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <p className={`text-[0.65rem] shrink-0 ${disabled ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-tertiary)]"}`}>
          Current
        </p>
        <CurrentChip value={current} muted={disabled} />
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={inputValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "—" : "New value"}
        className={`input !py-2 !text-sm font-mono ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
      />
      <NoChangeToggle checked={disabled} onChange={onNoChange} />
    </div>
  );
}

function PromoRow({
  id,
  currentLines,
  inputValue,
  disabled,
  changed,
  onChange,
  onNoChange,
}: {
  id: string;
  currentLines: string[];
  inputValue: string;
  disabled: boolean;
  changed: boolean;
  onChange: (v: string) => void;
  onNoChange: (v: boolean) => void;
}) {
  return (
    <div
      id={id}
      className={`grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_180px_auto] gap-x-4 gap-y-1.5 items-start py-2.5 scroll-mt-36 ${
        changed
          ? "bg-amber-50/60 -mx-3 px-3 border-l-4 border-l-amber-400 rounded-r-xl"
          : "px-1"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
          Promotion
        </p>
        {changed && (
          <span className="badge badge-amber !text-[0.55rem] !px-1.5 !py-0">
            CHANGED
          </span>
        )}
      </div>
      <div className={disabled ? "opacity-60" : ""}>
        <p className="text-[0.65rem] text-[var(--color-text-tertiary)] mb-0.5">Current</p>
        {currentLines.length > 0 ? (
          <ul className="space-y-0.5">
            {currentLines.map((p) => (
              <li key={p} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                <span className="text-accent">•</span>
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)] italic">— none —</p>
        )}
      </div>
      <textarea
        rows={3}
        value={inputValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "—" : "One item per line, e.g.\nReady Stock\nFree Wallbox"}
        className={`input !py-2 !text-sm resize-y min-h-[4.5rem] ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
      />
      <NoChangeToggle checked={disabled} onChange={onNoChange} />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function AdminPage() {
  const [rows, setRows] = useState<RowState[]>(() => buildRows());
  const [modal, setModal] = useState<"preview" | "prompt" | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changes = useMemo(() => detectChanges(rows), [rows]);
  const totalVariants = vehicles.reduce((n, m) => n + m.variants.length, 0);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const updateRow = (index: number, patch: Partial<RowState>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const setNoChange = (index: number, field: FieldKey, checked: boolean) =>
    updateRow(index, {
      noChange: { ...rows[index].noChange, [field]: checked },
    });

  const resetAll = () => {
    setRows(buildRows());
    showToast("All edits reset");
  };

  const scrollToFirstChange = () => {
    if (changes.length === 0) return;
    document
      .getElementById(changes[0].key)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const applyUpdates = () => {
    if (changes.length === 0) {
      showToast("No changes detected", "error");
      return;
    }
    const vFile = JSON.parse(JSON.stringify(vehiclesRaw)) as VehiclesFile;
    const pFile = JSON.parse(JSON.stringify(promotionsRaw)) as PromotionsFile;
    const existing = pFile.variantPromotions;
    const variantPromotions: Record<string, Record<string, string[]>> = existing
      ? (JSON.parse(JSON.stringify(existing)) as Record<string, Record<string, string[]>>)
      : {};
    let promoChanged = false;

    for (const r of rows) {
      const model = vFile.find((m) => m.model === r.model);
      if (!model) continue;
      const variant = model.variants.find((v) => v.name === r.variant);
      if (!variant) continue;

      const otr = parseNum(r.otrInput);
      if (!r.noChange.otr && otr !== null && otr !== r.otr) {
        variant.otr = otr;
      }
      const rebate = parseNum(r.rebateInput);
      if (!r.noChange.rebate && rebate !== null && rebate !== r.rebate) {
        variant.rebate = rebate;
        if (pFile.rebates?.[r.model]) {
          pFile.rebates[r.model][r.variant] = rebate;
        }
      }
      if (!r.noChange.promotion) {
        const newLines = parseLines(r.promoInput);
        if (!linesEqual(r.promo, newLines)) {
          promoChanged = true;
          variantPromotions[r.model] = {
            ...(variantPromotions[r.model] ?? {}),
            [r.variant]: newLines,
          };
        }
      }
    }

    if (promoChanged) pFile.variantPromotions = variantPromotions;

    downloadJSON(vFile, "vehicles.json");
    downloadJSON(pFile, "promotions.json");
    showToast(
      `Applied ${changes.length} change(s) — downloaded vehicles.json + promotions.json. Replace files in src/data/ and public/data/, then rebuild.`
    );
  };

  const previewText = useMemo(() => buildPreviewText(changes), [changes]);
  const promptText = useMemo(() => buildPromptText(changes), [changes]);

  const copyPrompt = async () => {
    const ok = await copyText(promptText);
    showToast(ok ? "Update prompt copied to clipboard" : "Copy failed", ok ? "success" : "error");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              BYD Database Admin
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="badge badge-blue">{vehicles.length} Models</span>
              <span className="badge badge-blue">{totalVariants} Variants</span>
              {changes.length > 0 ? (
                <span className="badge badge-amber">
                  {changes.length} Change{changes.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="badge badge-green">All up to date</span>
              )}
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Smart Update Mode — update only the fields that changed this month. Everything else stays untouched.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* How it works */}
        <div className="card bg-accent/5 border border-accent/10 mb-4 !p-3">
          <p className="text-xs text-[var(--color-text-secondary)]  leading-relaxed">
            <strong className="text-[var(--color-text-primary)] ">How it works:</strong>{" "}
            Every field starts with <strong>✓ No Changes</strong> — leave them alone. Switch a field to <strong>✎ Editing</strong> if you need
            to update, enter the new value, then <strong>Preview Changes</strong> →{" "}
            <strong>Apply Updates</strong> (downloads the updated <code className="font-mono text-[0.7rem]">vehicles.json</code> +{" "}
            <code className="font-mono text-[0.7rem]">promotions.json</code>). Replace the files in{" "}
            <code className="font-mono text-[0.7rem]">src/data/</code> and{" "}
            <code className="font-mono text-[0.7rem]">public/data/</code>, then rebuild. If the new value equals the current
            value, it is automatically treated as no change. <strong>Monthly (9 Years)</strong> is derived from OTR &amp; Rebate
            (10% down · 2.30% · 9 yrs) and recalculates automatically — no manual edit needed.
          </p>
        </div>

        {/* Sticky action bar */}
        <div className="sticky top-14 sm:top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 mb-4 bg-[var(--color-bg-secondary)]/95 backdrop-blur border-b border-[var(--color-border-primary)]/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={scrollToFirstChange}
              disabled={changes.length === 0}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                changes.length > 0
                  ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200   "
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] border border-[var(--color-border-primary)] cursor-not-allowed"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Changes Detected: {changes.length}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setModal("preview")}
              disabled={changes.length === 0}
              className="btn btn-secondary btn-sm"
            >
              Preview Changes
            </button>
            <button
              onClick={applyUpdates}
              disabled={changes.length === 0}
              className={`btn btn-sm ${changes.length > 0 ? "btn-primary" : "opacity-40 cursor-not-allowed"}`}
            >
              Apply Updates
            </button>
            <button
              onClick={() => setModal("prompt")}
              disabled={changes.length === 0}
              className={`btn btn-sm ${changes.length > 0 ? "btn-primary" : "opacity-40 cursor-not-allowed"}`}
            >
              Generate Update Prompt
            </button>
            <button onClick={resetAll} className="btn btn-ghost btn-sm">
              Reset
            </button>
          </div>
        </div>

        {/* Model sections */}
        {vehicles.map((m) => {
          const modelRows = rows.filter((r) => r.model === m.model);
          if (modelRows.length === 0) return null;
          const modelChangeCount = modelRows.reduce(
            (n, r) => n + changes.filter((c) => c.model === r.model && c.variant === r.variant).length,
            0
          );
          return (
            <section key={m.model} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-4 rounded-full bg-accent" />
                <h2 className="section-title text-base !mb-0">{m.model}</h2>
                {modelChangeCount > 0 && (
                  <span className="badge badge-amber !text-[0.6rem] !px-2 !py-0">
                    {modelChangeCount} change{modelChangeCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {modelRows.map((r) => {
                  const rowIndex = rows.findIndex((x) => x === r);
                  const otrParsed = parseNum(r.otrInput);
                  const rebateParsed = parseNum(r.rebateInput);
                  const effNew = Math.max(
                    (otrParsed ?? r.otr) - (rebateParsed ?? r.rebate),
                    0
                  );
                  const monthlyNew = calcMonthly(effNew);
                  const rowChanges = changes.filter(
                    (c) => c.model === r.model && c.variant === r.variant
                  );
                  const isOtrChanged = rowChanges.some((c) => c.field === "otr");
                  const isRebateChanged = rowChanges.some((c) => c.field === "rebate");
                  const isPromoChanged = rowChanges.some((c) => c.field === "promotion");

                  return (
                    <div
                      key={`${r.model}-${r.variant}`}
                      className={`card card-elevated !p-0 overflow-hidden ${
                        rowChanges.length > 0 ? "ring-1 ring-amber-300/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--color-bg-tertiary)] to-white border-b border-[var(--color-border-primary)]">
                        <div className="min-w-0">
                          <p className="text-[0.6rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest leading-none mb-0.5">
                            {m.segment ?? ""}
                          </p>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide truncate">
                            {r.model}{" "}
                            <span className="text-[var(--color-text-tertiary)] normal-case font-semibold">
                              {r.variant}
                            </span>
                          </h3>
                        </div>
                        {rowChanges.length > 0 ? (
                          <span className="badge badge-amber shrink-0">
                            {rowChanges.length} change{rowChanges.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="badge badge-gray shrink-0">No changes</span>
                        )}
                      </div>
                      <div className="px-4 pt-1">

                      <FieldRow
                        id={fieldKey(r.model, r.variant, "otr")}
                        label="OTR"
                        current={fmt(r.otr)}
                        inputValue={r.otrInput}
                        disabled={r.noChange.otr}
                        changed={isOtrChanged}
                        onChange={(v) => updateRow(rowIndex, { otrInput: v })}
                        onNoChange={(v) => setNoChange(rowIndex, "otr", v)}
                      />
                      <FieldRow
                        id={fieldKey(r.model, r.variant, "rebate")}
                        label="Rebate"
                        current={fmt(r.rebate)}
                        inputValue={r.rebateInput}
                        disabled={r.noChange.rebate}
                        changed={isRebateChanged}
                        onChange={(v) => updateRow(rowIndex, { rebateInput: v })}
                        onNoChange={(v) => setNoChange(rowIndex, "rebate", v)}
                      />
                      {/* Monthly — derived, read-only */}
                      {(() => {
                        const monthlyChanged =
                          (otrParsed ?? r.otr) !== r.otr || (rebateParsed ?? r.rebate) !== r.rebate;
                        return (
                          <div
                            className={`grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_180px_auto] gap-x-4 gap-y-1.5 items-center py-2.5 border-b border-[var(--color-border-primary)]/70 scroll-mt-36 ${
                              monthlyChanged
                                ? "bg-blue-50/60 -mx-3 px-3 border-l-4 border-l-blue-400 rounded-r-xl"
                                : "px-1"
                            }`}
                          >
                            <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                              Monthly (9Y)
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              Current{" "}
                              <CurrentChip value={fmt(calcMonthly(r.otr - r.rebate))} muted />
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)] font-mono sm:text-right">
                              New: <strong className="text-accent">{fmt(monthlyNew)}</strong>
                              {monthlyChanged && (
                                <span className="badge badge-blue !text-[0.55rem] !px-1.5 !py-0 ml-1.5">
                                  AUTO
                                </span>
                              )}
                            </p>
                            <span className="badge badge-gray !text-[0.55rem] !px-2 !py-0 justify-self-start sm:justify-self-end">
                              derived
                            </span>
                          </div>
                        );
                      })()}
                      <PromoRow
                        id={fieldKey(r.model, r.variant, "promotion")}
                        currentLines={r.promo}
                        inputValue={r.promoInput}
                        disabled={r.noChange.promotion}
                        changed={isPromoChanged}
                        onChange={(v) => updateRow(rowIndex, { promoInput: v })}
                        onNoChange={(v) => setNoChange(rowIndex, "promotion", v)}
                      />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {changes.length === 0 && (
          <div className="card bg-[var(--color-bg-tertiary)]/60 text-center !py-8">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No changes detected. Switch a field to{" "}
              <span className="font-semibold text-[var(--color-text-secondary)]">Editing</span>{" "}
              to update a value.
            </p>
          </div>
        )}
      </main>

      {/* Modal: preview / prompt */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="card w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] ">
                {modal === "preview" ? "Preview Changes" : "Update Prompt"}
              </h3>
              <button
                onClick={() => setModal(null)}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <pre className="flex-1 overflow-auto bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] rounded-xl p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {modal === "preview" ? previewText : promptText}
            </pre>
            <div className="flex justify-end gap-2 mt-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>
                Close
              </button>
              {modal === "prompt" ? (
                <button className="btn btn-primary btn-sm" onClick={copyPrompt}>
                  Copy Prompt
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setModal(null);
                    applyUpdates();
                  }}
                >
                  Apply Updates
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className="toast-container">
        {toast && (
          <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
            {toast.msg}
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Smart Update Mode — BYD Miri Knowledge Base. Updates only changed fields; structure, order and untouched values are preserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
