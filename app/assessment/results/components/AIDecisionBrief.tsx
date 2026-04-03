'use client'

import { useMemo, useState, useTransition } from 'react'
import type { PlatformScore } from '@/lib/scoring/types'
import {
  generateRecommendationBrief,
  type RecommendationBrief,
} from '../actions'

interface AIDecisionBriefProps {
  assessment: Record<string, unknown> | null
  scores: PlatformScore[]
}

export function AIDecisionBrief({ assessment, scores }: AIDecisionBriefProps) {
  const [brief, setBrief] = useState<RecommendationBrief | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const topRecommendations = useMemo(
    () =>
      scores.slice(0, 3).map((score) => ({
        platformId: score.platformId,
        platformName: score.platformName,
        totalScore: score.totalScore,
        headline: score.recommendationSummary.headline,
        rationale: score.recommendationSummary.rationale,
        strengths: score.recommendationSummary.strengths,
        caveats: score.recommendationSummary.caveats,
        estimatedAnnualCost: score.recommendationSummary.estimatedAnnualCost,
        criteria: score.criteriaScores.map((criterion) => ({
          name: criterion.name,
          weight: criterion.weight,
          normalizedValue: criterion.normalizedValue,
        })),
      })),
    [scores]
  )

  if (scores.length === 0) {
    return null
  }

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateRecommendationBrief({
        assessment: assessment ?? {},
        topRecommendations,
      })

      if ('error' in result) {
        setError(result.error)
        return
      }

      setBrief(result.brief)
      setError(null)
    })
  }

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-base font-bold text-white">AI Brief</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Optional AI explanation of the ranking. Sends selected data to OpenAI.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isPending ? 'Generating...' : brief ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-amber-800/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-400">
          {error}
        </div>
      )}

      {brief && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                Executive Summary
              </p>
              <p className="mt-3 text-sm leading-7 text-neutral-300">
                {brief.executiveSummary}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white">Recommendation</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-300">{brief.recommendation}</p>
            </div>

            <ListSection title="Tradeoffs" items={brief.tradeoffs} />
          </div>

          <div className="space-y-6">
            <ListSection title="Risk Checks" items={brief.riskChecks} />
            <ListSection
              title="Questions That Would Change The Decision"
              items={brief.questionsThatWouldChangeDecision}
            />

            <div className="rounded-xl border border-brand-800/50 bg-brand-950/40 px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-400">
                Recommended Next Step
              </p>
              <p className="mt-3 text-sm leading-7 text-neutral-300">{brief.nextStep}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-3 text-sm leading-6 text-neutral-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
