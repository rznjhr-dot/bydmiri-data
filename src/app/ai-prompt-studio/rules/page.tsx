"use client";

import { useState } from "react";
import Link from "next/link";
import rulesData from "@/data/prompt-studio/rules.json";
import type { RulesData, RuleCategory } from "@/types/prompt-studio";

const data = rulesData as RulesData;

function RulesSection({ category }: { category: RuleCategory }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = typeof window !== "undefined" && window.location.hash === `#${category.id}`;

  return (
    <section
      id={category.id}
      className={`card scroll-mt-24 ${isActive ? "ring-2 ring-purple-400/40" : ""}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d={category.icon} />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-neutral-800 text-base">{category.name}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{category.description}</p>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Dos */}
          <div>
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Do
            </h3>
            <ul className="space-y-2">
              {category.dos.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          {/* Don'ts */}
          <div>
            <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Don&apos;t
            </h3>
            <ul className="space-y-2">
              {category.donts.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default function RulesPage() {
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-2 4h-4s-2-2-2-4a4 4 0 0 1 4-4z"/><path d="M12 8v6"/><path d="M12 16v2"/><path d="M8 22h8"/><path d="M12 22v-4"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Rules &amp; Reference</h1>
              <p className="text-sm text-neutral-400 mt-0.5">Brand guidelines, composition rules, and best practices for prompt engineering</p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Quick nav */}
        <div className="flex flex-wrap gap-1.5">
          {data.categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-700 transition-all"
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Rules sections */}
        {data.categories.map((cat) => (
          <RulesSection key={cat.id} category={cat} />
        ))}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio</p>
        </div>
      </footer>
    </div>
  );
}
