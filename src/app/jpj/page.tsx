import type { Metadata } from "next";
import Link from "next/link";
import JpjLauncher from "@/components/JpjLauncher";

export const metadata: Metadata = {
  title: "JPJ Checker · BYD Miri",
  description: "Launch the local JPJ number-plate checker (Streamlit on :8501)",
};

export default function JpjPage() {
  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="label inline-flex items-center gap-1 text-[0.62rem] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="display text-[clamp(1.5rem,4vw,2.25rem)] tracking-[-0.025em] text-[var(--color-text-primary)]">
            JPJ Checker
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Semak nombor pendaftaran across 32 states — runs locally on your Mac
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Launcher */}
        <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-5 sm:p-6">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
            Launch the tool
          </h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mb-4 leading-relaxed">
            Click starts the JPJ Checker app on this Mac (Terminal opens once,
            browser follows automatically). If it&rsquo;s already running, it
            opens straight away.
          </p>
          <JpjLauncher />
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-5 sm:p-6">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">
            How the scan works
          </h2>
          <ol className="space-y-2.5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <li className="flex gap-2.5">
              <span className="flex-none w-5 h-5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[0.65rem] font-bold flex items-center justify-center text-[var(--color-text-tertiary)]">1</span>
              Type the number (e.g. <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">888</code>) and hit Cari
            </li>
            <li className="flex gap-2.5">
              <span className="flex-none w-5 h-5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[0.65rem] font-bold flex items-center justify-center text-[var(--color-text-tertiary)]">2</span>
              A JPJ window opens — log in once (password + CAPTCHA)
            </li>
            <li className="flex gap-2.5">
              <span className="flex-none w-5 h-5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[0.65rem] font-bold flex items-center justify-center text-[var(--color-text-tertiary)]">3</span>
              Window minimizes itself — 32-state scan runs in background
            </li>
            <li className="flex gap-2.5">
              <span className="flex-none w-5 h-5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[0.65rem] font-bold flex items-center justify-center text-[var(--color-text-tertiary)]">4</span>
              Results as plate cards ✅/❌ + copy-paste customer summary
            </li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-5 sm:p-6">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">
            Troubleshooting
          </h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--color-text-primary)]">Button does nothing?</strong>{" "}
              The app lives at <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">~/Applications/JPJ Checker.app</code> — launch it once manually so macOS trusts it, then this button works forever.
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Server won&rsquo;t boot?</strong>{" "}
              Log at <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">~/.jpj_checker.log</code>
            </li>
            <li>
              <strong className="text-[var(--color-text-primary)]">Only works on this Mac</strong> — the tool is local by design (JPJ login + CAPTCHA is manual).
            </li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}
