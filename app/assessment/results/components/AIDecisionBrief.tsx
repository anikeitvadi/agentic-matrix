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
      try {
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
      } catch (err) {
        console.error('AI brief generation failed:', err)
        setError('Failed to generate brief. Check your OpenAI API key and try again.')
      }
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
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-neutral-800/60 bg-neutral-900/50 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Executive Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">{brief.executiveSummary}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Recommendation</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-400">{brief.recommendation}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CompactList title="Tradeoffs" items={brief.tradeoffs} />
            <CompactList title="Risk Checks" items={brief.riskChecks} />
          </div>

          <CompactList title="Decision-changing questions" items={brief.questionsThatWouldChangeDecision} />

          <div className="rounded-lg border border-brand-800/40 bg-brand-950/30 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Next Step</p>
            <p className="mt-1 text-sm text-neutral-300">{brief.nextStep}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-neutral-800/50 bg-neutral-900/30 px-3 py-2 text-sm leading-relaxed text-neutral-400">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
