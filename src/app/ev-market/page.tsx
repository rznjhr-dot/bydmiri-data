"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { competitors, evNews, company } from "@/data";
import type { NewsCategory } from "@/types/ev-market";

const categories: { key: NewsCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "launch", label: "Launches" },
  { key: "price", label: "Prices" },
  { key: "rebate", label: "Rebates" },
  { key: "market", label: "Market" },
  { key: "comparison", label: "Compare" },
  { key: "tech", label: "Tech" },
  { key: "policy", label: "Policy" },
];

const categoryColors: Record<NewsCategory, string> = {
  launch: "bg-blue-600 text-white  ",
  price: "bg-amber-600 text-white  ",
  rebate: "bg-green-600 text-white  ",
  market: "bg-purple-600 text-white  ",
  comparison: "bg-cyan-600 text-white  ",
  tech: "bg-indigo-600 text-white  ",
  policy: "bg-rose-600 text-white  ",
};

const brandColors: Record<string, string> = {
  BYD: "bg-accent text-white",
  Proton: "bg-red-600 text-white  ",
  MG: "bg-emerald-600 text-white  ",
  Leapmotor: "bg-orange-600 text-white  ",
  Chery: "bg-sky-600 text-white  ",
  Jaecoo: "bg-teal-600 text-white  ",
  Jetour: "bg-violet-600 text-white  ",
  Tesla: "bg-red-600 text-white  ",
};

export default function EVMarketPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">("all");
  const [showAllNews, setShowAllNews] = useState(false);

  const totalModels = useMemo(() => {
    let count = 0;
    for (const brand of competitors.brands) {
      for (const model of brand.models) {
        count += model.variants.length;
      }
    }
    return count;
  }, []);

  const totalBrands = competitors.brands.length;
  const newsItems = evNews.items;

  const filteredNews = useMemo(() => {
    const items = activeCategory === "all" ? newsItems : newsItems.filter((n) => n.category === activeCategory);
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [activeCategory, newsItems]);

  const displayedNews = showAllNews ? filteredNews : filteredNews.slice(0, 8);
  const highlightedNews = newsItems.filter((n) => n.highlighted);

  return (
    <main
      id="main-content"
      className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10 subpixel-antialiased"
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Hero */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--color-text-primary)] ">
            EV Market Malaysia
          </h1>
          <span className="bg-accent text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full shrink-0">Live</span>
        </div>
        <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)]  max-w-3xl leading-relaxed">
          EV news, prices & competitor data — updated {company.lastUpdated}.
          <span className="block mt-0.5 text-xs text-[var(--color-text-secondary)] ">* Indicative estimates. BYD: EM w/ ins. Competitors: WM — EM est. +RM3k. Rebates as of Jul 2026, T&Cs apply. Verify with dealer.</span>
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
        {[
          { value: totalBrands.toString(), label: "Brands", color: "text-[var(--color-text-primary)] " },
          { value: `${totalModels}+`, label: "Models", color: "text-[var(--color-text-primary)] " },
          { value: "RM57k", label: "Entry", color: "text-green-700 " },
          { value: "RM321k", label: "Max", color: "text-blue-700 " },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--color-bg-secondary)]  rounded-xl shadow-sm border border-[var(--color-border-primary)] p-2.5 sm:p-6 text-center">
            <p className={`text-lg sm:text-4xl font-black leading-none ${stat.color}`}>{stat.value}</p>
            <p className="text-[0.7rem] sm:text-sm font-bold text-[var(--color-text-secondary)]  mt-0.5 sm:mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6 sm:mb-10">
        <Link
          href="/ev-market/compare"
          className="bg-accent text-white inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Compare Models</span>
          <span className="sm:hidden">Compare</span>
        </Link>
      </div>

      {/* Highlighted News */}
      {highlightedNews.length > 0 && (
        <div className="mb-6 sm:mb-10">
          <h2 className="text-base sm:text-lg font-black text-[var(--color-text-primary)]  mb-3 sm:mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#d97706" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Highlights
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlightedNews.map((item) => (
              <div key={item.id} className="bg-[var(--color-bg-secondary)]  rounded-xl shadow-sm border-l-4 border-amber-500  p-3.5 sm:p-5">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] ">{item.date}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[0.7rem] sm:text-xs font-bold uppercase tracking-wider ${categoryColors[item.category]}`}>{item.category}</span>
                  {item.brand && <span className={`px-1.5 py-0.5 rounded text-[0.7rem] sm:text-xs font-bold ${brandColors[item.brand]}`}>{item.brand}</span>}
                </div>
                <h3 className="text-sm sm:text-base font-black text-[var(--color-text-primary)]  mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]  leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <h2 className="text-base sm:text-lg font-black text-[var(--color-text-primary)] ">Updates</h2>
          <span className="text-xs sm:text-sm font-bold text-[var(--color-text-secondary)]  bg-[var(--color-bg-tertiary)]  px-2.5 py-1 rounded-full">{newsItems.length}</span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setShowAllNews(false); }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? "bg-accent text-white shadow-md"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]   "
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Items */}
        <div className="space-y-2 sm:space-y-3">
          {displayedNews.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-[var(--color-bg-secondary)]  rounded-xl shadow-sm border border-[var(--color-border-primary)] p-3.5 sm:p-5 hover:shadow-md transition-all ${
                idx === 0 && activeCategory === "all" ? "border-l-4 border-accent" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] ">{item.date}</span>
                <span className={`px-1.5 py-0.5 rounded text-[0.7rem] sm:text-xs font-bold uppercase tracking-wider ${categoryColors[item.category]}`}>{item.category}</span>
                {item.brand && <span className={`px-1.5 py-0.5 rounded text-[0.7rem] sm:text-xs font-bold ${brandColors[item.brand]}`}>{item.brand}</span>}
                {item.source && <span className="text-[0.7rem] sm:text-xs font-bold text-[var(--color-text-secondary)]  ml-auto">{item.source}</span>}
              </div>
              <h3 className="text-sm sm:text-base font-black text-[var(--color-text-primary)]  mb-0.5">{item.title}</h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)]  leading-relaxed">{item.summary}</p>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-xs sm:text-sm text-accent hover:text-accent-hover font-bold">
                  Read source ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {filteredNews.length > 8 && (
          <button
            onClick={() => setShowAllNews(!showAllNews)}
            className="mt-4 sm:mt-6 w-full py-3 rounded-xl text-sm sm:text-base font-bold text-[var(--color-text-primary)]  hover:bg-[var(--color-bg-tertiary)]  transition-colors cursor-pointer border border-[var(--color-border-primary)] "
          >
            {showAllNews ? "Show less ↑" : `Show all ${filteredNews.length} ↓`}
          </button>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-sm sm:text-base font-bold text-[var(--color-text-secondary)] ">
            No {activeCategory !== "all" ? `${activeCategory} ` : ""}updates found.
          </div>
        )}
      </div>
    </main>
  );
}
