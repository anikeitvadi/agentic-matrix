import { describe, expect, it } from 'vitest'
import {
  buildDecisionPacketHtml,
  buildDecisionPacketMarkdown,
} from '../decision-packet'
import type { PlatformScore } from '../types'

function makeScore(platformName: string, totalScore: number, annualCost: number): PlatformScore {
  const criteria = [
    'integrationFit',
    'complianceMatch',
    'budgetFit',
    'featureMatch',
    'stackCompatibility',
  ].map((name) => ({
    name,
    weight: 0.2,
    value: 0.8,
    normalizedValue: 0.8,
    higherIsBetter: true,
  }))

  return {
    platformId: platformName.toLowerCase(),
    platformName,
    totalScore,
    criteriaScores: criteria,
    auditTrail: [],
    recommendationSummary: {
      matchCount: 4,
      totalSignals: 5,
      headline: '4/5 key requirements matched',
      rationale: `${platformName} rationale`,
      strengths: ['Compliance: SOC 2', 'Stack fit: AWS'],
      caveats: ['Estimated annual platform cost exceeds your stated budget'],
      estimatedAnnualCost: annualCost,
    },
  }
}

describe('decision packet builders', () => {
  const scores = [
    makeScore('WinnerOS', 84, 36000),
    makeScore('LeanFlow', 78, 12000),
    makeScore('ConnectPro', 76, 42000),
  ]

  const assessment = {
    organizationSize: '51-200',
    budgetRange: '10k-50k',
    primaryUseCases: ['workflow-automation'],
    currentStack: ['aws', 'hybrid'],
    teamTechnicalLevel: 'engineering-team',
  }

  it('builds markdown with key sections', () => {
    const markdown = buildDecisionPacketMarkdown({
      assessment,
      scores,
      generatedAt: new Date('2026-03-24'),
    })

    expect(markdown).toContain('# Agentic Decisions Recommendation Packet')
    expect(markdown).toContain('## Assessment Snapshot')
    expect(markdown).toContain('**WinnerOS** (84/100')
    expect(markdown).toContain('### Why Not The Next Best Options')
    expect(markdown).toContain('Top Ranked Platforms')
  })

  it('builds printable html with recommendation data', () => {
    const html = buildDecisionPacketHtml({
      assessment,
      scores,
      generatedAt: new Date('2026-03-24'),
    })

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Agentic Decisions Recommendation Packet')
    expect(html).toContain('WinnerOS')
    expect(html).toContain('What Would Change The Recommendation')
  })
})
