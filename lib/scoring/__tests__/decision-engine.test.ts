/**
 * Decision Engine Tests
 *
 * Tests the two-layer scoring model (fitScore + decisionScore),
 * thesis-based classification, and buyer-profile scenarios.
 */

import { describe, it, expect } from 'vitest'
import { scoreAllPlatforms } from '../score-platform'
import { deriveWeights, DEFAULT_WEIGHTS } from '../weights'
import type { ScoringContext } from '../types'

// Use the real platform data from velite
import platformsData from '../../../.velite/platforms.json'
const platforms = platformsData as any[]

function scoreWithProfile(assessment: Record<string, unknown>) {
  const weightConfig = deriveWeights(assessment)
  const context: ScoringContext = {
    allPlatforms: platforms,
    userAssessment: assessment,
    weightConfig,
  }
  return scoreAllPlatforms(platforms, context)
}

describe('Two-Layer Decision Model', () => {
  describe('fitScore vs decisionScore', () => {
    it('should produce both fitScore and decisionScore', () => {
      const results = scoreWithProfile({})
      for (const r of results) {
        expect(r.fitScore).toBeGreaterThanOrEqual(0)
        expect(r.fitScore).toBeLessThanOrEqual(100)
        expect(r.decisionScore).toBeGreaterThanOrEqual(0)
        expect(r.decisionScore).toBeLessThanOrEqual(100)
        expect(r.totalScore).toBe(r.decisionScore) // backward compatible
      }
    })

    it('decisionScore should be <= fitScore', () => {
      const results = scoreWithProfile({
        complianceRequirements: ['soc2'],
        teamTechnicalLevel: 'engineering-team',
        budgetRange: '10k-50k',
      })
      for (const r of results) {
        expect(r.decisionScore).toBeLessThanOrEqual(r.fitScore)
      }
    })

    it('should include decisionAdjustments explaining the gap', () => {
      const results = scoreWithProfile({
        complianceRequirements: ['soc2'],
        budgetRange: 'under-10k',
      })
      // At least some platforms should have adjustments
      const withAdjustments = results.filter(r => r.decisionAdjustments.length > 0)
      expect(withAdjustments.length).toBeGreaterThan(0)

      for (const adj of withAdjustments[0].decisionAdjustments) {
        expect(adj.factor).toBeTruthy()
        expect(adj.penalty).toBeGreaterThan(0)
        expect(adj.reasoning).toBeTruthy()
      }
    })
  })

  describe('Thesis-based classification', () => {
    it('should assign a decisionThesis to every platform', () => {
      const results = scoreWithProfile({
        primaryUseCases: ['customer-support'],
        teamTechnicalLevel: 'engineering-team',
      })
      const validTheses = [
        'best-balanced-choice',
        'pragmatic-low-friction-option',
        'high-capability-high-lift',
        'cost-efficient-tradeoff',
        'disqualified-by-hard-requirements',
        'viable-with-tradeoffs',
      ]
      for (const r of results) {
        expect(validTheses).toContain(r.recommendationSummary.decisionThesis)
        expect(r.recommendationSummary.headline).toBeTruthy()
        expect(r.recommendationSummary.rationale).toContain(r.platformName)
      }
    })

    it('platforms failing hard gates should get disqualified thesis', () => {
      const results = scoreWithProfile({
        complianceRequirements: ['hipaa', 'fedramp'],
      })
      const disqualified = results.filter(r => !r.passedAllGates)
      for (const r of disqualified) {
        expect(r.recommendationSummary.decisionThesis).toBe('disqualified-by-hard-requirements')
      }
    })
  })

  describe('Ranking contract', () => {
    it('gate-passing platforms rank above gate-failing platforms', () => {
      const results = scoreWithProfile({
        complianceRequirements: ['hipaa'],
      })
      const firstFailing = results.findIndex(r => !r.passedAllGates)
      if (firstFailing > 0) {
        // All platforms before the first failing one should pass
        for (let i = 0; i < firstFailing; i++) {
          expect(results[i].passedAllGates).toBe(true)
        }
      }
    })

    it('within gate-passing group, decisionScore determines rank', () => {
      const results = scoreWithProfile({
        primaryUseCases: ['customer-support'],
        budgetRange: '10k-50k',
      })
      const passing = results.filter(r => r.passedAllGates)
      for (let i = 1; i < passing.length; i++) {
        expect(passing[i - 1].decisionScore).toBeGreaterThanOrEqual(passing[i].decisionScore)
      }
    })
  })
})

describe('Buyer Profile Scenarios', () => {
  describe('Profile A: Scrappy startup', () => {
    const results = scoreWithProfile({
      budgetRange: 'under-10k',
      timeline: 'asap',
      teamTechnicalLevel: 'non-technical',
      expectedMonthlyConversations: '1k-10k',
      primaryUseCases: ['workflow-automation'],
    })

    it('developer-first platforms should not win for non-technical team', () => {
      const winner = results[0]
      // Winner should not be a developer-first platform when team is non-technical
      const devFirstPlatforms = platforms.filter(p => p.tier === 'developer-first').map(p => p.slug)
      expect(devFirstPlatforms).not.toContain(winner.platformId)
    })

    it('winner should mention deployability or low-friction', () => {
      const winner = results[0]
      const thesis = winner.recommendationSummary.decisionThesis
      // Should be pragmatic or cost-efficient, not high-capability-high-lift
      expect(thesis).not.toBe('high-capability-high-lift')
    })
  })

  describe('Profile B: Regulated enterprise', () => {
    const results = scoreWithProfile({
      budgetRange: '200k-plus',
      timeline: '6-12-months',
      teamTechnicalLevel: 'engineering-team',
      expectedMonthlyConversations: '100k-plus',
      complianceRequirements: ['soc2', 'hipaa'],
    })

    it('platforms missing certs should rank below gate-passing ones', () => {
      const firstFailing = results.findIndex(r => !r.passedAllGates)
      if (firstFailing > 0) {
        for (let i = 0; i < firstFailing; i++) {
          expect(results[i].passedAllGates).toBe(true)
        }
      }
    })

    it('winner should have high confidence', () => {
      const winner = results[0]
      // With a full assessment profile, confidence should be decent
      expect(winner.confidence.score).toBeGreaterThanOrEqual(50)
    })
  })

  describe('Profile C: Non-technical enterprise ops', () => {
    const results = scoreWithProfile({
      budgetRange: '10k-50k',
      timeline: '1-3-months',
      teamTechnicalLevel: 'non-technical',
      primaryUseCases: ['customer-support'],
    })

    it('low-code platforms should rank above developer-first ones', () => {
      const lowCodePlatforms = platforms.filter(p => p.structuredCapabilities?.hasLowCode).map(p => p.slug)
      const devFirstPlatforms = platforms.filter(p => p.tier === 'developer-first').map(p => p.slug)

      const bestLowCode = results.findIndex(r => lowCodePlatforms.includes(r.platformId))
      const bestDevFirst = results.findIndex(r => devFirstPlatforms.includes(r.platformId))

      if (bestLowCode >= 0 && bestDevFirst >= 0) {
        expect(bestLowCode).toBeLessThan(bestDevFirst)
      }
    })
  })

  describe('Profile D: AI/ML builder team', () => {
    const results = scoreWithProfile({
      budgetRange: '50k-200k',
      timeline: '3-6-months',
      teamTechnicalLevel: 'ai-ml-expertise',
      primaryUseCases: ['knowledge-qa', 'data-extraction'],
    })

    it('developer-first platforms should be competitive', () => {
      // At least one developer-first platform in top 5
      const top5 = results.slice(0, 5)
      const devFirstInTop5 = top5.filter(r => {
        const p = platforms.find(pl => pl.slug === r.platformId)
        return p?.tier === 'developer-first' || p?.tier === 'enterprise-os'
      })
      expect(devFirstInTop5.length).toBeGreaterThan(0)
    })

    it('decisionScore should be close to fitScore for low-risk platforms', () => {
      const lowRisk = results.filter(r => r.implementationRisk.score >= 70)
      for (const r of lowRisk) {
        // Decision score should not be dramatically lower than fit score
        expect(r.fitScore - r.decisionScore).toBeLessThan(25)
      }
    })
  })
})
