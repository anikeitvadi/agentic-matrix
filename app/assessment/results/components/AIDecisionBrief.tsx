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
    setError(null)
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
      } catch (err) {
        console.error('AI brief generation failed:', err)
        setError('Failed to generate brief. Check your API key and try again.')
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
        <div className="mt-3 rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-400">
          {error}
        </div>
      )}

      {brief && (
        <div className="mt-4 space-y-4">
          {/* Executive Summary */}
          <div className="rounded-lg border border-neutral-800/60 bg-neutral-950/50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Executive Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">{brief.executiveSummary}</p>
          </div>

          {/* Recommendation */}
          <div>
            <p className="text-sm font-semibold text-white">Recommendation</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-400">{brief.recommendation}</p>
          </div>

          {/* Tradeoffs */}
          <div>
            <p className="text-sm font-semibold text-white mb-2">Tradeoffs</p>
            {brief.tradeoffs.map((item, i) => (
              <p key={i} className="mb-1.5 text-sm leading-relaxed text-neutral-400">
                {item}
              </p>
            ))}
          </div>

          {/* Risk Checks */}
          <div>
            <p className="text-sm font-semibold text-white mb-2">Risk Checks</p>
            {brief.riskChecks.map((item, i) => (
              <p key={i} className="mb-1.5 text-sm leading-relaxed text-neutral-400">
                {item}
              </p>
            ))}
          </div>

          {/* Decision Questions */}
          <div>
            <p className="text-sm font-semibold text-white mb-2">What would change this decision</p>
            {brief.questionsThatWouldChangeDecision.map((item, i) => (
              <p key={i} className="mb-1.5 text-sm leading-relaxed text-neutral-400">
                {item}
              </p>
            ))}
          </div>

          {/* Next Step */}
          <div className="rounded-lg border border-brand-800/40 bg-brand-950/30 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Next Step</p>
            <p className="mt-1 text-sm text-neutral-300">{brief.nextStep}</p>
          </div>
        </div>
      )}
    </div>
  )
}
