"use client";

import { useMemo, useState } from "react";
import { vehicles } from "@/data";

// ─── Config: Google Form field entry IDs ──────────────────────
// ⚠ ENTRY IDs are form-specific and MUST be scraped from the live
// eHakmilik Google Form DOM ([data-params] → [[<id>,) before shipping.
const FORM_ENDPOINT = "https://docs.google.com/forms/d/e/1FAIpQLScEOy3eyH2mpPxq-0cqeDsFMiMWvDbj9Oe2I6KAFYMuhSOPLg/formResponse";

const ENTRY = {
  hirer: "entry.691140969",
  icno: "entry.93099224",
  chassis: "entry.1266635083",
  engine: "entry.1119555831",
  variant: "entry.388654897",
  yearMake: "entry.1302303250",
  bank: "entry.1070721262",
  officer: "entry.1060617179",
  sa: "entry.635879766",
};

const DRIVE_FOLDER = "https://drive.google.com/drive/folders/10t7pwKWPuG2cCgZtQpYXaFtuneAoXwre";

type Result = {
  id: string;
  hirer: string;
  variant: string;
  bank: string;
  done: boolean;
};

export default function EhakmilikForm() {
  // customer / vehicle
  const [hirer, setHirer] = useState("");
  const [icno, setIcno] = useState("");
  const [chassis, setChassis] = useState("");
  const [engine, setEngine] = useState("");
  const [variant, setVariant] = useState("");
  const [yearMake, setYearMake] = useState(new Date().getFullYear().toString());
  // bank letter
  const [bank, setBank] = useState("");
  const [officer, setOfficer] = useState("");
  // optional — blank defaults the signature to RIDZUAN JAHARI
  const [saName, setSaName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");

  // variant options from the live database (SSOT) — same 10 combos as RCO
  const variantOptions = useMemo(() => {
    const opts: string[] = [];
    vehicles.forEach((m) =>
      m.variants.forEach((v) => opts.push(`BYD ${m.model} - ${v.name}`))
    );
    return opts;
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!hirer.trim() || !icno.trim() || !chassis.trim() || !engine.trim() || !variant) {
      setError("Fill in the required fields first.");
      return;
    }
    if (!bank.trim() || !officer.trim()) {
      setError("Fill in the bank and officer name.");
      return;
    }
    setSubmitting(true);
    const body = new URLSearchParams({
      [ENTRY.hirer]: hirer.trim(),
      [ENTRY.icno]: icno.trim(),
      [ENTRY.chassis]: chassis.trim(),
      [ENTRY.engine]: engine.trim(),
      [ENTRY.variant]: variant,
      [ENTRY.yearMake]: yearMake,
      [ENTRY.bank]: bank.trim(),
      [ENTRY.officer]: officer.trim(),
    });
    // Sales Advisor — optional; only append when filled (blank → RIDZUAN JAHARI)
    if (saName.trim()) body.append(ENTRY.sa, saName.trim());

    try {
      // Google Forms needs a no-cors POST; response is opaque but the data lands
      await fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", body });
      const newResult: Result = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        hirer: hirer.trim(),
        variant,
        bank: bank.trim(),
        done: false,
      };
      setResults((r) => [newResult, ...r]);
      // pseudo progress: flip to "done" after ~2.5s (Apps Script takes ~10-15s for the PDF)
      setTimeout(() => {
        setResults((r) => r.map((x) => (x.id === newResult.id ? { ...x, done: true } : x)));
      }, 2500);
      // clear form
      setHirer(""); setIcno(""); setChassis(""); setEngine(""); setVariant("");
      setBank(""); setOfficer(""); setSaName(""); setYearMake(new Date().getFullYear().toString());
    } catch {
      setError("Couldn't reach Google Forms. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }

  const label = "block text-[0.7rem] font-semibold text-[var(--color-text-tertiary)] mb-1";
  const legend = "text-[0.7rem] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-1";

  return (
    <div className="space-y-4">
      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={submit} className="card card-elevated !p-0 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-primary)]/60">
          <h2 className="section-title text-sm !mb-0">New e-Hakmilik Letter</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Submits to Google Forms &rarr; PDF auto-generated in Drive
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border-primary)]/50">
          {/* Hirer */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Hirer</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Hirer Name *</label>
                <input className="input !text-xs !py-1.5" value={hirer} onChange={(e) => setHirer(e.target.value)} placeholder="Ahmad bin Abu" />
              </div>
              <div>
                <label className={label}>IC / Business Reg. No *</label>
                <input className="input !text-xs !py-1.5" value={icno} onChange={(e) => setIcno(e.target.value)} placeholder="900101135011" inputMode="numeric" />
              </div>
            </div>
          </fieldset>

          {/* Vehicle */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Vehicle</legend>
            <div>
              <label className={label}>Model &amp; Variant *</label>
              <select className="select !text-xs !py-1.5" value={variant} onChange={(e) => setVariant(e.target.value)}>
                <option value="">Select model &amp; variant…</option>
                {variantOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>Year Make *</label>
                <input className="input !text-xs !py-1.5" value={yearMake} onChange={(e) => setYearMake(e.target.value)} inputMode="numeric" />
              </div>
              <div>
                <label className={label}>Chassis No. *</label>
                <input className="input !text-xs !py-1.5" value={chassis} onChange={(e) => setChassis(e.target.value)} placeholder="LGXC…" />
              </div>
              <div>
                <label className={label}>Engine No. *</label>
                <input className="input !text-xs !py-1.5" value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="EV…" />
              </div>
            </div>
          </fieldset>

          {/* Bank */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Bank / JPJ Letter</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Bank *</label>
                <input className="input !text-xs !py-1.5" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Maybank" />
              </div>
              <div>
                <label className={label}>Officer Name *</label>
                <input className="input !text-xs !py-1.5" value={officer} onChange={(e) => setOfficer(e.target.value)} placeholder="En. Ahmad Faizal" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Sales Advisor (optional)</label>
                <input className="input !text-xs !py-1.5" value={saName} onChange={(e) => setSaName(e.target.value)} placeholder="Blank = Ridzuan Jahari" />
              </div>
            </div>
            <p className="text-[0.65rem] text-[var(--color-text-tertiary)] leading-relaxed">
              Letter is addressed to the bank officer confirming the vehicle&rsquo;s
              ownership-claim registration with JPJ (e-Hakmilik). Leave Sales Advisor
              blank to sign as Ridzuan Jahari.
            </p>
          </fieldset>
        </div>

        {error && (
          <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
            {error}
          </div>
        )}

        <div className="px-4 py-3 border-t border-[var(--color-border-primary)]/60 bg-[var(--color-bg-secondary)]/50 flex items-center justify-between gap-3">
          <span className="text-[0.65rem] text-[var(--color-text-tertiary)]">
            PDF ready in Drive within ~15s after submit
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-white text-xs font-bold px-4 py-2 shadow-[var(--shadow-accent)] transition-all cursor-pointer"
          >
            {submitting ? "Submitting…" : "Generate e-Hakmilik Letter"}
            {!submitting && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            )}
          </button>
        </div>
      </form>

      {/* ── Results tray ─────────────────────────────────── */}
      {results.length > 0 && (
        <section className="card !p-0 overflow-hidden">
          <div className="px-4 pt-3.5 pb-2.5 border-b border-[var(--color-border-primary)]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="section-title text-sm !mb-0">Generated Letters</h2>
              <span className="badge badge-blue !text-[0.6rem]">{results.length}</span>
            </div>
            <a
              href={DRIVE_FOLDER}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors inline-flex items-center gap-1"
            >
              Open Drive folder
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
            </a>
          </div>
          <div className="divide-y divide-[var(--color-border-primary)]/50">
            {results.map((r) => (
              <div key={r.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{r.hirer}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{r.variant}</span>
                    {r.bank && <span className="badge !text-[0.6rem]">{r.bank}</span>}
                  </div>
                  {r.done ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success, #16a34a)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-[0.7rem] font-semibold text-[var(--color-success, #16a34a)]">
                        PDF created in Google Drive
                      </span>
                      <a
                        href={DRIVE_FOLDER}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.7rem] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors underline underline-offset-2"
                      >
                        Open folder
                      </a>
                    </div>
                  ) : (
                    <div className="mt-1.5 max-w-[220px]">
                      <div className="h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                        <div className="progress-slide h-full rounded-full bg-[var(--color-accent)]" style={{ width: "40%" }} />
                      </div>
                      <div className="text-[0.65rem] text-[var(--color-text-tertiary)] mt-1">
                        Generating PDF…
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
