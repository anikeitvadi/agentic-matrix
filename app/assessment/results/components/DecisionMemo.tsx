'use client'

import Link from 'next/link'
import type { PlatformScore } from '@/lib/scoring/types'
import { buildDecisionMemo } from '@/lib/scoring/decision-memo'

interface DecisionMemoProps {
  scores: PlatformScore[]
}

export function DecisionMemo({ scores }: DecisionMemoProps) {
  const memo = buildDecisionMemo(scores)

  if (!memo) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="paper-eyebrow">Decision memo</p>
          <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl">
            Why the current leader wins.
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Deterministic summary of why the current leader won and what could change the call.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-brand-800/50 bg-brand-900/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
          {memo.winner.confidenceLabel}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="paper-eyebrow">
                Current Recommendation
              </p>
              <Link
                href={`/platforms/${memo.winner.platformId}`}
                className="mt-3 inline-block font-heading text-3xl text-white transition-colors hover:text-brand-400"
              >
                {memo.winner.platformName}
              </Link>
              <p className="mt-4 text-sm leading-7 text-neutral-400">{memo.winner.lead}</p>
              <p className="mt-3 text-sm leading-7 text-neutral-500">{memo.winner.rationale}</p>
            </div>
            <div className="rounded-2xl bg-neutral-950 px-5 py-4 text-right text-white">
              <div className="text-3xl font-bold">{memo.winner.totalScore}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                weighted score
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {memo.winner.reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-2xl border border-emerald-800/50 bg-emerald-950/40 px-4 py-4 text-sm leading-6 text-emerald-400"
              >
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-6 text-white sm:p-7">
          <p className="paper-eyebrow text-neutral-400">
            What Would Change This Call
          </p>
          <div className="mt-4 space-y-4">
            {memo.scenarios.map((scenario) => (
              <div
                key={scenario.title}
                className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-4"
              >
                <h3 className="text-sm font-medium text-white">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{scenario.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {memo.alternatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-2xl text-white">Why not the next best options</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {memo.alternatives.map((alternative) => (
              <div
                key={alternative.platformId}
                className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/platforms/${alternative.platformId}`}
                      className="text-lg font-semibold text-white transition-colors hover:text-brand-400"
                    >
                      {alternative.platformName}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {alternative.whyNot}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-neutral-800/30 border border-neutral-800 px-3 py-2 text-right">
                    <div className="text-sm font-semibold text-white">
                      -{alternative.scoreGap} pts
                    </div>
                    <div className="text-xs text-neutral-500">vs winner</div>
                  </div>
                </div>

                {alternative.strongerAreas.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {alternative.strongerAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-400"
                      >
                        Stronger on {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
