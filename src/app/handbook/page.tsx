import Link from "next/link";
import { PageSection, PageShell } from "@/components/PageShell";
import { company } from "@/data";

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
    <PageShell
      title="Master handbook"
      description="Complete reference for all BYD Miri operations."
      eyebrow="Reference"
      width="default"
    >
      <PageSection eyebrow="Overview" title="About this handbook">
        <div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            This handbook serves as the single source of truth (SSOT) for all
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
      </PageSection>

      <PageSection
        eyebrow="Contents"
        title="Reference documents"
        description={`${Object.keys(appData).length} source files covering vehicles, pricing, rebates, finance, rules, and the changelog.`}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(appData).map(([key, item]) => (
            <Link
              key={key}
              href={item.href}
              className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-primary)] px-3 py-2.5 transition-colors hover:bg-[var(--color-bg-tertiary)]"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-primary)] text-[var(--color-text-tertiary)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
                <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {item.label}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-sm text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="Contact" title="Quick reference">
        <div>
          <div className="data-row">
            <span className="data-row-label">Sales consultant</span>
            <span className="data-row-value">{company.salesConsultant}</span>
          </div>
          <div className="data-row">
            <span className="data-row-label">Phone</span>
            <span className="data-row-value">{company.phone}</span>
          </div>
          <div className="data-row">
            <span className="data-row-label">Version</span>
            <span className="data-row-value">{company.version}</span>
          </div>
          <div className="data-row">
            <span className="data-row-label">Last updated</span>
            <span className="data-row-value">{company.lastUpdated}</span>
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}
