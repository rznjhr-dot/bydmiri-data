import Link from "next/link";
import company from "@/data/company.json";

const datasets = [
  { name: "company.json", path: "/data/company.json" },
  { name: "vehicles.json", path: "/data/vehicles.json" },
  { name: "pricing.json", path: "/data/pricing.json" },
  { name: "rebates.json", path: "/data/rebates.json" },
  { name: "finance.json", path: "/data/finance.json" },
  { name: "charging.json", path: "/data/charging.json" },
  { name: "website_rules.json", path: "/data/website_rules.json" },
  { name: "sales_rules.json", path: "/data/sales_rules.json" },
  { name: "content_rules.json", path: "/data/content_rules.json" },
  { name: "changelog.json", path: "/data/changelog.json" },
];

export default function DataIndex() {
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
            /data &mdash; Machine Readable
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            All datasets exposed as raw JSON for AI agents and automated systems.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {datasets.map((ds) => (
            <a
              key={ds.name}
              href={ds.path}
              className="card flex items-center justify-between hover:border-byd-blue/30 transition-all active:scale-[0.99]"
            >
              <p className="font-mono text-xs sm:text-sm font-medium text-byd-dark">
                {ds.name}
              </p>
              <span className="text-byd-blue text-xs sm:text-sm font-mono">&rarr;</span>
            </a>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 card bg-yellow-50/80 border border-yellow-200/60">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Note:</strong> These endpoints return raw JSON. Designed for
            AI agents and programmatic access. For a human-readable view, visit the{" "}
            <Link href="/" className="underline">Dashboard</Link>.
          </p>
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
