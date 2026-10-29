import Link from "next/link";
import company from "@/data/company.json";

type Width = "wide" | "default" | "reading";

const widths: Record<Width, string> = {
  wide: "max-w-[1240px]",
  default: "max-w-[1100px]",
  reading: "max-w-[880px]",
};

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  width?: Width;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

/**
 * Standard page frame: breadcrumb, title block, fluid main column, footer.
 * Width is deliberate per content type — wide for tables/grids, default for
 * tools, reading for prose — so the 1240px desktop canvas is used well
 * without producing unreadably long lines.
 */
export function PageShell({
  title,
  description,
  eyebrow,
  icon,
  actions,
  meta,
  width = "wide",
  backHref = "/",
  backLabel = "Dashboard",
  children,
}: PageShellProps) {
  const widthClass = widths[width];

  return (
    <div className="min-h-screen flex flex-col">
      <section className="page-header">
        <div className={`${widthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7`}>
          <Link
            href={backHref}
            className="label inline-flex items-center gap-1 text-[0.62rem] text-[var(--color-text-tertiary)] hover:text-[var(--color-figure-black)] transition-colors mb-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {backLabel}
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
              {icon && <div className="shrink-0 pt-0.5">{icon}</div>}
              <div className="min-w-0">
                {eyebrow && (
                  <p className="label text-[0.62rem] text-[var(--color-text-tertiary)]">
                    {eyebrow}
                  </p>
                )}
                <h1 className="display mt-1 text-[clamp(1.5rem,1.05rem+1.9vw,2.5rem)] leading-[1.05] tracking-[-0.028em] text-[var(--color-text-primary)]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-tertiary)]">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>

          {meta && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border-primary)]/70 pt-3">
              {meta}
            </div>
          )}
        </div>
      </section>

      <main
        id="main-content"
        className={`page-enter ${widthClass} mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6`}
      >
        {children}
      </main>

      <footer className="border-t border-[var(--color-border-primary)] mt-10">
        <div
          className={`${widthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5`}
        >
          <p className="label text-[0.6rem] text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
          <p className="label text-[0.6rem] text-[var(--color-text-tertiary)]">
            {company.version} &nbsp;·&nbsp; Last updated {company.lastUpdated}
          </p>
        </div>
      </footer>
    </div>
  );
}

type PageSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Content panel matching the page-header language: eyebrow, heading,
 * supporting line, hairline divider, then content. Use `flush` for
 * tables, grids, and lists that should meet the panel edge.
 */
export function PageSection({
  eyebrow,
  title,
  description,
  action,
  flush = false,
  className = "",
  children,
}: PageSectionProps) {
  const hasHeader = Boolean(eyebrow || title || description || action);

  return (
    <section
      className={`rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-primary)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="label text-[0.6rem] text-[var(--color-text-tertiary)]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-base font-bold text-[var(--color-text-primary)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-text-tertiary)]">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={flush ? "" : "px-5 py-4 sm:px-6"}>{children}</div>
    </section>
  );
}
