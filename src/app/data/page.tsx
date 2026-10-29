import Link from "next/link";
import { PageSection, PageShell } from "@/components/PageShell";

const datasets = [
  { name: "company.json", path: "/data/company.json", schema: "company" },
  { name: "vehicles.json", path: "/data/vehicles.json", schema: "vehicles" },
  { name: "promotions.json", path: "/data/promotions.json", schema: null },
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
    <PageShell
      title="Machine-readable data"
      description="Every dataset exposed as raw JSON for AI agents and automated systems."
      eyebrow="Developers"
      width="default"
    >
      <PageSection
        eyebrow="Endpoints"
        title="Datasets"
        description={`${datasets.length} JSON files, served directly from the public directory.`}
        flush
      >
        <ul className="divide-y divide-[var(--color-border-primary)]/60">
          {datasets.map((ds) => (
            <li key={ds.name}>
              <a
                href={ds.path}
                className="group flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--color-bg-tertiary)] sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
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
                      <path d="M16 13H8M16 17H8" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-[var(--color-text-primary)]">
                      {ds.name}
                    </p>
                    {ds.schema && (
                      <p className="truncate font-mono text-[0.7rem] text-[var(--color-text-tertiary)]">
                        schema: {ds.schema}.schema.json
                      </p>
                    )}
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-sm text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </a>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        eyebrow="Reference"
        title="Schemas and usage"
        description="Responses are raw JSON. JSON Schema files document every field so agents can validate the data."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            These endpoints are designed for AI agents and programmatic access.
            For a human-readable view, open the{" "}
            <Link
              href="/"
              className="font-medium underline underline-offset-2"
            >
              dashboard
            </Link>
            .
          </p>
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/60 px-3 py-2.5">
            <p className="label text-[0.6rem] text-[var(--color-text-tertiary)]">
              Schema path
            </p>
            <code className="mt-1 block break-all font-mono text-xs text-[var(--color-text-secondary)]">
              /schemas/&lt;name&gt;.schema.json
            </code>
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text-tertiary)]">
            Schemas define the structure, types, and descriptions for every
            field, enabling agents to understand and validate the data
            programmatically.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
