"use client";

import { useState } from "react";
import { marketingScoring } from "@/data";
import { PageShell, PageSection } from "@/components/PageShell";

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
    <PageShell
      title="Creative Director"
      eyebrow="Marketing AI · Creative Director"
      description="Review creative quality across nine weighted criteria before anything reaches production."
      width="default"
      backHref="/marketing-ai"
      backLabel="Marketing AI"
    >
      <PageSection
        eyebrow="Evaluation"
        title="Creative score"
        description={`Weighted scoring across ${marketingScoring.criteria.length} criteria. Adjust a rating below to see the total update.`}
        action={
          <div className="text-right">
            <div className="num text-3xl leading-none text-accent">{result.total}<span className="text-lg text-[var(--color-text-tertiary)]">/100</span></div>
            <div className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1">{result.label}</div>
          </div>
        }
      >
        <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${result.total}%`, backgroundColor: "var(--color-figure-black)" }}
          />
        </div>
      </PageSection>

      <PageSection
        eyebrow="Rubric"
        title="Scoring criteria"
        description="Each criterion carries a weight; the weighted average becomes the score out of 100."
      >
        <div className="space-y-2">
          {marketingScoring.criteria.map((criterion) => {
            const currentScore = scores[criterion.id] ?? 3;
            const level = criterion.levels.find((l) => l.score === currentScore);
            return (
              <div key={criterion.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{criterion.name}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{criterion.description}</p>
                  </div>
                  <span className="text-xs font-bold text-accent shrink-0">Weight: {criterion.weight}%</span>
                </div>

                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const lvl = criterion.levels.find((l) => l.score === s);
                    return (
                      <button
                        key={s}
                        onClick={() => updateScore(criterion.id, s)}
                        className={`flex-1 min-w-0 text-center px-1 sm:px-2 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all ${
                          currentScore === s
                            ? "bg-accent text-white "
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
      </PageSection>

      <PageSection
        eyebrow="Reference"
        title="Scoring ranges"
        description="How the weighted total maps to a creative verdict."
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {marketingScoring.scoringRanges.map((r) => (
            <div key={r.label} className="text-center p-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]/60">
              <div className="num text-xs font-bold text-[var(--color-text-secondary)]">{r.min}-{r.max}</div>
              <div className="text-[0.7rem] text-[var(--color-text-tertiary)]">{r.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
          <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">AI prompt</h3>
          <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
            Uses <code className="bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[0.7rem] font-mono break-all">src/data/prompts/creative-director.md</code> for AI-powered creative review and improvement suggestions.
          </p>
        </div>
      </PageSection>
    </PageShell>
  );
}
