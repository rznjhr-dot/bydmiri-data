"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PromptHistoryItem } from "@/types/prompt-studio";

const STORAGE_KEY = "ps_history";

function loadHistory(): PromptHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "generated" | "copied" | "favorites">("all");

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const toggleFavorite = (id: string) => {
    setHistory((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem(STORAGE_KEY, "[]");
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

  const filtered = history.filter((h) => {
    if (tab === "generated") return h.action === "generated";
    if (tab === "copied") return h.action === "copied";
    if (tab === "favorites") return h.favorite;
    return true;
  });

  const tabs = [
    { id: "all" as const, label: "All History" },
    { id: "generated" as const, label: "Generated" },
    { id: "copied" as const, label: "Copied" },
    { id: "favorites" as const, label: "Favorites" },
  ];

  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/ai-prompt-studio"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            AI Prompt Studio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Prompt History</h1>
              <p className="text-sm text-neutral-400 mt-0.5">Recently generated and copied prompts — stored locally</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Tabs & Clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  tab === t.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="stat"><div className="stat-value">{history.length}</div><div className="stat-label">Total</div></div>
          <div className="stat"><div className="stat-value">{history.filter((h) => h.action === "generated").length}</div><div className="stat-label">Generated</div></div>
          <div className="stat"><div className="stat-value">{history.filter((h) => h.favorite).length}</div><div className="stat-label">Favorites</div></div>
          <div className="stat"><div className="stat-value">{history.filter((h) => h.action === "copied").length}</div><div className="stat-label">Copied</div></div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-sm text-neutral-400 mb-1">No history yet</p>
            <p className="text-xs text-neutral-300">Generate prompts in the Prompt Builder and they will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-neutral-800 text-sm truncate">{item.name}</h3>
                      <span className="badge-gray text-[0.5rem] py-0 px-1">{item.action}</span>
                      {item.favorite && <span className="text-[0.6rem] text-amber-500">★</span>}
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-1 font-mono">{item.prompt.slice(0, 200)}...</p>
                    <div className="flex items-center gap-3 text-[0.55rem] text-neutral-400">
                      <span>{item.generator}</span>
                      <span>{new Date(item.created).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <button
                      onClick={() => handleCopy(item.prompt, item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio</p>
        </div>
      </footer>
    </div>
  );
}
