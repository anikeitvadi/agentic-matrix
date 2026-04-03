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
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 text-neutral-400">
        No platforms scored yet. Complete the assessment to see recommendations.
      </div>
    )
  }

  const noPlatformFullyClears = !winner.passedAllGates
  const hardFailures = winner.gateFailures.filter((gate) => gate.severity === 'hard')
  const softWarnings = winner.gateFailures.filter((gate) => gate.severity === 'soft')
  const annualCost = winner.recommendationSummary.estimatedAnnualCost
  const requirementsLabel =
    winner.evidence.hardRequirementsTotal > 0
      ? `${winner.evidence.hardRequirementsMet}/${winner.evidence.hardRequirementsTotal} hard requirements met`
      : 'No hard requirements specified'

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-kicker">Recommendation dossier</span>
          <h2 className="mt-4 font-heading text-4xl text-white sm:text-5xl">
            {noPlatformFullyClears ? 'Closest available option' : 'Recommended platform'}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400 sm:text-base">
            {noPlatformFullyClears
              ? 'No platform clears every hard gate as entered. This is the strongest available option after gating, scoring, cost fit, and implementation risk are combined.'
              : 'One current leader based on weighted fit, explicit requirement coverage, implementation risk, and pricing-backed cost modeling.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetaBadge label="Evidence" value={winner.confidence.label} tone={confidenceTone(winner.confidence.label)} />
          <MetaBadge label="Risk" value={winner.implementationRisk.label} tone={riskTone(winner.implementationRisk.label)} />
          <MetaBadge
            label="Annual"
            value={annualCost !== null ? formatCurrencyShort(annualCost) : 'N/A'}
            tone="neutral"
          />
        </div>
      </div>

      <article className="surface-card-strong surface-grid overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-brand-700/50 bg-brand-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                Rank 1
              </span>
              {!noPlatformFullyClears && (
                <span className="inline-flex items-center rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                  Clears stated gates
                </span>
              )}
              {noPlatformFullyClears && (
                <span className="inline-flex items-center rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                  Requirement tradeoffs remain
                </span>
              )}
            </div>

            <Link
              href={`/platforms/${winner.platformId}`}
              className="mt-5 inline-block font-heading text-4xl text-white transition-colors hover:text-brand-400 sm:text-5xl"
            >
              {winner.platformName}
            </Link>
            <p className="mt-4 text-lg text-neutral-200">
              {winner.recommendationSummary.headline}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400 sm:text-base">
              {winner.recommendationSummary.rationale}
            </p>

            {(hardFailures.length > 0 || softWarnings.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {hardFailures.map((gate) => (
                  <span
                    key={`${gate.gate}-${gate.requirement}`}
                    className="inline-flex items-center rounded-full border border-red-800/50 bg-red-950/40 px-3 py-1 text-xs font-medium text-red-300"
                  >
                    Missing {gate.requirement}
                  </span>
                ))}
                {softWarnings.map((gate) => (
                  <span
                    key={`${gate.gate}-${gate.requirement}`}
                    className="inline-flex items-center rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-300"
                  >
                    {gate.requirement}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid shrink-0 gap-3 sm:grid-cols-3 xl:w-[23rem] xl:grid-cols-1">
            <MetricCard label="Weighted score" value={String(winner.totalScore)} detail="Overall ranking output" />
            <MetricCard
              label="Annual estimate"
              value={annualCost !== null ? formatCurrencyShort(annualCost) : 'N/A'}
              detail="Pricing-backed current fit"
            />
            <MetricCard label="Requirements" value={requirementsLabel} detail="Explicit requirement coverage" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="paper-eyebrow text-neutral-500">Why it fits</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {winner.recommendationSummary.strengths.length > 0 ? (
                winner.recommendationSummary.strengths.map((strength) => (
                  <div
                    key={strength}
                    className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 px-4 py-4 text-sm leading-6 text-emerald-300"
                  >
                    {strength}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-400 md:col-span-2">
                  No standout strength signals were recorded for this platform.
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="paper-eyebrow text-neutral-500">Watchouts</p>
            <div className="mt-3 space-y-3">
              {winner.recommendationSummary.caveats.length > 0 ? (
                winner.recommendationSummary.caveats.map((caveat) => (
                  <div
                    key={caveat}
                    className="rounded-2xl border border-amber-800/50 bg-amber-950/30 px-4 py-4 text-sm leading-6 text-amber-300"
                  >
                    {caveat}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-400">
                  No material caveats surfaced in the current assessment profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {challengers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-heading text-2xl text-white">Closest alternatives</h3>
            <p className="text-sm text-neutral-500">Useful if priorities shift or constraints tighten.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {challengers.map((score, index) => {
              const altCost = score.recommendationSummary.estimatedAnnualCost
              const strongestArea = score.recommendationSummary.strengths[0] ?? 'Competes on a narrower set of criteria'

              return (
                <article
                  key={score.platformId}
                  className="surface-card rounded-[1.6rem] p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="paper-eyebrow text-neutral-500">Rank {index + 2}</div>
                      <Link
                        href={`/platforms/${score.platformId}`}
                        className="mt-2 inline-block text-xl font-semibold text-white transition-colors hover:text-brand-400"
                      >
                        {score.platformName}
                      </Link>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">
                        {score.recommendationSummary.headline}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/80 px-3 py-2 text-right">
                      <div className="text-2xl font-bold text-white">{score.totalScore}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">score</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MetaBadge label="Risk" value={score.implementationRisk.label} tone={riskTone(score.implementationRisk.label)} />
                    <MetaBadge label="Evidence" value={score.confidence.label} tone={confidenceTone(score.confidence.label)} />
                    <MetaBadge
                      label="Annual"
                      value={altCost !== null ? formatCurrencyShort(altCost) : 'N/A'}
                      tone="neutral"
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-4 text-sm leading-6 text-neutral-300">
                    <span className="font-medium text-white">Why revisit it:</span> {strongestArea}.
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/75 px-4 py-4">
      <div className="paper-eyebrow text-neutral-500">{label}</div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs leading-5 text-neutral-500">{detail}</div>
    </div>
  )
}

function MetaBadge({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'positive' | 'warning' | 'negative' | 'neutral'
}) {
  const toneClass =
    tone === 'positive'
      ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-300'
      : tone === 'warning'
        ? 'border-amber-800/50 bg-amber-950/40 text-amber-300'
        : tone === 'negative'
          ? 'border-red-800/50 bg-red-950/40 text-red-300'
          : 'border-neutral-800/70 bg-neutral-950/60 text-neutral-300'

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="text-current">{value}</span>
    </span>
  )
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`
  }
  return `$${Math.round(value)}`
}

function riskTone(label: PlatformScore['implementationRisk']['label']): 'positive' | 'warning' | 'negative' {
  if (label === 'Low') return 'positive'
  if (label === 'Medium') return 'warning'
  return 'negative'
}

function confidenceTone(label: PlatformScore['confidence']['label']): 'positive' | 'warning' | 'negative' {
  if (label === 'High') return 'positive'
  if (label === 'Medium') return 'warning'
  return 'negative'
}
