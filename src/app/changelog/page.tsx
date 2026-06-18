import Link from "next/link";
import changelogEntries from "@/data/changelog.json";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            Changelog
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Version history of the RJ Master Databook.
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {changelogEntries.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-neutral-400 text-sm">No changelog entries yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[1.125rem] top-3 bottom-3 w-px bg-neutral-200" />

            <div className="space-y-4">
              {changelogEntries.map((entry) => (
                <div key={entry.version} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-[0.625rem] top-1.5 w-[1.125rem] h-[1.125rem] rounded-full bg-white border-2 border-accent flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>

                  <div className="card">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="badge badge-blue text-xs">
                        {entry.version}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {entry.date}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {entry.changes.map((change, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-neutral-500"
                        >
                          <span className="text-accent mt-0.5 shrink-0">&bull;</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 card bg-neutral-50/80 border border-neutral-200/60">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p className="text-sm text-neutral-500">
              This page is generated from{" "}
              <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-xs font-mono">
                src/data/changelog.json
              </code>
              . Add new entries to that file to publish updates.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
        </div>
      </footer>
    </div>
  );
}
