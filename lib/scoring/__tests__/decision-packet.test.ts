import { describe, expect, it } from 'vitest'
import {
  buildDecisionPacketHtml,
  buildDecisionPacketMarkdown,
} from '../decision-packet'
import type { PlatformScore } from '../types'

function makeScore(platformName: string, fitScore: number, annualCost: number): PlatformScore {
  const decisionScore = fitScore - 4 // simulate small penalty
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
    totalScore: decisionScore,
    fitScore,
    decisionScore,
    decisionAdjustments: [
      { factor: 'Evidence gaps', penalty: 4, reasoning: 'Limited production references' },
    ],
    criteriaScores: criteria,
    auditTrail: [],
    gateFailures: [],
    passedAllGates: true,
    implementationRisk: {
      score: 72,
      label: 'Medium',
      factors: [],
    },
    confidence: {
      score: 65,
      label: 'Medium',
      evidenceBasis: ['Published pricing', 'SOC 2 cert'],
      assumptions: ['Team ramp-up time estimated'],
    },
    evidence: {
      annualCostEstimate: annualCost,
      hardRequirementsMet: 4,
      hardRequirementsTotal: 5,
      certsMissing: [],
      integrationsMet: ['aws'],
      integrationsMissing: [],
      deploymentOptions: ['cloud'],
      modelFlexibility: 'multi-model',
      observability: 'built-in',
      vendorViability: 'established',
      ecosystemMaturity: 'growing',
      heuristicFlags: [],
      costConfidence: 'Medium',
      assumptionLevel: 'Low',
    },
    recommendationSummary: {
      matchCount: 4,
      totalSignals: 5,
      headline: '4/5 key requirements matched',
      rationale: `${platformName} rationale`,
      strengths: ['Compliance: SOC 2', 'Stack fit: AWS'],
      caveats: ['Estimated annual platform cost exceeds your stated budget'],
      estimatedAnnualCost: annualCost,
      fitScore,
      decisionScore,
      decisionThesis: 'best-balanced-choice',
      costConfidence: 'Medium',
      assumptionLevel: 'Low',
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

    expect(markdown).toContain('# Agentic Matrix Recommendation Packet')
    expect(markdown).toContain('## Assessment Snapshot')
    expect(markdown).toContain('**WinnerOS** (80/100')
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
    expect(html).toContain('Platform Recommendation')
    expect(html).toContain('WinnerOS')
    expect(html).toContain('80/100')
    expect(html).toContain('What Would Change This Recommendation')
  })

  it('renders decision score and fit score in html metrics', () => {
    const html = buildDecisionPacketHtml({
      assessment,
      scores,
      generatedAt: new Date('2026-03-24'),
    })

    expect(html).toContain('Decision Score')
    expect(html).toContain('Fit Score')
    expect(html).toContain('Score Bridge')
    expect(html).toContain('Evidence gaps')
  })
})
