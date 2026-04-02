import { describe, expect, it } from 'vitest'
import { buildDecisionMemo } from '../decision-memo'
import type { PlatformScore } from '../types'

function makeScore({
  platformId,
  platformName,
  totalScore,
  annualCost,
  strengths = [],
  caveats = [],
  normalizedValues,
}: {
  platformId: string
  platformName: string
  totalScore: number
  annualCost: number
  strengths?: string[]
  caveats?: string[]
  normalizedValues: {
    integrationFit: number
    complianceMatch: number
    budgetFit: number
    featureMatch: number
    stackCompatibility: number
  }
}): PlatformScore {
  const criterionNames = [
    'integrationFit',
    'complianceMatch',
    'budgetFit',
    'featureMatch',
    'stackCompatibility',
  ] as const

  return {
    platformId,
    platformName,
    totalScore,
    criteriaScores: criterionNames.map((name) => ({
      name,
      weight: 0.2,
      value: normalizedValues[name],
      normalizedValue: normalizedValues[name],
      higherIsBetter: true,
    })),
    auditTrail: [],
    recommendationSummary: {
      matchCount: strengths.length,
      totalSignals: 5,
      headline: `${strengths.length}/5 requirements matched`,
      rationale: `${platformName} rationale`,
      strengths,
      caveats,
      estimatedAnnualCost: annualCost,
    },
  }
}

describe('buildDecisionMemo', () => {
  it('builds a recruiter-facing summary for the top recommendation', () => {
    const scores = [
      makeScore({
        platformId: 'winner',
        platformName: 'WinnerOS',
        totalScore: 84,
        annualCost: 36_000,
        strengths: ['Compliance: SOC 2, HIPAA', 'Stack fit: AWS', 'Use cases: Workflow automation'],
        normalizedValues: {
          integrationFit: 0.7,
          complianceMatch: 0.95,
          budgetFit: 0.5,
          featureMatch: 0.85,
          stackCompatibility: 0.8,
        },
      }),
      makeScore({
        platformId: 'budget-alt',
        platformName: 'LeanFlow',
        totalScore: 78,
        annualCost: 12_000,
        caveats: ['Missing some of your required compliance needs'],
        normalizedValues: {
          integrationFit: 0.65,
          complianceMatch: 0.45,
          budgetFit: 0.95,
          featureMatch: 0.8,
          stackCompatibility: 0.75,
        },
      }),
      makeScore({
        platformId: 'integration-alt',
        platformName: 'ConnectPro',
        totalScore: 76,
        annualCost: 42_000,
        normalizedValues: {
          integrationFit: 0.98,
          complianceMatch: 0.55,
          budgetFit: 0.35,
          featureMatch: 0.7,
          stackCompatibility: 0.72,
        },
      }),
    ]

    const memo = buildDecisionMemo(scores)

    expect(memo).not.toBeNull()
    expect(memo?.winner.platformName).toBe('WinnerOS')
    expect(memo?.winner.reasons.length).toBeGreaterThan(0)
    expect(memo?.alternatives).toHaveLength(2)
    expect(memo?.alternatives[0].whyNot).toContain('WinnerOS')
    expect(
      memo?.scenarios.some((scenario) => scenario.title === 'If budget becomes the hard gate')
    ).toBe(true)
    expect(
      memo?.scenarios.some((scenario) => scenario.title === 'If native integrations matter more')
    ).toBe(true)
  })

  it('returns null when no scores are available', () => {
    expect(buildDecisionMemo([])).toBeNull()
  })
})
