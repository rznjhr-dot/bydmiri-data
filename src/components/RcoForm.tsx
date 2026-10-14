"use client";

import { useMemo, useState } from "react";
import { vehicles } from "@/data";

// ─── Config: Google Form field entry IDs ──────────────────────
const FORM_ENDPOINT =
  "https://docs.google.com/forms/d/e/1FAIpQLScJEk5omRRPtSF95Wmz-f0bwfIhU-klHJrHPXG013uaAVGYiA/formResponse";

const ENTRY = {
  name: "entry.1344718289",
  ic: "entry.1497009757",
  phone: "entry.963436320",
  email: "entry.1483717024",
  address: "entry.1410654744",
  variant: "entry.1184113853",
  colour: "entry.1054025301",
  chassis: "entry.627715182",
  engine: "entry.165675226",
  yearMake: "entry.834738253",
  loanAmount: "entry.829051836",
  loanPeriod: "entry.216051642",
  salesAdvisor: "entry.1734313444",
  remarks: "entry.493636417",
};

const COLOURS = [
  "Aurora White", "Ski White", "Cosmos Black", "Harbour Grey",
  "Atlantis Grey", "Ultraviolet", "Sage Green", "Breeze Green", "Gemilang Blue",
];
const LOAN_MONTHS = [108, 96, 90, 84, 72, 60, 48, 36, 24];
const DRIVE_FOLDER = "https://drive.google.com/drive/folders/1p8vhrVTyaQFBmNoP9nC7WdrlXDXp5wpU";

type RcoResult = {
  id: string;
  customer: string;
  variant: string;
  colour: string;
  done: boolean;
  prices: { label: string; value: string }[];
};

const fmt = (n: number | undefined) =>
  (n ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RcoForm() {
  // customer
  const [name, setName] = useState("");
  const [ic, setIc] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  // vehicle
  const [variant, setVariant] = useState("");
  const [colour, setColour] = useState("");
  const [chassis, setChassis] = useState("");
  const [engine, setEngine] = useState("");
  const [yearMake, setYearMake] = useState(new Date().getFullYear().toString());
  // finance
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPeriod, setLoanPeriod] = useState("108");
  // sales
  const [advisor, setAdvisor] = useState("Ridzuan Bin Jahari");
  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<RcoResult[]>([]);
  const [error, setError] = useState("");

  // variant options from the live database (SSOT)
  const variantOptions = useMemo(() => {
    const opts: string[] = [];
    vehicles.forEach((m) =>
      m.variants.forEach((v) => opts.push(`BYD ${m.model} - ${v.name}`))
    );
    return opts;
  }, []);

  const selectedVariant = useMemo(() => {
    if (!variant) return null;
    for (const m of vehicles) {
      for (const v of m.variants) {
        if (`BYD ${m.model} - ${v.name}` === variant) return v;
      }
    }
    return null;
  }, [variant]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !ic.trim() || !phone.trim() || !address.trim() || !variant) {
      setError("Fill in the required fields first.");
      return;
    }
    setSubmitting(true);
    const body = new URLSearchParams({
      [ENTRY.name]: name.trim(),
      [ENTRY.ic]: ic.trim(),
      [ENTRY.phone]: phone.trim(),
      [ENTRY.email]: email.trim(),
      [ENTRY.address]: address.trim(),
      [ENTRY.variant]: variant,
      [ENTRY.colour]: colour,
      [ENTRY.chassis]: chassis.trim(),
      [ENTRY.engine]: engine.trim(),
      [ENTRY.yearMake]: yearMake,
      [ENTRY.loanAmount]: loanAmount.trim(),
      [ENTRY.loanPeriod]: loanPeriod,
      [ENTRY.salesAdvisor]: advisor,
      [ENTRY.remarks]: remarks.trim(),
    });

    try {
      // Google Forms needs a no-cors POST; response is opaque but the data lands
      await fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", body });
      const v = selectedVariant;
      const newResult: RcoResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        customer: name.trim(),
        variant,
        colour,
        done: false,
        prices: v
          ? [
              { label: "Selling price", value: `RM ${fmt(v.rrp)}` },
              { label: "Insurance", value: `RM ${fmt(v.otr - v.otrWithoutInsurance)}` },
              { label: "OTR w/o ins", value: `RM ${fmt(v.otrWithoutInsurance)}` },
              { label: "OTR w/ ins", value: `RM ${fmt(v.otr)}` },
            ]
          : [],
      };
      setResults((r) => [newResult, ...r]);
      // pseudo progress: flip to "done" after ~2.5s (Apps Script takes ~10-15s for the PDF)
      setTimeout(() => {
        setResults((r) => r.map((x) => (x.id === newResult.id ? { ...x, done: true } : x)));
      }, 2500);
      // clear form (keep advisor + defaults)
      setName(""); setIc(""); setPhone(""); setEmail(""); setAddress("");
      setChassis(""); setEngine(""); setLoanAmount(""); setRemarks("");
      setColour(""); setVariant("");
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
          <h2 className="section-title text-sm !mb-0">New RCO</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Submits to Google Forms &rarr; PDF auto-generated in Drive
          </p>
        </div>

        <div className="divide-y divide-[var(--color-border-primary)]/50">
          {/* Customer */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Customer</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Name *</label>
                <input className="input !text-xs !py-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmad bin Abu" />
              </div>
              <div>
                <label className={label}>IC Number *</label>
                <input className="input !text-xs !py-1.5" value={ic} onChange={(e) => setIc(e.target.value)} placeholder="900101135011" inputMode="numeric" />
              </div>
              <div>
                <label className={label}>Phone *</label>
                <input className="input !text-xs !py-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="013 889 7766" inputMode="tel" />
              </div>
              <div>
                <label className={label}>Email</label>
                <input className="input !text-xs !py-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" />
              </div>
            </div>
            <div>
              <label className={label}>Address *</label>
              <textarea className="input !text-xs !py-1.5 min-h-[60px] resize-y" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Lot 88, Jalan Miri Pujut, 98000 Miri, Sarawak" />
            </div>
          </fieldset>

          {/* Vehicle */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Vehicle</legend>
            <div>
              <label className={label}>Variant *</label>
              <select className="select !text-xs !py-1.5" value={variant} onChange={(e) => setVariant(e.target.value)}>
                <option value="">Select model &amp; variant…</option>
                {variantOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            {selectedVariant && (
              <div className="bg-[var(--color-accent-light)]/50 border border-[var(--color-accent)]/25 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="badge badge-blue !text-[0.6rem]">Live prices</span>
                  <span className="text-[0.65rem] text-[var(--color-text-tertiary)]">from database</span>
                </div>
                {[
                  ["Selling price", fmt(selectedVariant.rrp)],
                  ["Insurance", fmt(selectedVariant.otr - selectedVariant.otrWithoutInsurance)],
                  ["OTR without insurance", fmt(selectedVariant.otrWithoutInsurance)],
                  ["OTR with insurance", fmt(selectedVariant.otr)],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">{l}</span>
                    <span className="num font-bold text-[var(--color-text-primary)]">RM {v}</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className={label}>Colour</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="input !text-xs !py-1.5 sm:flex-1"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="Type colour…"
                />
                <div className="flex flex-wrap gap-1.5 sm:max-w-[60%]">
                  {COLOURS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColour(colour === c ? "" : c)}
                      className={`inline-flex items-center rounded-full border font-semibold transition-all cursor-pointer text-[0.7rem] px-2 py-1 ${
                        colour === c
                          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[var(--shadow-accent)]"
                          : "bg-white border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={label}>Year Make</label>
                <input className="input !text-xs !py-1.5" value={yearMake} onChange={(e) => setYearMake(e.target.value)} inputMode="numeric" />
              </div>
              <div>
                <label className={label}>Chassis No.</label>
                <input className="input !text-xs !py-1.5" value={chassis} onChange={(e) => setChassis(e.target.value)} placeholder="LGXC…" />
              </div>
              <div>
                <label className={label}>Engine No.</label>
                <input className="input !text-xs !py-1.5" value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="EV…" />
              </div>
            </div>
          </fieldset>

          {/* Finance */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Finance</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={label}>Loan Amount (RM)</label>
                <div className="input-group">
                  <span className="input-prefix !text-[0.7rem]">RM</span>
                  <input className="input !text-xs !py-1.5" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} inputMode="decimal" placeholder="116,370" />
                </div>
              </div>
              <div>
                <label className={label}>Loan Period (months)</label>
                <select className="select !text-xs !py-1.5" value={loanPeriod} onChange={(e) => setLoanPeriod(e.target.value)}>
                  {LOAN_MONTHS.map((m) => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Sales */}
          <fieldset className="p-4 space-y-3">
            <legend className={legend}>Sales</legend>
            <div>
              <label className={label}>Sales Advisor</label>
              <input className="input !text-xs !py-1.5" value={advisor} onChange={(e) => setAdvisor(e.target.value)} />
            </div>
            <div>
              <label className={label}>Remarks</label>
              <textarea className="input !text-xs !py-1.5 min-h-[50px] resize-y" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes…" />
            </div>
          </fieldset>
        </div>

        {error && (
          <div className="mx-4 mb-3 rounded-lg bg-[var(--color-neutral-100)] border border-[var(--color-figure-black)] text-[var(--color-figure-black)] text-xs px-3 py-2">
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
            {submitting ? "Submitting…" : "Generate RCO"}
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
              <h2 className="section-title text-sm !mb-0">Generated RCOs</h2>
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
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{r.customer}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">·</span>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{r.variant}</span>
                    {r.colour && <span className="badge !text-[0.6rem]">{r.colour}</span>}
                  </div>
                  {r.done ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-figure-black)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-[0.7rem] font-semibold text-[var(--color-figure-black)]">
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
                <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
                  {r.prices.map((p) => (
                    <div key={p.label} className="text-right">
                      <div className="text-[0.6rem] text-[var(--color-text-tertiary)]">{p.label}</div>
                      <div className="num text-xs font-bold text-[var(--color-text-primary)]">{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
