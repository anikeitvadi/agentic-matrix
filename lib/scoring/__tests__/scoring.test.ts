/**
 * Scoring Engine Tests
 *
 * TDD tests for SAW (Simple Additive Weighting) scoring engine.
 * Tests weight derivation from assessment and SAW score calculation.
 */

import { describe, it, expect } from 'vitest'
import { deriveWeights, DEFAULT_WEIGHTS } from '../weights'
import { calculateSAW, scorePlatform, scoreAllPlatforms } from '../score-platform'
import type { WeightConfig, ScoringContext } from '../types'

// Mock platform data matching velite schema
const mockPlatforms = [
  {
    slug: 'zapier',
    title: 'Zapier',
    tier: 'ipaas-agent' as const,
    capabilities: ['slack', 'github', 'jira', 'salesforce', 'hubspot'],
    pricing: { model: 'per-task', details: '$0-$29/month' },
    description: 'Automation platform',
    lastVerified: '2024-01-15',
    officialDocs: 'https://zapier.com/docs',
    body: '',
  },
  {
    slug: 'n8n',
    title: 'n8n',
    tier: 'developer-first' as const,
    capabilities: ['slack', 'github', 'custom-nodes', 'self-hosted'],
    pricing: { model: 'open-source', details: 'Free self-hosted' },
    description: 'Open source automation',
    lastVerified: '2024-01-15',
    officialDocs: 'https://n8n.io/docs',
    body: '',
  },
  {
    slug: 'workato',
    title: 'Workato',
    tier: 'enterprise-os' as const,
    capabilities: ['slack', 'github', 'jira', 'salesforce', 'soc2', 'hipaa', 'enterprise-sso'],
    pricing: { model: 'enterprise', details: 'Custom pricing' },
    description: 'Enterprise automation',
    lastVerified: '2024-01-15',
    officialDocs: 'https://workato.com/docs',
    body: '',
  },
]

describe('Weight Derivation', () => {
  describe('DEFAULT_WEIGHTS', () => {
    it('should have equal weights summing to 1.0', () => {
      const weights = DEFAULT_WEIGHTS
      const sum =
        weights.integrationFit +
        weights.complianceMatch +
        weights.budgetFit +
        weights.featureMatch +
        weights.stackCompatibility

      expect(sum).toBeCloseTo(1.0, 10)
    })

    it('should have each weight at 0.20', () => {
      expect(DEFAULT_WEIGHTS.integrationFit).toBe(0.2)
      expect(DEFAULT_WEIGHTS.complianceMatch).toBe(0.2)
      expect(DEFAULT_WEIGHTS.budgetFit).toBe(0.2)
      expect(DEFAULT_WEIGHTS.featureMatch).toBe(0.2)
      expect(DEFAULT_WEIGHTS.stackCompatibility).toBe(0.2)
    })
  })

  describe('deriveWeights', () => {
    it('should increase integrationFit weight when user has many integrations', () => {
      const weights = deriveWeights({
        integrationNeeds: ['Slack', 'GitHub', 'Jira', 'Salesforce', 'HubSpot'],
      })

      // More integrations should increase integrationFit weight
      expect(weights.integrationFit).toBeGreaterThan(DEFAULT_WEIGHTS.integrationFit)
    })

    it('should increase complianceMatch weight when user has compliance requirements', () => {
      const weights = deriveWeights({
        complianceRequirements: ['SOC2', 'HIPAA'],
      })

      expect(weights.complianceMatch).toBeGreaterThan(DEFAULT_WEIGHTS.complianceMatch)
    })

    it('should increase budgetFit weight when user has tight budget', () => {
      const weights = deriveWeights({
        budgetRange: 'under-1000',
      })

      expect(weights.budgetFit).toBeGreaterThan(DEFAULT_WEIGHTS.budgetFit)
    })

    it('should never exceed 0.35 for any single weight', () => {
      // Even with maximum emphasis on one criterion
      const weights = deriveWeights({
        integrationNeeds: ['Slack', 'GitHub', 'Jira', 'Salesforce', 'HubSpot', 'Notion', 'Asana'],
        complianceRequirements: ['SOC2', 'HIPAA', 'GDPR', 'ISO27001'],
        budgetRange: 'under-500',
      })

      expect(weights.integrationFit).toBeLessThanOrEqual(0.35)
      expect(weights.complianceMatch).toBeLessThanOrEqual(0.35)
      expect(weights.budgetFit).toBeLessThanOrEqual(0.35)
      expect(weights.featureMatch).toBeLessThanOrEqual(0.35)
      expect(weights.stackCompatibility).toBeLessThanOrEqual(0.35)
    })

    it('should always sum to 1.0', () => {
      const testCases = [
        { integrationNeeds: ['Slack'] },
        { complianceRequirements: ['SOC2', 'HIPAA'] },
        { budgetRange: 'under-1000' as const },
        {
          integrationNeeds: ['Slack', 'GitHub'],
          complianceRequirements: ['SOC2'],
          budgetRange: 'under-5000' as const,
        },
        {}, // Empty assessment
      ]

      for (const assessment of testCases) {
        const weights = deriveWeights(assessment)
        const sum =
          weights.integrationFit +
          weights.complianceMatch +
          weights.budgetFit +
          weights.featureMatch +
          weights.stackCompatibility

        expect(sum).toBeCloseTo(1.0, 10)
      }
    })
  })
})

describe('SAW Scoring', () => {
  describe('calculateSAW', () => {
    it('should calculate weighted sum correctly', () => {
      // 0.3 * 0.8 + 0.7 * 0.5 = 0.24 + 0.35 = 0.59 => 59
      const score = calculateSAW([
        { weight: 0.3, normalizedValue: 0.8 },
        { weight: 0.7, normalizedValue: 0.5 },
      ])

      expect(score).toBe(59)
    })

    it('should return 0 for empty criteria', () => {
      const score = calculateSAW([])
      expect(score).toBe(0)
    })

    it('should return 100 for perfect scores across all criteria', () => {
      const score = calculateSAW([
        { weight: 0.25, normalizedValue: 1.0 },
        { weight: 0.25, normalizedValue: 1.0 },
        { weight: 0.25, normalizedValue: 1.0 },
        { weight: 0.25, normalizedValue: 1.0 },
      ])

      expect(score).toBe(100)
    })

    it('should return 0 for zero scores across all criteria', () => {
      const score = calculateSAW([
        { weight: 0.5, normalizedValue: 0 },
        { weight: 0.5, normalizedValue: 0 },
      ])

      expect(score).toBe(0)
    })

    it('should round to nearest integer', () => {
      // 0.5 * 0.333 + 0.5 * 0.666 = 0.4995 => 50
      const score = calculateSAW([
        { weight: 0.5, normalizedValue: 0.333 },
        { weight: 0.5, normalizedValue: 0.666 },
      ])

      expect(score).toBe(50) // (0.333 + 0.666) / 2 * 100 ≈ 50
    })
  })

  describe('scorePlatform', () => {
    it('should return PlatformScore with all required fields', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          integrationNeeds: ['slack', 'github'],
          budgetRange: 'under-5000',
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const result = scorePlatform(mockPlatforms[0], context)

      expect(result).toHaveProperty('platformId', 'zapier')
      expect(result).toHaveProperty('platformName', 'Zapier')
      expect(result).toHaveProperty('totalScore')
      expect(result).toHaveProperty('criteriaScores')
      expect(result).toHaveProperty('auditTrail')

      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
      expect(Array.isArray(result.criteriaScores)).toBe(true)
      expect(Array.isArray(result.auditTrail)).toBe(true)
    })

    it('should include all 5 criteria in criteriaScores', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const result = scorePlatform(mockPlatforms[0], context)

      expect(result.criteriaScores).toHaveLength(5)

      const criteriaNames = result.criteriaScores.map((c) => c.name)
      expect(criteriaNames).toContain('integrationFit')
      expect(criteriaNames).toContain('complianceMatch')
      expect(criteriaNames).toContain('budgetFit')
      expect(criteriaNames).toContain('featureMatch')
      expect(criteriaNames).toContain('stackCompatibility')
    })
  })

  describe('scoreAllPlatforms', () => {
    it('should score all platforms and sort by totalScore descending', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          integrationNeeds: ['slack', 'github'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      expect(results).toHaveLength(3)

      // Verify sorted descending
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].totalScore).toBeGreaterThanOrEqual(results[i + 1].totalScore)
      }
    })

    it('should return empty array for empty platforms', () => {
      const context: ScoringContext = {
        allPlatforms: [],
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms([], context)

      expect(results).toEqual([])
    })
  })
})
