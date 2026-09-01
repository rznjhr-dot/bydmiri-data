import type { Metadata } from "next";
import Link from "next/link";
import RcoForm from "@/components/RcoForm";

export const metadata: Metadata = {
  title: "RCO Generator · BYD Miri",
  description: "Submit a sales order — PDF auto-generated in Drive",
};

export default function RcoPage() {
  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            RCO Generator
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Fill in the sales order &rarr; PDF appears in the Drive folder automatically
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <RcoForm />
      </main>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}
