import Link from "next/link";

const assets = [
  { category: "Posters", icon: "🖼️", count: 0 },
  { category: "Videos", icon: "🎬", count: 0 },
  { category: "Images", icon: "📷", count: 0 },
  { category: "Templates", icon: "📄", count: 0 },
  { category: "Captions", icon: "💬", count: 0 },
];

export default function AssetsPage() {
  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Marketing Assets
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Posters, videos, images, templates, and captions for BYD Miri sales &amp; marketing.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Asset categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {assets.map((asset) => (
            <div key={asset.category} className="card card-elevated flex flex-col items-center justify-center py-6 text-center">
              <span className="text-3xl mb-3">{asset.icon}</span>
              <h3 className="font-bold text-[var(--color-text-primary)] text-base mb-1">{asset.category}</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {asset.count > 0 ? `${asset.count} files` : "Coming soon"}
              </p>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="card bg-accent/5 border border-accent/10">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
              <p className="font-medium text-[var(--color-text-secondary)] mb-1">Asset Library — Coming Soon</p>
              <p>
                This page will host all marketing and sales assets in a searchable, filterable library.
                Upload posters, videos, images, document templates, and social media captions here.
                Assets can be tagged by vehicle model, campaign, and content type.
              </p>
            </div>
          </div>
        </div>

        {/* Search placeholder */}
        <div className="card border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-tertiary)]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span className="text-sm text-[var(--color-text-tertiary)]">Search assets by name, model, or tag...</span>
            <span className="ml-auto text-[0.7rem] text-[var(--color-text-tertiary)] bg-[var(--color-border-primary)]/60 px-2 py-0.5 rounded">Soon</span>
          </div>
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
