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
    <section className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white">AI Decision Brief</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Optional AI synthesis of the deterministic ranking. This does not change the score or the matrix. It explains the current recommendation in a stakeholder-ready format.
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Generating this brief sends your selected assessment answers and top recommendation data to OpenAI. Avoid using it for sensitive or confidential information.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!brief && !isPending && <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse mr-2" />}
          {isPending ? 'Generating brief...' : brief ? 'Regenerate Brief' : 'Generate Brief'}
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
    </section>
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
