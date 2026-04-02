'use client'

import Link from 'next/link'
import type { PlatformScore } from '@/lib/scoring/types'

interface PlatformScoresProps {
  scores: PlatformScore[]
  maxDisplay?: number
}

/**
 * Displays a ranked list of top platform recommendations with scores.
 *
 * Shows platform rank, name (linked to detail page), and match score (0-100).
 * Uses brand colors to highlight scores.
 */
export function PlatformScores({ scores, maxDisplay = 5 }: PlatformScoresProps) {
  const topScores = scores.slice(0, maxDisplay)

  if (topScores.length === 0) {
    return (
      <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800">
        <p className="text-neutral-400 text-center">
          No platforms scored yet. Complete the assessment to see recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Top Recommendations</h2>
      <div className="space-y-3">
        {topScores.map((score, index) => (
          <div
            key={score.platformId}
            className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-900/30 border border-brand-700">
                <span className="text-lg font-bold text-brand-400">
                  {index + 1}
                </span>
              </div>

              {/* Platform info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/platforms/${score.platformId}`}
                    className="text-lg font-medium hover:text-brand-400 transition-colors"
                  >
                    {score.platformName}
                  </Link>
                  {index === 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-900/30 border border-brand-700/50 text-brand-400">
                      Best Match
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {score.recommendationSummary?.headline ?? `Match score: ${score.totalScore}/100`}
                </p>

                {/* Gate failures */}
                {score.gateFailures?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {score.gateFailures.filter(g => g.severity === 'hard').map((g) => (
                      <span key={g.gate + g.requirement} className="px-2 py-0.5 text-xs rounded-full bg-red-950/40 border border-red-800/50 text-red-400">
                        Missing {g.requirement}
                      </span>
                    ))}
                    {score.gateFailures.filter(g => g.severity === 'soft').map((g) => (
                      <span key={g.gate + g.requirement} className="px-2 py-0.5 text-xs rounded-full bg-amber-950/40 border border-amber-800/50 text-amber-400">
                        {g.requirement}
                      </span>
                    ))}
                  </div>
                )}

                {/* Strengths & caveats */}
                {score.recommendationSummary && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {score.recommendationSummary.strengths.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400">
                        {s}
                      </span>
                    ))}
                    {score.recommendationSummary.caveats.map((c) => (
                      <span key={c} className="px-2 py-0.5 text-xs rounded-full bg-amber-950/40 border border-amber-800/50 text-amber-400">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score + meta */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {/* Numeric score */}
              <div className="text-3xl font-bold text-brand-500 min-w-[3ch] text-right">
                {score.totalScore}
              </div>
              {/* Risk + Confidence labels */}
              <div className="flex gap-2 text-[10px] font-medium uppercase tracking-wider">
                {score.implementationRisk && (
                  <span className={
                    score.implementationRisk.label === 'Low' ? 'text-emerald-500' :
                    score.implementationRisk.label === 'Medium' ? 'text-amber-500' : 'text-red-500'
                  }>
                    Risk: {score.implementationRisk.label}
                  </span>
                )}
                {score.confidence && (
                  <span className="text-neutral-500">
                    Evidence: {score.confidence.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
