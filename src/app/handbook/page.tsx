import Link from "next/link";
import company from "@/data/company.json";

const appData = {
  company: { href: "/data/company.json", label: "Company Info" },
  vehicles: { href: "/data/vehicles.json", label: "Vehicles" },
  pricing: { href: "/data/pricing.json", label: "Pricing" },
  rebates: { href: "/data/rebates.json", label: "Rebates" },
  finance: { href: "/data/finance.json", label: "Finance" },
  charging: { href: "/data/charging.json", label: "Charging Network" },
  websiteRules: { href: "/data/website_rules.json", label: "Website Rules" },
  salesRules: { href: "/data/sales_rules.json", label: "Sales Rules" },
  contentRules: { href: "/data/content_rules.json", label: "Content Rules" },
  changelog: { href: "/data/changelog.json", label: "Changelog" },
};

export default function HandbookPage() {
  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Master Handbook
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Complete reference for all BYD Miri operations.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="card card-elevated">
          <h2 className="font-bold text-[var(--color-text-primary)] text-base mb-2">
            About This Handbook
          </h2>
          <div className="space-y-2 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
            <p>
              This handbook serves as the Single Source of Truth (SSOT) for all
              BYD Miri operations. It replaces scattered documents and provides a
              central authority for vehicle information, pricing, rebates,
              financing, sales rules, website rules, charging network information,
              and content creation rules.
            </p>
            <p>
              The handbook is designed to be read by both humans and AI agents.
              All data is stored in static JSON files and requires no code changes
              to update.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(appData).map(([key, item]) => (
            <Link
              key={key}
              href={item.href}
              className="card card-interactive flex items-center justify-between hover:border-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span className="font-medium text-[var(--color-text-primary)] text-sm">
                  {item.label}
                </span>
              </div>
              <span className="text-accent text-sm">&rarr;</span>
            </Link>
          ))}
        </div>

        <div className="card bg-accent/5 border border-accent/10">
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-2">
            Quick Reference
          </h3>
          <div className="space-y-1.5 text-sm text-[var(--color-text-tertiary)]">
            <div className="data-row justify-start gap-2">
              <span className="text-[var(--color-text-tertiary)] font-medium">Sales Consultant:</span>
              <span className="text-[var(--color-text-secondary)]">{company.salesConsultant}</span>
            </div>
            <div className="data-row justify-start gap-2">
              <span className="text-[var(--color-text-tertiary)] font-medium">Phone:</span>
              <span className="text-[var(--color-text-secondary)]">{company.phone}</span>
            </div>
            <div className="data-row justify-start gap-2">
              <span className="text-[var(--color-text-tertiary)] font-medium">Version:</span>
              <span className="text-[var(--color-text-secondary)]">{company.version}</span>
            </div>
            <div className="data-row justify-start gap-2">
              <span className="text-[var(--color-text-tertiary)] font-medium">Last Updated:</span>
              <span className="text-[var(--color-text-secondary)]">{company.lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
        </div>
      </footer>
    </div>
  );
}
