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
    structuredCapabilities: {
      hasRAG: false,
      hasMultiModal: false,
      hasLowCode: true,
      hasSelfHosted: false,
      hasMultiAgent: false,
      cloudNative: [],
      complianceCerts: ['soc2'],
      supportedIntegrations: ['slack', 'salesforce', 'hubspot', 'jira', 'github'],
      useCaseStrengths: ['customer-support', 'workflow-automation'],
    },
    pricing: { model: 'subscription' as const, details: '$20-$69/month', tiers: [{ name: 'Professional', monthlyPrice: 20, includedUnits: 750, unitType: 'tasks' as const }] },
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
    structuredCapabilities: {
      hasRAG: false,
      hasMultiModal: false,
      hasLowCode: true,
      hasSelfHosted: true,
      hasMultiAgent: false,
      cloudNative: [],
      complianceCerts: ['soc2', 'gdpr'],
      supportedIntegrations: ['slack', 'github', 'jira'],
      useCaseStrengths: ['customer-support', 'data-extraction', 'workflow-automation'],
    },
    pricing: { model: 'hybrid' as const, details: 'Free self-hosted, cloud from $24/month', tiers: [{ name: 'Community', monthlyPrice: 0, includedUnits: 0, unitType: 'tasks' as const }] },
    description: 'Open source automation',
    lastVerified: '2024-01-15',
    officialDocs: 'https://n8n.io/docs',
    body: '',
  },
  {
    slug: 'workato',
    title: 'Workato',
    tier: 'ipaas-agent' as const,
    capabilities: ['slack', 'github', 'jira', 'salesforce', 'soc2', 'hipaa', 'enterprise-sso'],
    structuredCapabilities: {
      hasRAG: false,
      hasMultiModal: false,
      hasLowCode: true,
      hasSelfHosted: false,
      hasMultiAgent: false,
      cloudNative: [],
      complianceCerts: ['soc2', 'hipaa'],
      supportedIntegrations: ['slack', 'salesforce', 'sap', 'oracle', 'workday', 'jira', 'github'],
      useCaseStrengths: ['customer-support', 'workflow-automation'],
    },
    pricing: { model: 'subscription' as const, details: 'Custom pricing, $50k-$130k/year', tiers: [{ name: 'Professional', monthlyPrice: 1999, includedUnits: 10000, unitType: 'tasks' as const }] },
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
        budgetRange: 'under-10k',
      })

      expect(weights.budgetFit).toBeGreaterThan(DEFAULT_WEIGHTS.budgetFit)
    })

    it('should never exceed 0.35 for any single weight', () => {
      const weights = deriveWeights({
        integrationNeeds: ['Slack', 'GitHub', 'Jira', 'Salesforce', 'HubSpot', 'Notion', 'Asana'],
        complianceRequirements: ['SOC2', 'HIPAA', 'GDPR', 'ISO27001'],
        budgetRange: 'under-10k',
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
        { budgetRange: 'under-10k' as const },
        {
          integrationNeeds: ['Slack', 'GitHub'],
          complianceRequirements: ['SOC2'],
          budgetRange: '10k-50k' as const,
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

  describe('Audit Trail', () => {
    it('should generate audit trail with reasoning for each criterion', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          integrationNeeds: ['slack', 'github'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const result = scorePlatform(mockPlatforms[0], context)

      expect(result.auditTrail).toHaveLength(5)

      // Each audit entry should have all required fields
      for (const entry of result.auditTrail) {
        expect(entry).toHaveProperty('criterionName')
        expect(entry).toHaveProperty('rawValue')
        expect(entry).toHaveProperty('normalizedValue')
        expect(entry).toHaveProperty('weight')
        expect(entry).toHaveProperty('weightedScore')
        expect(entry).toHaveProperty('reasoning')

        // Reasoning should be a non-empty string
        expect(typeof entry.reasoning).toBe('string')
        expect(entry.reasoning.length).toBeGreaterThan(0)
      }
    })

    it('should include platform name in reasoning strings', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const result = scorePlatform(mockPlatforms[0], context)

      // All reasoning strings should include the platform name
      for (const entry of result.auditTrail) {
        expect(entry.reasoning).toContain('Zapier')
      }
    })

    it('should calculate weightedScore correctly in audit entries', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const result = scorePlatform(mockPlatforms[0], context)

      for (const entry of result.auditTrail) {
        const expectedWeightedScore = entry.weight * entry.normalizedValue
        expect(entry.weightedScore).toBeCloseTo(expectedWeightedScore, 10)
      }
    })
  })

  describe('Criterion Calculations', () => {
    it('should score developer-first platforms higher for stack compatibility', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: {
          integrationFit: 0,
          complianceMatch: 0,
          budgetFit: 0,
          featureMatch: 0,
          stackCompatibility: 1.0, // Only stack compatibility matters
        },
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      // n8n (developer-first) should have high stack compatibility
      const n8nScore = results.find((r) => r.platformId === 'n8n')
      expect(n8nScore).toBeDefined()
      expect(n8nScore!.totalScore).toBeGreaterThan(0)
    })

    it('should score enterprise platforms higher for compliance', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['soc2', 'hipaa'],
        },
        weightConfig: {
          integrationFit: 0,
          complianceMatch: 1.0, // Only compliance matters
          budgetFit: 0,
          featureMatch: 0,
          stackCompatibility: 0,
        },
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      // Workato (enterprise with soc2/hipaa) should score highest
      expect(results[0].platformId).toBe('workato')
    })

    it('should favor lower cost platforms for budget fit', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: {
          integrationFit: 0,
          complianceMatch: 0,
          budgetFit: 1.0, // Only budget matters
          featureMatch: 0,
          stackCompatibility: 0,
        },
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      // n8n (open-source, free) should have best budget score
      expect(results[0].platformId).toBe('n8n')
    })
  })

  describe('Layered Scoring', () => {
    it('should include gate failures on platforms missing required certs', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['hipaa'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      // n8n has gdpr and soc2 but NOT hipaa
      const n8nScore = results.find(r => r.platformId === 'n8n')
      expect(n8nScore?.gateFailures.length).toBeGreaterThan(0)
      expect(n8nScore?.gateFailures.some(g => g.gate === 'compliance')).toBe(true)

      // workato HAS hipaa
      const workatoScore = results.find(r => r.platformId === 'workato')
      expect(workatoScore?.gateFailures.filter(g => g.gate === 'compliance').length).toBe(0)
    })

    it('should rank gate-passing platforms above gate-failing ones', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['hipaa'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      // Platforms passing all hard gates should come first
      const firstFailing = results.findIndex(r => !r.passedAllGates)
      const lastPassing = results.length - 1 - [...results].reverse().findIndex(r => r.passedAllGates)

      if (firstFailing >= 0 && lastPassing >= 0) {
        expect(firstFailing).toBeGreaterThan(lastPassing)
      }
    })

    it('should include implementation risk with score and label', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      for (const result of results) {
        expect(result.implementationRisk).toBeDefined()
        expect(result.implementationRisk.score).toBeGreaterThanOrEqual(0)
        expect(result.implementationRisk.score).toBeLessThanOrEqual(100)
        expect(['Low', 'Medium', 'High']).toContain(result.implementationRisk.label)
        expect(result.implementationRisk.factors.length).toBeGreaterThan(0)
      }
    })

    it('should include confidence score', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['soc2'],
          integrationNeeds: ['slack'],
          budgetRange: 'under-10k',
          teamTechnicalLevel: 'engineering-team',
          primaryUseCases: ['customer-support'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      for (const result of results) {
        expect(result.confidence).toBeDefined()
        expect(result.confidence.score).toBeGreaterThanOrEqual(0)
        expect(result.confidence.score).toBeLessThanOrEqual(100)
        expect(['High', 'Medium', 'Low']).toContain(result.confidence.label)
      }
    })

    it('should have lower confidence with empty assessment', () => {
      const fullContext: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['soc2'],
          integrationNeeds: ['slack'],
          budgetRange: 'under-10k',
          teamTechnicalLevel: 'engineering-team',
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const emptyContext: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {},
        weightConfig: DEFAULT_WEIGHTS,
      }

      const fullResults = scoreAllPlatforms(mockPlatforms, fullContext)
      const emptyResults = scoreAllPlatforms(mockPlatforms, emptyContext)

      // Average confidence should be higher with full assessment
      const avgFull = fullResults.reduce((s, r) => s + r.confidence.score, 0) / fullResults.length
      const avgEmpty = emptyResults.reduce((s, r) => s + r.confidence.score, 0) / emptyResults.length
      expect(avgFull).toBeGreaterThan(avgEmpty)
    })

    it('should include evidence with requirements and cost', () => {
      const context: ScoringContext = {
        allPlatforms: mockPlatforms,
        userAssessment: {
          complianceRequirements: ['soc2'],
        },
        weightConfig: DEFAULT_WEIGHTS,
      }

      const results = scoreAllPlatforms(mockPlatforms, context)

      for (const result of results) {
        expect(result.evidence).toBeDefined()
        expect(result.evidence.hardRequirementsTotal).toBeGreaterThanOrEqual(0)
        expect(result.evidence.hardRequirementsMet).toBeLessThanOrEqual(result.evidence.hardRequirementsTotal)
        expect(Array.isArray(result.evidence.deploymentOptions)).toBe(true)
      }
    })
  })
})
