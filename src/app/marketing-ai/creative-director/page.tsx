"use client";

import { useState } from "react";
import Link from "next/link";
import { marketingScoring } from "@/data";

export default function CreativeDirectorPage() {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    marketingScoring.criteria.forEach((c) => {
      initial[c.id] = 3; // default to "Good"
    });
    return initial;
  });

  const updateScore = (id: string, score: number) => {
    setScores((prev) => ({ ...prev, [id]: score }));
  };

  const calculateTotal = (): { total: number; label: string; color: string } => {
    let weightedSum = 0;
    let totalWeight = 0;
    marketingScoring.criteria.forEach((c) => {
      const score = scores[c.id] ?? 3;
      weightedSum += score * c.weight;
      totalWeight += c.weight;
    });
    const total = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) : 0;
    const range = marketingScoring.scoringRanges.find((r) => total >= r.min && total <= r.max);
    return {
      total,
      label: range?.label ?? "Unknown",
      color: range?.color ?? "gray",
    };
  };

  const result = calculateTotal();

  return (
    <div className="min-h-screen">
      <section className="page-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/marketing-ai"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Marketing AI
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Creative Director</h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Review creative quality across 9 weighted criteria</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Score Result */}
        <div className="card border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[var(--color-text-primary)] text-sm">Creative Score</h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Weighted scoring across {marketingScoring.criteria.length} criteria</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-accent">{result.total}<span className="text-lg font-semibold text-[var(--color-text-tertiary)]">/100</span></div>
              <div className="text-xs font-semibold text-[var(--color-text-secondary)] mt-0.5">{result.label}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${result.total}%`, backgroundColor: result.color === "red" ? "#dc2626" : result.color === "orange" ? "#d97706" : result.color === "yellow" ? "#ca8a04" : result.color === "lightgreen" ? "#16a34a" : "#16a34a" }}
            />
          </div>
        </div>

        {/* Scoring Criteria */}
        <section>
          <h2 className="section-title">Scoring Criteria</h2>
          <div className="space-y-2">
            {marketingScoring.criteria.map((criterion) => {
              const currentScore = scores[criterion.id] ?? 3;
              const level = criterion.levels.find((l) => l.score === currentScore);
              return (
                <div key={criterion.id} className="card">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{criterion.name}</h3>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{criterion.description}</p>
                    </div>
                    <span className="text-xs font-bold text-accent">Weight: {criterion.weight}%</span>
                  </div>

                  {/* Score buttons */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const lvl = criterion.levels.find((l) => l.score === s);
                      return (
                        <button
                          key={s}
                          onClick={() => updateScore(criterion.id, s)}
                          className={`flex-1 text-center px-2 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all ${
                            currentScore === s
                              ? "bg-accent text-white shadow-sm"
                              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-border-primary)]"
                          }`}
                          title={lvl?.description}
                        >
                          {lvl?.label ?? s}
                        </button>
                      );
                    })}
                  </div>
                  {level && (
                    <p className="text-[0.7rem] text-[var(--color-text-tertiary)] mt-1 italic">{level.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Scoring Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-[var(--color-text-primary)] text-sm mb-2">Scoring Ranges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {marketingScoring.scoringRanges.map((r) => (
              <div key={r.label} className="text-center p-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]/60">
                <div className="text-xs font-bold text-[var(--color-text-secondary)]">{r.min}-{r.max}</div>
                <div className="text-[0.7rem] text-[var(--color-text-tertiary)]">{r.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">AI Prompt</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
              Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono">src/data/prompts/creative-director.md</code> for AI-powered creative review and improvement suggestions.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
