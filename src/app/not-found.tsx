import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="label text-[0.62rem] text-[var(--color-text-tertiary)]">
          Error · 404
        </p>
        <p className="display mt-3 text-6xl leading-none tracking-[-0.03em] text-[var(--color-figure-black)]">
          404
        </p>
        <h1 className="display mt-4 text-xl tracking-[-0.02em] text-[var(--color-text-primary)]">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-tertiary)]">
          This page doesn&rsquo;t exist in the Master Databook. Check the address
          or return to the dashboard.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
