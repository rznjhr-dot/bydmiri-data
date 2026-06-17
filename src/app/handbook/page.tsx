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
    <div className="min-h-screen bg-byd-gray">
      <header className="header-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <Link
            href="/"
            className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            &larr; Dashboard
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold mt-2 text-gradient">
            Master Handbook
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Complete reference for all BYD Miri operations.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
        <div className="card">
          <h2 className="font-bold text-byd-dark text-sm sm:text-lg mb-3 sm:mb-4">
            About This Handbook
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            This handbook serves as the Single Source of Truth (SSOT) for all
            BYD Miri operations. It replaces scattered documents and provides a
            central authority for vehicle information, pricing, rebates,
            financing, sales rules, website rules, charging network information,
            and content creation rules.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2 sm:mt-3">
            The handbook is designed to be read by both humans and AI agents.
            All data is stored in static JSON files and requires no code changes
            to update.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {Object.entries(appData).map(([key, item]) => (
            <Link
              key={key}
              href={item.href}
              className="card flex items-center justify-between hover:border-byd-blue/30 transition-all active:scale-[0.99]"
            >
              <span className="font-medium text-byd-dark text-xs sm:text-sm">
                {item.label}
              </span>
              <span className="text-byd-blue text-xs sm:text-sm">&rarr;</span>
            </Link>
          ))}
        </div>

        <div className="card bg-byd-light/80 border border-blue-100/60">
          <h3 className="font-semibold text-byd-dark text-sm sm:text-base mb-2">
            Quick Reference
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
            <li>
              <strong className="text-byd-dark">Sales Consultant:</strong>{" "}
              {company.salesConsultant}
            </li>
            <li>
              <strong className="text-byd-dark">Phone:</strong> {company.phone}
            </li>
            <li>
              <strong className="text-byd-dark">Version:</strong>{" "}
              {company.version}
            </li>
            <li>
              <strong className="text-byd-dark">Last Updated:</strong>{" "}
              {company.lastUpdated}
            </li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {company.company} &mdash;{" "}
            {company.branch}.
          </p>
        </div>
      </footer>
    </div>
  );
}
