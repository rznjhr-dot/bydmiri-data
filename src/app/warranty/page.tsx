import Link from "next/link";
import WarrantyCard from "@/components/WarrantyCard";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            Warranty Coverage
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            BYD warranty terms and coverage details
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <WarrantyCard />
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari</p>
        </div>
      </footer>
    </div>
  );
}
