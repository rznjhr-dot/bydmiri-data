"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";

/* ---------- DATA ---------- */

type Segment = {
  num: string;
  title: string;
  time: string;
  when?: string;
  script: string[];
};

const segments: Segment[] = [
  {
    num: "1", title: "Opening Hook", time: "~3 min",
    when: "Ulang setiap round baru / bila viewer baru masuk",
    script: [
      "Eh hello hello! Selamat datang ke live BYD Miri. Aku Ridzuan, sales advisor BYD di Kah Progression Auto Miri.",
      "Jadi kalau korang tengah fikir nak beli EV tapi tak tau mana satu, korang tempat yang betul. Aku akan explain semua model BYD yang ada, harga, rebate bulan ni, macam mana nak kira installment... semua aku buat untuk korang.",
      "Best part? Bulan ni ada **rebate sampai RM14,000**. RM14,000 bro. Tu bukan sikit. Tengok sampai habis live ni, sebab aku akan bagitau mana model paling worth.",
      "Kalau apa-apa soalan, just comment bawah. Aku jawab live.",
    ],
  },
  {
    num: "2", title: "\"Kenapa EV?\" Angle", time: "~2-3 min",
    when: "Bila orang tanya \"kenapa nak beli EV?\" atau bila live slow",
    script: [
      "Okay real talk. Orang tanya aku, 'Ridzuan, kenapa nak tukar EV?' Aku cakap tiga je benda:",
      "++Satu — jimat.++ Full charge RM10-12 je, tahan 400-600km. Isi minyak full tank RM50-60 every week. EV? RM10-12.",
      "++Dua — senyap.++ Engine tak ada bunyi, battery je. Tekan pedal, terus pickup. Tak ada gear change, tak ada lag. Mulus bro.",
      "++Tiga — family friendly.++ Atto 3, M6, Sealion 7... semua muat family. M6 tu 7 seater tau.",
      "Installment lebih kurang sama macam kereta minyak, tapi petrol hilang. Yang tinggal cuma cas elektrik. Tu savings tu.",
    ],
  },
  {
    num: "4", title: "Rebate Callout (Urgency)", time: "~1-2 min",
    when: "Sprinkle between models. Create urgency.",
    script: [
      "Okay sebelum aku sambung — rebate bulan ni, Oktober 2026. Ini campaign. Bukan permanent.",
      "**Atto 3 Ultra & Premium — RM14,000 each!** • Atto 2 Premium — RM9,000 • Sealion 7 Premium — RM7,000 • Sealion 7 Performance — RM6,000",
      "Campaign bulan ni je. Jangan tunggu next month sebab rebate mungkin dah turun atau hilang.",
    ],
  },
  {
    num: "5", title: "Warranty Flex", time: "~2 min",
    script: [
      "Korang mungkin tanya, 'EV ni beli, kalau rosak macam mana?' Tenang. BYD bagi warranty memang solid:",
      "++Vehicle: 6 tahun / 150,000km++ • ++Blade Battery: 8 tahun / 160,000km++ • ++Drive Unit: 8 tahun / 150,000km++",
      "8 tahun battery warranty. BYD berani sebab Blade Battery memang quality. Beli, pandu, enjoy. Servis depan showroom Kah Progression Auto.",
    ],
  },
  {
    num: "6", title: "Charging Talk", time: "~2-3 min",
    script: [
      "Okay, orang selalu tanya — 'cas macam mana? mana nak charge?' Simple. Tiga je:",
      "++1. Rumah — Wallbox 7kW.++ Charge malam, pagi penuh. RM10-12 full charge. Sarawak tariff murah.",
      "++2. Public AC 22kW.++ Shopping mall, public parking. Charge sambil makan, sambil shopping.",
      "++3. DC Fast Charge 60-180kW.++ Highway R&R. 20% to 80% dalam 20-30 minit je.",
      "Charge macam handphone je. Malam tidur, plug in. Pagi penuh. Travel jauh, singgah DC fast charge 20-30 minit, makan kopi, sambung jalan.",
    ],
  },
  {
    num: "7", title: "0% Downpayment Highlight", time: "~1-2 min",
    script: [
      "Korang tau BYD bagi **0% downpayment**? Zero. Kosong. Masuk, sign loan, bawak kereta. CTOS kena okay lah, bank kena approve.",
      "Contoh: Atto 2 Premium, 0% down, **RM1,088 sebulan**. Atto 3 Ultra, 0% down, **RM1,327 sebulan**.",
      "Tak pasti eligible ke tak, just WhatsApp aku. Free check, no obligation: ++011 3193 3930++.",
    ],
  },
  {
    num: "8", title: "Engagement / Q&A Prompt", time: "~1-2 min",
    script: [
      "Comment bawah — model yang korang minat? Atto 2? Atto 3? Sealion 7? Seal? M6?",
      "Nak tau installment khusus (gaji, downpayment berapa)? Comment 'CHECK' aku WhatsApp korang.",
      "Ada soalan — charge, warranty, loan? Comment je. Share live ni kat kawan yang tengah cari kereta. Follow ++@ridzuanbydmiri++.",
    ],
  },
  {
    num: "9", title: "Showroom CTA", time: "~1-2 min",
    script: [
      "++Kah Progression Auto — BYD Dealer++ — Lot 1829, Jalan Krokop Utama, 98000 Miri, Sarawak. Google Maps & Waze link dekat bio.",
      "Datang test drive. Rasa sendiri EV pickup, senyap, smooth. Bawa family, bawa kawan. Free, no obligation.",
      "Aku Ridzuan, saya akan urus korang. Tak berkenan pun tak pe, tak ada pressure. WhatsApp: ++011 3193 3930++.",
    ],
  },
  {
    num: "10", title: "Closing / Loop Back", time: "~1 min",
    script: [
      "Summary cepat: BYD Miri ada 6 model, 10 variants. RM106k sampai RM213k OTR. **Rebate sampai RM14,000**. 0% downpayment. Warranty battery 8 tahun.",
      "Showroom Kah Progression Auto, Krokop, Miri. WhatsApp ++011 3193 3930++. Follow ++@ridzuanbydmiri++.",
      "🔄 **LOOP BACK TO SEGMENT 1**",
    ],
  },
];

type Model = {
  name: string; tag: string; hot: boolean;
  otr: string; rebate: string; zero: string; ten: string; range: string;
  script: string;
};

const models: Model[] = [
  { name: "Atto 2 Premium", tag: "🔥 Entry King", hot: true, otr: "RM106,353", rebate: "−RM9,000", zero: "RM1,088", ten: "RM979", range: "410km",
    script: "Model paling berpatutan. Compact SUV. OTR RM106,353. Rebate RM9,000! 0% down: RM1,088/mo. Range 410km — cukup daily Miri. Bawah RM1,100/mo, EV, zero petrol... memang worth." },
  { name: "Atto 3 Ultra", tag: "🔥🔥 Sweet Spot", hot: true, otr: "RM132,729", rebate: "−RM14,000", zero: "RM1,327", ten: "RM1,194", range: "480km",
    script: "C-segment SUV, lebih besar dari Atto 2. OTR RM132,729. Rebate RM14,000 — paling besar! 0% down: RM1,327/mo. Range 480km. Bayar RM1,300/mo dapat SUV + EV + rebate RM14k. Mana nak cari?" },
  { name: "Atto 3 Premium", tag: "Best Range Family", hot: false, otr: "RM146,228", rebate: "−RM14,000", zero: "RM1,478", ten: "RM1,330", range: "600km",
    script: "Versi atas Ultra. OTR RM146,228. Rebate RM14,000 jugak! 0% down: RM1,478/mo. Range 600km — Miri ke Bintulu pun boleh. Paling best for long distance." },
  { name: "Sealion 7 Dynamic", tag: "Premium SUV Entry", hot: false, otr: "RM171,519", rebate: "−RM4,000", zero: "RM1,872", ten: "RM1,685", range: "520km",
    script: "D-segment, lebih besar, lebih premium. OTR RM171,519. Rebate RM4,000. 0% down: RM1,872/mo. Range 520km. Bawah RM1,900/mo dapat D-segment EV SUV." },
  { name: "Sealion 7 Premium", tag: "Gold Standard", hot: true, otr: "RM197,147", rebate: "−RM7,000", zero: "RM2,125", ten: "RM1,913", range: "650km",
    script: "Ni yang selalu orang tanya. OTR RM197,147. Rebate RM7,000! 0% down: RM2,125/mo. Range 650km! Premium SUV, technology terbaru BYD, interior kelas atasan." },
  { name: "Sealion 7 Performance", tag: "Top Tier", hot: false, otr: "RM213,073", rebate: "−RM6,000", zero: "RM2,314", ten: "RM2,083", range: "600km",
    script: "Versi paling atas Sealion 7. OTR RM213,073. Rebate RM6,000. 0% down: RM2,314/mo. Range 600km. Untuk yang nak top tier everything." },
  { name: "Seal Premium", tag: "Sedan King", hot: false, otr: "RM179,879", rebate: "−RM3,000", zero: "RM1,977", ten: "RM1,779", range: "650km",
    script: "D-segment sedan. Untuk yang suka sedan, suka sporty. OTR RM179,879. Rebate RM3,000. 0% down: RM1,977/mo. Range 650km. Sporty, elegant, family friendly." },
  { name: "Seal Performance", tag: "Sport Sedan", hot: false, otr: "RM200,904", rebate: "−RM3,000", zero: "RM2,212", ten: "RM1,991", range: "580km",
    script: "Versi atas Seal. OTR RM200,904. Rebate RM3,000. 0% down: RM2,212/mo. Range 580km. Sporty, performance-oriented, tapi masih sedan." },
  { name: "Seal 6 Premium", tag: "Sedan Value", hot: false, otr: "RM122,552", rebate: "−RM1,000", zero: "RM1,358", ten: "RM1,223", range: "485km",
    script: "C-segment sedan, lebih berpatutan dari Seal. OTR RM122,552. Rebate RM1,000. 0% down: RM1,358/mo. Range 485km. Bawah RM1,400/mo dapat EV sedan." },
  { name: "M6 Extended", tag: "7-Seater Family", hot: true, otr: "RM130,729", rebate: "−RM4,000", zero: "RM1,416", ten: "RM1,275", range: "530km",
    script: "7-seater electric MPV. Untuk family besar. OTR RM130,729. Rebate RM4,000. 0% down: RM1,416/mo. Range 530km. Muat 7 orang, zero petrol." },
];

const pmScripts = [
  { label: "⭐ RECOMMENDED", text: "Eh hello! Thanks bro support live BYD Miri tadi 🙏\n\nMacam aku cakap tadi, rebate bulan ni sampai RM14,000. Bukan permanent tau, campaign Oktober je.\n\nNi aku attach full pricelist semua 10 models BYD — harga OTR, rebate, monthly installment semua ada.\n\nKalau nak tau installment khusus untuk kau, atau nak check eligibility 0% downpayment, just WhatsApp aku:\n\n📲 011 3193 3930\n\nFree check, no obligation bro. Test drive pun boleh arrange 😎" },
  { label: "Formal (older viewers)", text: "Selamat hari! Terima kasih support live BYD Miri tadi 🙏\n\nSaya Ridzuan, sales advisor BYD di Kah Progression Auto Miri. Rebate bulan Oktober ini sampai RM14,000.\n\nAttached full pricelist untuk semua model BYD — harga OTR, rebate, dan anggaran installment.\n\nKalau encik/puan nak check eligibility loan atau nak schedule test drive, boleh WhatsApp saya:\n\n📲 011 3193 3930\n\nFree check, no obligation. Saya akan urus dari awal sampai habis 😊" },
  { label: "Super ringkas", text: "Yo bro thanks support live tadi! 🔥\n\nNi pricelist semua model BYD. Rebate bulan ni paling gila — Atto 3 dapat RM14,000 off.\n\nKalau kau minat mana-mana model, WhatsApp aku 011 3193 3930. Aku kira installment untuk kau, free check eligibility, no pressure 👍" },
];

const tips = [
  { t: "Repeat CTA", d: "mention WhatsApp setiap 5-10 min. New viewers masuk constantly." },
  { t: "Name drop", d: "bila orang comment, sebut nama dorang. Makes them feel seen." },
  { t: "Slow live?", d: "Rotate ke Segmen 2 (kenapa EV) atau 5 (warranty). Universal topics." },
  { t: "Price questions?", d: "Tengok Quick Reference table. Don't quote from memory." },
  { t: "Low viewers?", d: "TikTok FYP random. Just keep looping." },
  { t: "Technical question?", d: "Unsure? \"aku WhatsApp kau details nanti\" — don't guess." },
  { t: "\"Belum/nanti\"", d: "Drop it. Don't push. They'll come back." },
  { t: "Pace yourself", d: "1 hour = 3-4 loops. Sip water bro." },
];

/* ---------- HELPERS ---------- */

function renderScript(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\+\+[^+]+\+\+)/g);
  return parts.map((p, j) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <span key={j} className="px-1 rounded bg-[var(--color-figure-black)] text-white font-semibold">{p.slice(2, -2)}</span>;
    if (p.startsWith("++") && p.endsWith("++"))
      return <span key={j} className="px-1 rounded bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] font-semibold">{p.slice(2, -2)}</span>;
    return <span key={j}>{p}</span>;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={`text-[0.65rem] font-semibold px-2.5 py-1 rounded-lg border transition-colors shrink-0 ${
        copied
          ? "bg-[var(--color-figure-black)] text-white border-[var(--color-figure-black)]"
          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] border-[var(--color-border-primary)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)]"
      }`}>
      {copied ? "✓ Copied" : "📋 Copy"}
    </button>
  );
}

function SectionHeader({ num, title, meta }: { num: string; title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="w-6 h-6 rounded-md bg-[var(--color-accent)] text-white text-[0.7rem] font-extrabold flex items-center justify-center shrink-0">
        {num}
      </span>
      <h2 className="font-bold text-sm text-[var(--color-text-primary)]">{title}</h2>
      {meta && <span className="text-[0.65rem] font-mono text-[var(--color-text-tertiary)]">{meta}</span>}
    </div>
  );
}

/* ---------- PAGE ---------- */

export default function LiveScriptPage() {
  return (
    <PageShell
      eyebrow="Live sales kit"
      title="TikTok live script"
      description="Loop 1 → 10, repeat. Roughly 15–20 minutes per loop, rotating one model each cycle."
      width="wide"
      meta={
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-figure-black)] px-2.5 py-1 text-[0.65rem] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE PACK
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Prices:{" "}
            <a href="https://bydmiri.com/pricelist" className="text-[var(--color-accent)] underline">
              bydmiri.com/pricelist
            </a>{" "}
            (Aug 2026)
          </span>
        </>
      }
    >
        {/* SEGMENTS — 2-col grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          {segments.map((s) => (
            <div key={s.num} className="card card-elevated p-4">
              <SectionHeader num={s.num} title={s.title} meta={s.time} />
              {s.when && (
                <p className="text-[0.7rem] text-[var(--color-text-secondary)] bg-[var(--color-neutral-50)] border border-[var(--color-border-primary)] rounded-lg px-2.5 py-1.5 mb-2">
                  <strong>When:</strong> {s.when}
                </p>
              )}
              <div className="rounded-lg border-l-[3px] border-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-3 py-2.5 text-[0.8rem] leading-relaxed text-[var(--color-text-secondary)] space-y-1.5">
                {s.script.map((l, i) => (
                  <p key={i}>{renderScript(l)}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* MODEL ROTATION */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-6 h-6 rounded-md bg-[var(--color-accent)] text-white text-[0.7rem] font-extrabold flex items-center justify-center">3</span>
            <h2 className="font-bold text-sm text-[var(--color-text-primary)]">Model Rotation</h2>
            <span className="text-[0.65rem] font-mono text-[var(--color-text-tertiary)]">~3-5 min each · pick ONE per loop</span>
          </div>
          <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mb-3 ml-9">All 10 variants — script dah inline, skim je masa live.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {models.map((m) => (
              <div key={m.name} className="card card-elevated p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-[var(--color-text-primary)]">{m.name}</p>
                  <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full shrink-0 ${m.hot ? "bg-[var(--color-figure-black)] text-white" : "bg-[var(--color-accent-light)] text-[var(--color-accent)]"}`}>
                    {m.tag}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.72rem] font-mono mb-2">
                  <span className="text-[var(--color-text-tertiary)]">OTR <b className="text-[var(--color-text-primary)]">{m.otr}</b></span>
                  <span className="text-[var(--color-figure-black)] font-semibold">{m.rebate}</span>
                  <span className="text-[var(--color-text-tertiary)]">0% <b className="text-[var(--color-text-primary)]">{m.zero}</b></span>
                  <span className="text-[var(--color-text-tertiary)]">10% <b className="text-[var(--color-text-primary)]">{m.ten}</b></span>
                  <span className="text-[var(--color-text-secondary)] font-semibold">{m.range}</span>
                </div>
                <p className="text-[0.75rem] leading-relaxed text-[var(--color-text-secondary)] border-t border-[var(--color-border-secondary)] pt-2">
                  🎙️ {m.script}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK REFERENCE */}
        <div className="card card-elevated p-4">
          <SectionHeader num="📋" title="Quick Reference" meta="0%/10% down · 9yr · 2.3% flat" />
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border-primary)]">
            <table className="w-full text-[0.72rem]">
              <thead>
                <tr className="bg-[var(--color-accent-subtle)] text-left">
                  {["Model", "OTR", "Rebate", "0%/mo", "10%/mo", "Range"].map((h) => (
                    <th key={h} className="px-2.5 py-1.5 font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {models.map((m) => (
                  <tr key={m.name} className="border-t border-[var(--color-border-secondary)]">
                    <td className="px-2.5 py-1.5 font-sans font-semibold whitespace-nowrap">{m.name}</td>
                    <td className="px-2.5 py-1.5">{m.otr}</td>
                    <td className="px-2.5 py-1.5 text-[var(--color-figure-black)] font-semibold">{m.rebate}</td>
                    <td className="px-2.5 py-1.5">{m.zero}</td>
                    <td className="px-2.5 py-1.5">{m.ten}</td>
                    <td className="px-2.5 py-1.5 text-[var(--color-text-secondary)]">{m.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
            <div className="rounded-lg border border-[var(--color-border-primary)] p-3">
              <p className="font-bold text-xs mb-1.5">💰 Finance</p>
              <p className="text-[0.72rem] text-[var(--color-text-secondary)] leading-relaxed">
                2.3% flat · 90% margin · 2-9y (default 9y) · 0% down ✓
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-primary)] p-3">
              <p className="font-bold text-xs mb-1.5">🛡️ Warranty</p>
              <p className="text-[0.72rem] text-[var(--color-text-secondary)] leading-relaxed">
                Vehicle 6y/150k · Battery 8y/160k · Drive 8y/150k · Parts 3y/60k
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border-primary)] p-3">
              <p className="font-bold text-xs mb-1.5">📱 Contact</p>
              <p className="text-[0.72rem] text-[var(--color-text-secondary)] leading-relaxed">
                WA 011 3193 3930 · Krokop Utama, Miri · @ridzuanbydmiri
              </p>
            </div>
          </div>
        </div>

        {/* PM SCRIPTS */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <h2 className="font-bold text-sm text-[var(--color-text-primary)]">PM Scripts (Post-Live)</h2>
          </div>
          <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mb-3 ml-9">Send ke engaged viewers. Space out 10-15 min — jangan blast semua sekali (spam flag).</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-start">
            {pmScripts.map((pm) => (
              <div key={pm.label} className="card card-elevated p-3.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    {pm.label}
                  </span>
                  <CopyButton text={pm.text} />
                </div>
                <p className="whitespace-pre-wrap text-[0.75rem] leading-relaxed text-[var(--color-text-secondary)]">{pm.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TIPS */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-md bg-[var(--color-accent)] text-white text-[0.7rem] font-extrabold flex items-center justify-center">💡</span>
            <h2 className="font-bold text-sm text-[var(--color-text-primary)]">Live Tips</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tips.map((tip) => (
              <div key={tip.t} className="rounded-lg border border-[var(--color-border-primary)] border-l-[3px] border-l-[var(--color-figure-black)] bg-[var(--color-bg-secondary)] p-2.5 text-[0.7rem] leading-snug text-[var(--color-text-secondary)]">
                <strong className="text-[var(--color-text-primary)] block mb-0.5">{tip.t}</strong>
                {tip.d}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-text-tertiary)] pt-3 pb-8">
          BYD Miri — TikTok Live Script Pack · Kah Progression Auto Miri 🔴
        </p>
    </PageShell>
  );
}
