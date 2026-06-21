"use client";

import { useState } from "react";
import Link from "next/link";
import scoring from "@/data/marketing/scoring.json";
import type { ScoringData, ScoringCriterion } from "@/types/marketing";

const typedScoring = scoring as unknown as ScoringData;

export default function CreativeDirectorPage() {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    typedScoring.criteria.forEach((c) => {
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
    typedScoring.criteria.forEach((c) => {
      const score = scores[c.id] ?? 3;
      weightedSum += score * c.weight;
      totalWeight += c.weight;
    });
    const total = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) : 0;
    const range = typedScoring.scoringRanges.find((r) => total >= r.min && total <= r.max);
    return {
      total,
      label: range?.label ?? "Unknown",
      color: range?.color ?? "gray",
    };
  };

  const result = calculateTotal();

  return (
    <div className="min-h-screen">
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/marketing-ai"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Marketing AI
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">Creative Director</h1>
          <p className="text-sm text-neutral-400 mt-1">Review creative quality across 9 weighted criteria</p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Score Result */}
        <div className="card border-l-4 border-l-accent bg-gradient-to-br from-accent/5 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-neutral-800 text-sm">Creative Score</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Weighted scoring across {typedScoring.criteria.length} criteria</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-accent">{result.total}<span className="text-lg font-semibold text-neutral-400">/100</span></div>
              <div className="text-xs font-semibold text-neutral-600 mt-0.5">{result.label}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
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
            {typedScoring.criteria.map((criterion) => {
              const currentScore = scores[criterion.id] ?? 3;
              const level = criterion.levels.find((l) => l.score === currentScore);
              return (
                <div key={criterion.id} className="card">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-sm">{criterion.name}</h3>
                      <p className="text-xs text-neutral-400">{criterion.description}</p>
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
                          className={`flex-1 text-center px-2 py-1.5 rounded-lg text-[0.6rem] font-medium transition-all ${
                            currentScore === s
                              ? "bg-accent text-white shadow-sm"
                              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                          }`}
                          title={lvl?.description}
                        >
                          {lvl?.label ?? s}
                        </button>
                      );
                    })}
                  </div>
                  {level && (
                    <p className="text-[0.6rem] text-neutral-400 mt-1 italic">{level.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Scoring Reference */}
        <section className="card border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-white">
          <h2 className="font-bold text-neutral-800 text-sm mb-2">Scoring Ranges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {typedScoring.scoringRanges.map((r) => (
              <div key={r.label} className="text-center p-2 rounded-lg bg-neutral-50 border border-neutral-200/60">
                <div className="text-xs font-bold text-neutral-700">{r.min}-{r.max}</div>
                <div className="text-[0.55rem] text-neutral-500">{r.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-600 mb-1">AI Prompt</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Uses <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-[0.6rem] font-mono">src/data/prompts/creative-director.md</code> for AI-powered creative review and improvement suggestions.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
