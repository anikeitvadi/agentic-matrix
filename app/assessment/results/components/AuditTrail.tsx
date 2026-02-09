'use client'

import { useState, useMemo } from 'react'
import type { PlatformScore } from '@/lib/scoring/types'
import {
  explainComparison,
  getCriterionLabel,
  getCriterionDescription,
  getScoreBreakdown,
} from '@/lib/scoring/audit-trail'

interface AuditTrailProps {
  scores: PlatformScore[]
}

/**
 * AuditTrail component for transparent scoring explanations.
 *
 * Displays:
 * - Score breakdown for selected platform (criterion contributions)
 * - Comparison explanation between two platforms
 *
 * Supports RECC-04: Users understand why platform X scored higher than Y.
 */
export function AuditTrail({ scores }: AuditTrailProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    scores[0]?.platformId || ''
  )
  const [comparisonPlatform, setComparisonPlatform] = useState<string>('')

  // Get the selected platform score
  const selectedScore = useMemo(
    () => scores.find((s) => s.platformId === selectedPlatform),
    [scores, selectedPlatform]
  )

  // Get the comparison platform score
  const comparisonScore = useMemo(
    () => scores.find((s) => s.platformId === comparisonPlatform),
    [scores, comparisonPlatform]
  )

  // Generate score breakdown for selected platform
  const breakdown = useMemo(
    () => (selectedScore ? getScoreBreakdown(selectedScore) : []),
    [selectedScore]
  )

  // Generate comparison explanation
  const comparisonExplanation = useMemo(() => {
    if (!selectedScore || !comparisonScore) return null
    return explainComparison(selectedScore, comparisonScore)
  }, [selectedScore, comparisonScore])

  if (scores.length === 0) {
    return (
      <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800">
        <p className="text-neutral-400 text-center">
          No platform scores available for audit trail.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Score Breakdown</h2>
      </div>

      {/* Platform Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Primary Platform Selector */}
        <div className="flex-1">
          <label
            htmlFor="primary-platform"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            View details for
          </label>
          <select
            id="primary-platform"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {scores.map((score) => (
              <option key={score.platformId} value={score.platformId}>
                {score.platformName} ({score.totalScore} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Comparison Platform Selector */}
        <div className="flex-1">
          <label
            htmlFor="comparison-platform"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Compare to
          </label>
          <select
            id="comparison-platform"
            value={comparisonPlatform}
            onChange={(e) => setComparisonPlatform(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select platform to compare</option>
            {scores
              .filter((score) => score.platformId !== selectedPlatform)
              .map((score) => (
                <option key={score.platformId} value={score.platformId}>
                  {score.platformName} ({score.totalScore} pts)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Comparison Explanation */}
      {comparisonExplanation && (
        <div className="p-4 bg-brand-900/20 border border-brand-700 rounded-lg">
          <h3 className="text-lg font-medium text-brand-300 mb-2">
            Comparison Summary
          </h3>
          <p className="text-neutral-200">{comparisonExplanation}</p>
        </div>
      )}

      {/* Score Breakdown Table */}
      {selectedScore && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-lg font-medium">
              {selectedScore.platformName} - Score Details
            </h3>
            <p className="text-sm text-neutral-400">
              Total Score: {selectedScore.totalScore}/100
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-800/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">
                    Criterion
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-300">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-300">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-neutral-300">
                    Contribution
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300 hidden lg:table-cell">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {breakdown.map((criterion) => (
                  <tr key={criterion.name} className="hover:bg-neutral-800/30">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium">{criterion.label}</div>
                        <div className="text-sm text-neutral-400 lg:hidden">
                          {criterion.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{
                              width: `${criterion.normalizedValue * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-neutral-300 min-w-[3ch]">
                          {Math.round(criterion.normalizedValue * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-neutral-300">
                      {Math.round(criterion.weight * 100)}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-brand-400">
                        {criterion.contribution.toFixed(1)}
                      </span>
                      <span className="text-neutral-500 text-sm"> pts</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-400 hidden lg:table-cell max-w-md">
                      {criterion.reasoning}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium">Total</td>
                  <td className="px-4 py-3 text-center">-</td>
                  <td className="px-4 py-3 text-center font-medium">100%</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-brand-400 text-lg">
                      {selectedScore.totalScore}
                    </span>
                    <span className="text-neutral-500 text-sm"> pts</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Explanation Cards */}
      <div className="lg:hidden space-y-4">
        <h3 className="text-lg font-medium">Detailed Explanations</h3>
        {breakdown.map((criterion) => (
          <div
            key={criterion.name}
            className="p-4 bg-neutral-900 rounded-lg border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{criterion.label}</span>
              <span className="text-brand-400 font-medium">
                {criterion.contribution.toFixed(1)} pts
              </span>
            </div>
            <p className="text-sm text-neutral-400">{criterion.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
