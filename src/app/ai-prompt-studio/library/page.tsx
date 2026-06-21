"use client";

import { useState } from "react";
import Link from "next/link";
import libraryData from "@/data/prompt-studio/library.json";
import type { LibraryData } from "@/types/prompt-studio";

const data = libraryData as LibraryData;

function getFolderIcon(folderId: string): string {
  const icons: Record<string, string> = {
    automotive: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5",
    luxury: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    editorial: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    lifestyle: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    promotion: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
    festive: "M12 2v4m0 16v-4m10-8h-4M2 12h4m14.364-6.364l-2.828 2.828M6.343 17.657l-2.828 2.828m16.97 0l-2.828-2.828M6.343 6.343L3.515 3.515",
    corporate: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    news: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    photography: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    product: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    delivery: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    customer: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    sales: "M2 3h20v10H2V3z",
    greeting: "M21 5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V5z",
  };
  return icons[folderId] || icons.automotive;
}

export default function LibraryPage() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentEntries = activeFolder
    ? data.entries.filter((e) => e.folder === activeFolder)
    : data.entries;

  const filtered = search
    ? currentEntries.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : currentEntries;

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/ai-prompt-studio"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            AI Prompt Studio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Prompt Library</h1>
              <p className="text-sm text-neutral-400 mt-0.5">Browse pre-built prompt templates organised by category</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Folders */}
          <aside className="hidden sm:block w-56 shrink-0 space-y-1">
            <button
              onClick={() => { setActiveFolder(null); setSearch(""); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                !activeFolder ? "bg-purple-100 text-purple-700 font-medium" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              All Prompts
            </button>
            {data.folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  activeFolder === folder.id ? "bg-purple-100 text-purple-700 font-medium" : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d={getFolderIcon(folder.id)}/></svg>
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-[0.55rem] text-neutral-400">{data.entries.filter(e => e.folder === folder.id).length}</span>
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Mobile folder selector */}
            <div className="sm:hidden">
              <select
                value={activeFolder || ""}
                onChange={(e) => setActiveFolder(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200/60 text-sm text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">All Prompts</option>
                {data.folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({data.entries.filter(e => e.folder === f.id).length})</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200/60 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              />
            </div>

            {/* Entry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((entry) => (
                <div key={entry.id} className="card">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-neutral-800 text-sm truncate">{entry.name}</h3>
                        <span className={`badge text-[0.5rem] py-0 px-1 ${
                          entry.status === "published" ? "badge-green" : entry.status === "draft" ? "badge-amber" : "badge-gray"
                        }`}>{entry.status}</span>
                      </div>
                      <p className="text-xs text-neutral-500">{entry.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[0.5rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-[0.55rem] text-neutral-400">v{entry.version} · {entry.folder}</span>
                    <button
                      onClick={() => handleCopy(entry.prompt)}
                      className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-neutral-400 text-center py-8">No prompts found</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio</p>
        </div>
      </footer>
    </div>
  );
}
