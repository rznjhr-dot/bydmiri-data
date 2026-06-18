import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-6xl font-extrabold text-accent mb-4">404</p>
        <h1 className="text-xl font-bold text-neutral-800 mb-2">Page not found</h1>
        <p className="text-sm text-neutral-400 mb-6">
          This page doesn&apos;t exist in the Master Databook.
        </p>
        <Link
          href="/"
          className="btn btn-primary inline-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
