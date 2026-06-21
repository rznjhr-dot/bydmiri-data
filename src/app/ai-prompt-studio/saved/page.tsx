"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SavedPrompt } from "@/types/prompt-studio";

const STORAGE_KEY = "ps_saved";

function loadSaved(): SavedPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToStorage(items: SavedPrompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedPrompt[]>([]);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived" | "favorites">("all");

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const toggleFavorite = (id: string) => {
    setSaved((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s));
      saveToStorage(next);
      return next;
    });
  };

  const deleteItem = (id: string) => {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(next);
      return next;
    });
  };

  const handleCopy = async (prompt: string, id: string) => {
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
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = saved
    .filter((s) => {
      if (filter === "active") return s.status === "active";
      if (filter === "draft") return s.status === "draft";
      if (filter === "archived") return s.status === "archived";
      if (filter === "favorites") return s.favorite;
      return true;
    })
    .filter(
      (s) =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        s.notes.toLowerCase().includes(search.toLowerCase())
    );

  const filters = [
    { id: "all" as const, label: "All" },
    { id: "active" as const, label: "Active" },
    { id: "draft" as const, label: "Draft" },
    { id: "archived" as const, label: "Archived" },
    { id: "favorites" as const, label: "Favorites" },
  ];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Saved Prompts</h1>
              <p className="text-sm text-neutral-400 mt-0.5">Your saved prompt collection — stored locally in your browser</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === f.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Search saved prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200/60 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="stat"><div className="stat-value">{saved.length}</div><div className="stat-label">Total</div></div>
          <div className="stat"><div className="stat-value">{saved.filter((s) => s.status === "active").length}</div><div className="stat-label">Active</div></div>
          <div className="stat"><div className="stat-value">{saved.filter((s) => s.favorite).length}</div><div className="stat-label">Favorites</div></div>
          <div className="stat"><div className="stat-value">{saved.filter((s) => s.status === "archived").length}</div><div className="stat-label">Archived</div></div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            </div>
            <p className="text-sm text-neutral-400 mb-1">No saved prompts yet</p>
            <p className="text-xs text-neutral-300">Build your first prompt in the Prompt Builder and save it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-neutral-800 text-sm truncate">{item.name}</h3>
                      <span className={`badge text-[0.5rem] py-0 px-1 ${
                        item.status === "active" ? "badge-green" : item.status === "draft" ? "badge-amber" : "badge-gray"
                      }`}>{item.status}</span>
                      {item.favorite && <span className="text-[0.6rem] text-amber-500">★</span>}
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-1">{item.notes || "No notes"}</p>
                    <div className="flex items-center gap-3 text-[0.55rem] text-neutral-400">
                      <span>{item.category}</span>
                      <span>v{item.version}</span>
                      <span>{new Date(item.created).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[0.5rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
                      title={item.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <button
                      onClick={() => handleCopy(item.prompt, item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                      title="Copy prompt"
                    >
                      {copiedId === item.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio</p>
        </div>
      </footer>
    </div>
  );
}
