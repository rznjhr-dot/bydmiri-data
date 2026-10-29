import { PageSection, PageShell } from "@/components/PageShell";

const assets = [
  { category: "Posters", icon: "poster", count: 0 },
  { category: "Videos", icon: "video", count: 0 },
  { category: "Images", icon: "image", count: 0 },
  { category: "Templates", icon: "template", count: 0 },
  { category: "Captions", icon: "caption", count: 0 },
] as const;

const assetIcons = {
  poster: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  video: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="m16 10 6-3v10l-6-3" />
    </svg>
  ),
  image: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  template: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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
      <path d="M8 13h8M8 17h8" />
    </svg>
  ),
  caption: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  ),
};

export default function AssetsPage() {
  return (
    <PageShell
      title="Marketing assets"
      description="Posters, videos, images, templates, and captions for BYD Miri sales and marketing."
      eyebrow="Library"
      width="default"
    >
      <PageSection
        eyebrow="Categories"
        title="Asset categories"
        description="Upload posters, videos, images, document templates, and social captions, then tag them by model, campaign, and content type."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.category}
              className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border-primary)] px-3 py-6 text-center"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                {assetIcons[asset.icon]}
              </span>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {asset.category}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                {asset.count > 0 ? `${asset.count} files` : "Coming soon"}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="text-sm leading-relaxed text-[var(--color-text-tertiary)]">
            <p className="font-medium text-[var(--color-text-secondary)]">
              Asset library — coming soon
            </p>
            <p className="mt-1">
              This page will host all marketing and sales assets in a
              searchable, filterable library. Assets can be tagged by vehicle
              model, campaign, and content type.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-[var(--color-text-tertiary)]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="min-w-0 truncate text-sm text-[var(--color-text-tertiary)]">
            Search assets by name, model, or tag…
          </span>
          <span className="label ml-auto shrink-0 rounded border border-[var(--color-border-primary)] px-2 py-0.5 text-[0.55rem] text-[var(--color-text-tertiary)]">
            Soon
          </span>
        </div>
      </div>
    </PageShell>
  );
}
