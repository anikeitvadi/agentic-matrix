'use client'

import Link from 'next/link'
import type { PlatformScore } from '@/lib/scoring/types'

interface PlatformScoresProps {
  scores: PlatformScore[]
  maxDisplay?: number
}

export function PlatformScores({ scores, maxDisplay = 3 }: PlatformScoresProps) {
  const topScores = scores.slice(0, maxDisplay)
  const winner = topScores[0]
  const challengers = topScores.slice(1)

  if (!winner) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-neutral-400">
        No platforms scored yet. Complete the assessment to see recommendations.
      </div>
    )
  }

  const hardFailures = winner.gateFailures.filter((g) => g.severity === 'hard')
  const softWarnings = winner.gateFailures.filter((g) => g.severity === 'soft')
  const annualCost = winner.recommendationSummary.estimatedAnnualCost

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <span className="section-kicker">Recommendation</span>
        <h2 className="mt-3 font-heading text-3xl font-bold text-white">
          {winner.passedAllGates ? 'Top platform match' : 'Closest available option'}
        </h2>
      </div>

      {/* Winner card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full border border-brand-700/50 bg-brand-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
            Rank 1
          </span>
          {winner.passedAllGates && (
            <span className="rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
              Clears all gates
            </span>
          )}
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
            winner.implementationRisk.label === 'Low' ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-400' :
            winner.implementationRisk.label === 'Medium' ? 'border-amber-800/50 bg-amber-950/40 text-amber-400' :
            'border-red-800/50 bg-red-950/40 text-red-400'
          }`}>
            Risk: {winner.implementationRisk.label}
          </span>
          <span className="rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-xs font-medium text-neutral-300">
            Evidence: {winner.confidence.label}
          </span>
        </div>

        {/* Platform name + score */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/platforms/${winner.platformId}`}
              className="font-heading text-2xl font-bold text-white hover:text-brand-400 transition-colors"
            >
              {winner.platformName}
            </Link>
            <p className="mt-1 text-sm text-neutral-400">
              {winner.recommendationSummary.headline}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-brand-400">{winner.totalScore}</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">score</div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-950/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Annual est.</div>
            <div className="mt-1 text-lg font-bold text-white">
              {annualCost !== null ? formatCurrencyShort(annualCost) : 'N/A'}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-950/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Requirements</div>
            <div className="mt-1 text-lg font-bold text-white">
              {winner.evidence.hardRequirementsTotal > 0
                ? `${winner.evidence.hardRequirementsMet}/${winner.evidence.hardRequirementsTotal}`
                : 'None set'}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-950/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Signals</div>
            <div className="mt-1 text-lg font-bold text-white">
              {winner.recommendationSummary.matchCount}/{winner.recommendationSummary.totalSignals}
            </div>
          </div>
        </div>

        {/* Gate failures */}
        {(hardFailures.length > 0 || softWarnings.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {hardFailures.map((g) => (
              <span key={`${g.gate}-${g.requirement}`} className="rounded-full border border-red-800/50 bg-red-950/40 px-3 py-1 text-xs text-red-400">
                Missing {g.requirement}
              </span>
            ))}
            {softWarnings.map((g) => (
              <span key={`${g.gate}-${g.requirement}`} className="rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs text-amber-400">
                {g.requirement}
              </span>
            ))}
          </div>
        )}

        {/* Strengths + caveats */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Strengths</div>
            <div className="space-y-1.5">
              {winner.recommendationSummary.strengths.length > 0 ? (
                winner.recommendationSummary.strengths.map((s) => (
                  <div key={s} className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-300">
                    {s}
                  </div>
                ))
              ) : (
                <div className="text-sm text-neutral-500">No standout strengths recorded</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Watch</div>
            <div className="space-y-1.5">
              {winner.recommendationSummary.caveats.length > 0 ? (
                winner.recommendationSummary.caveats.map((c) => (
                  <div key={c} className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-sm text-amber-300">
                    {c}
                  </div>
                ))
              ) : (
                <div className="text-sm text-neutral-500">No material caveats</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Challengers */}
      {challengers.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold text-white mb-3">Alternatives</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {challengers.map((score, index) => (
              <div
                key={score.platformId}
                className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-500">Rank {index + 2}</div>
                    <Link
                      href={`/platforms/${score.platformId}`}
                      className="mt-1 block font-heading text-lg font-semibold text-white hover:text-brand-400 transition-colors"
                    >
                      {score.platformName}
                    </Link>
                    <p className="mt-1 text-sm text-neutral-400">{score.recommendationSummary.headline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-white">{score.totalScore}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    score.implementationRisk.label === 'Low' ? 'border-emerald-800/50 text-emerald-400' :
                    score.implementationRisk.label === 'Medium' ? 'border-amber-800/50 text-amber-400' :
                    'border-red-800/50 text-red-400'
                  }`}>
                    Risk: {score.implementationRisk.label}
                  </span>
                  {score.recommendationSummary.estimatedAnnualCost !== null && (
                    <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                      {formatCurrencyShort(score.recommendationSummary.estimatedAnnualCost)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`
  return `$${Math.round(value)}`
}
