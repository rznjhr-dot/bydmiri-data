import Link from "next/link";
import company from "@/data/company.json";
import changelogEntries from "@/data/changelog.json";

export default function ChangelogPage() {
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
            Changelog
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Version history of the BYD Knowledge Base Masterbook.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {changelogEntries.length === 0 ? (
            <div className="card text-center py-8 sm:py-12">
              <p className="text-gray-400 text-sm">No changelog entries yet.</p>
            </div>
          ) : (
            changelogEntries.map((entry) => (
              <div key={entry.version} className="card">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="badge badge-version text-xs">
                    {entry.version}
                  </span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {entry.changes.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
                    >
                      <span className="text-byd-blue mt-0.5">&bull;</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 sm:mt-8 card bg-gray-50/80 border border-gray-200/60">
          <p className="text-xs sm:text-sm text-gray-500">
            This page is generated from{" "}
            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[0.6rem] sm:text-xs">
              src/data/changelog.json
            </code>
            . Add new entries to that file to publish updates.
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
