"use client";

import Link from "next/link";
import { useState } from "react";
import templatesData from "@/data/prompt-studio/templates.json";
import rulesData from "@/data/prompt-studio/rules.json";
import libraryData from "@/data/prompt-studio/library.json";
import type { GeneratorTemplate } from "@/types/prompt-studio";

const generatorsList = (templatesData as { templates: GeneratorTemplate[] }).templates;

const sections = [
  {
    title: "Generators",
    description: "Specialised prompt generators for every content format",
    items: generatorsList.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      href: `/ai-prompt-studio/generators?template=${g.id}`,
      badge: "Generator",
      platform: g.platform,
      aspectRatio: g.aspectRatio,
    })),
  },
  {
    title: "Studio",
    description: "Tools and workspace for prompt creation and management",
    items: [
      { id: "builder", name: "Prompt Builder", description: "Visually assemble prompts from modular building blocks — choose campaign, vehicle, theme, and more", href: "/ai-prompt-studio/builder", badge: "Core", platform: "", aspectRatio: "" },
      { id: "library", name: "Prompt Library", description: "Browse pre-built prompt templates organised by category — automotive, luxury, editorial, and more", href: "/ai-prompt-studio/library", badge: "Library", platform: "", aspectRatio: "" },
      { id: "saved", name: "Saved Prompts", description: "Your saved prompt collection — edit, duplicate, favourite, and organise", href: "/ai-prompt-studio/saved", badge: "Saved", platform: "", aspectRatio: "" },
      { id: "history", name: "Prompt History", description: "Recently generated and copied prompts — never lose a good prompt", href: "/ai-prompt-studio/history", badge: "History", platform: "", aspectRatio: "" },
    ],
  },
  {
    title: "Rules & Reference",
    description: "Brand guidelines, technical rules, and best practices",
    items: (rulesData as { categories: { id: string; name: string; description: string }[] }).categories.map((r) => ({
      id: r.id,
      name: `${r.name} Rules`,
      description: r.description,
      href: `/ai-prompt-studio/rules#${r.id}`,
      badge: "Rules",
      platform: "",
      aspectRatio: "",
    })),
  },
];

const quickStats = [
  { label: "Generators", value: generatorsList.length.toString() },
  { label: "Library Entries", value: (libraryData as { entries: unknown[] }).entries.length.toString() },
  { label: "Rules", value: (rulesData as { categories: unknown[] }).categories.length.toString() },
  { label: "Status", value: "Active" },
];

function getBadgeClass(badge: string) {
  switch (badge) {
    case "Generator": return "badge-green";
    case "Core": return "badge-blue";
    case "Library": return "badge-amber";
    case "Saved": return "badge-blue";
    case "History": return "badge-gray";
    case "Rules": return "badge-amber";
    default: return "badge-gray";
  }
}

export default function AIPromptStudioPage() {
  const [search, setSearch] = useState("");

  const allItems = sections.flatMap((s) => s.items);
  const filtered = search
    ? allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      )
    : allItems;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
                AI Prompt Studio
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                Production-grade prompt engineering platform — build, manage, and export master prompts for ChatGPT GPT Image
              </p>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* RJEOS Note */}
        <Link
          href="/rjeos"
          className="card card-interactive group border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/80 to-white overflow-hidden"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-[0.55rem] font-black tracking-tight">RJ</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-bold text-neutral-800 text-sm">RJEOS™ — Editorial Campaign Engine</h2>
                <span className="badge badge-amber text-[0.5rem] py-0 px-1.5">Separate System</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A completely separate prompt engine for premium automotive editorial campaign artwork.
                Locked-down constitutional system — typography, hierarchy, and composition rules are immutable.
                <span className="text-amber-600 font-medium ml-1 group-hover:underline">Open RJEOS &rarr;</span>
              </p>
            </div>
          </div>
        </Link>

        {/* System Overview */}
        <div className="card border-l-4 border-l-purple-500 bg-purple-50/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-2 4h-4s-2-2-2-4a4 4 0 0 1 4-4z"/><path d="M12 8v6"/><path d="M12 16v2"/><path d="M8 22h8"/><path d="M12 22v-4"/></svg>
            </div>
            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">Prompt Engineering Platform</h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                This system generates production-grade master prompts optimised for ChatGPT GPT Image.
                No external APIs, no AI subscriptions, no backend inference — just modular, reusable,
                copyable prompts built from 16 modular block types.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="badge badge-purple text-[0.6rem]">v1.0.0</span>
                <span className="badge badge-green text-[0.6rem]">GPT Image Only</span>
                <span className="badge badge-blue text-[0.6rem]">16 Blocks</span>
                <span className="badge badge-amber text-[0.6rem]">{generatorsList.length} Generators</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search generators, tools, rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200/60 bg-white text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
          />
        </div>

        {/* Sections */}
        {search ? (
          <section>
            <h2 className="section-title">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <Link key={item.id} href={item.href} className="card card-interactive group relative overflow-hidden">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-neutral-800 text-sm truncate">{item.name}</h3>
                        <span className={`badge ${getBadgeClass(item.badge)} text-[0.55rem] py-0 px-1.5`}>{item.badge}</span>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 transition-colors">Open &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-8">No results found for &ldquo;{search}&rdquo;</p>
            )}
          </section>
        ) : (
          sections.map((section) => (
            <section key={section.title}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title mb-0">{section.title}</h2>
                <span className="text-[0.6rem] text-neutral-400 font-medium">{section.items.length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item) => (
                  <Link key={item.id} href={item.href} className="card card-interactive group relative overflow-hidden">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-neutral-800 text-sm truncate">{item.name}</h3>
                          <span className={`badge ${getBadgeClass(item.badge)} text-[0.55rem] py-0 px-1.5`}>{item.badge}</span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2">{item.description}</p>
                        {(item.platform || item.aspectRatio) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {item.platform && <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{item.platform}</span>}
                            {item.aspectRatio && <span className="text-[0.55rem] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{item.aspectRatio}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700 transition-colors">Open &rarr;</span>
                      {item.badge !== "Generator" && item.badge !== "Rules" && (
                        <span className="badge badge-green text-[0.5rem] py-0 px-1">Future Ready</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Ridzuan Jahari — AI Prompt Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
