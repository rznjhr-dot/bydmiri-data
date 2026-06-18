import Link from "next/link";
import company from "@/data/company.json";

const datasets = [
  { name: "company.json", path: "/data/company.json", schema: "company" },
  { name: "vehicles.json", path: "/data/vehicles.json", schema: "vehicles" },
  { name: "pricing.json", path: "/data/pricing.json", schema: null },
  { name: "rebates.json", path: "/data/rebates.json", schema: null },
  { name: "finance.json", path: "/data/finance.json", schema: "finance" },
  { name: "charging.json", path: "/data/charging.json", schema: "charging" },
  { name: "website_rules.json", path: "/data/website_rules.json", schema: null },
  { name: "sales_rules.json", path: "/data/sales_rules.json", schema: "sales_rules" },
  { name: "content_rules.json", path: "/data/content_rules.json", schema: null },
  { name: "changelog.json", path: "/data/changelog.json", schema: null },
];

export default function DataIndex() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            /data &mdash; Machine Readable
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            All datasets exposed as raw JSON for AI agents and automated systems.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-2">
          {datasets.map((ds) => (
            <a
              key={ds.name}
              href={ds.path}
              className="card card-interactive flex items-center justify-between hover:border-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div>
                  <p className="font-mono text-sm font-medium text-neutral-800">
                    {ds.name}
                  </p>
                  {ds.schema && (
                    <span className="text-[0.55rem] text-neutral-400 font-mono">
                      schema: {ds.schema}.schema.json
                    </span>
                  )}
                </div>
              </div>
              <span className="text-accent text-sm font-mono">&rarr;</span>
            </a>
          ))}
        </div>

        <div className="mt-8 card bg-amber-50/80 border border-amber-200/60">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> These endpoints return raw JSON. Designed for
              AI agents and programmatic access. For a human-readable view, visit the{" "}
              <Link href="/" className="underline font-medium">Dashboard</Link>.
            </p>
          </div>
        </div>

        <div className="mt-4 card bg-accent/5 border border-accent/10">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div>
              <p className="text-sm text-neutral-700 font-medium mb-1">JSON Schema Reference</p>
              <p className="text-sm text-neutral-500 leading-relaxed">
                JSON Schema definitions are available for each dataset at{" "}
                <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">/schemas/&lt;name&gt;.schema.json</code>.
                These schemas define the structure, types, and descriptions for every field,
                enabling AI agents to understand and validate the data programmatically.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {company.company} &mdash; {company.branch}.
          </p>
        </div>
      </footer>
    </div>
  );
}
