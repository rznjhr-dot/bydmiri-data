import Link from "next/link";
import TopUpCalculator from "@/components/TopUpCalculator";

export default function TopUpPage() {
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
            Price breakdown
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Selling price breakdown &amp; balance payable — A − B, siap untuk hantar ke customer
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TopUpCalculator />
      </main>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}