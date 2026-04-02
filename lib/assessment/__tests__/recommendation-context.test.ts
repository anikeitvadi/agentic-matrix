import { describe, expect, it } from 'vitest'
import {
  STACK_KEYWORD_MAP,
  deriveUsageParameters,
  hasKeywordMatch,
} from '../recommendation-context'

describe('recommendation context helpers', () => {
  describe('deriveUsageParameters', () => {
    it('uses representative defaults for assessment usage ranges', () => {
      expect(
        deriveUsageParameters({ expectedMonthlyConversations: 'under-1k' }).monthlyConversations
      ).toBe(1_000)
      expect(
        deriveUsageParameters({ expectedMonthlyConversations: '1k-10k' }).monthlyConversations
      ).toBe(5_000)
      expect(
        deriveUsageParameters({ expectedMonthlyConversations: '10k-100k' }).monthlyConversations
      ).toBe(50_000)
      expect(
        deriveUsageParameters({ expectedMonthlyConversations: '100k-plus' }).monthlyConversations
      ).toBe(200_000)
    })

    it('prefers explicit usage ranges over organization-size fallbacks', () => {
      const usage = deriveUsageParameters({
        expectedMonthlyConversations: '1k-10k',
        organizationSize: '1000+',
      })

      expect(usage.monthlyConversations).toBe(5_000)
    })
  })

  describe('stack matching', () => {
    it('does not treat generic integration language as hybrid or on-prem support', () => {
      const genericIntegrationText =
        'native api integration with enterprise connectors and workflow automation'

      expect(hasKeywordMatch(genericIntegrationText, STACK_KEYWORD_MAP.hybrid)).toBe(false)
      expect(
        hasKeywordMatch(genericIntegrationText, STACK_KEYWORD_MAP['on-premise'])
      ).toBe(false)
    })

    it('matches explicit deployment signals for hybrid and on-prem environments', () => {
      const explicitDeploymentText =
        'supports hybrid cloud deployment with self-hosted runtime and private network isolation'

      expect(hasKeywordMatch(explicitDeploymentText, STACK_KEYWORD_MAP.hybrid)).toBe(true)
      expect(
        hasKeywordMatch(explicitDeploymentText, STACK_KEYWORD_MAP['on-premise'])
      ).toBe(true)
    })
  })
})
