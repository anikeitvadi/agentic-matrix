import type { Platform } from '@/.velite'
import type { PlatformComplexity, UsageParameters } from '@/lib/cost/types'

export type AssessmentRecord = Record<string, unknown>

export const STACK_KEYWORD_MAP: Record<string, string[]> = {
  aws: ['aws', 'bedrock', 'lambda', 's3', 'dynamodb'],
  azure: ['azure', 'microsoft 365', 'power platform', 'entra', 'copilot'],
  gcp: ['google', 'vertex', 'gemini', 'bigquery'],
  'on-premise': [
    'on-prem',
    'on premise',
    'self-hosted',
    'customer-managed',
    'private cloud',
    'private network',
    'air-gapped',
  ],
  hybrid: [
    'hybrid',
    'hybrid cloud',
    'self-hosted',
    'customer-managed',
    'private cloud',
    'private network',
    'vpc',
  ],
}

export const USE_CASE_KEYWORD_MAP: Record<string, string[]> = {
  'customer-support': ['support', 'ticket', 'knowledge base', 'virtual agent', 'crm'],
  'data-extraction': ['document', 'extraction', 'ocr', 'pdf', 'validation'],
  'workflow-automation': ['workflow', 'automation', 'orchestration', 'process', 'approval'],
  'knowledge-qa': ['knowledge base', 'rag', 'search', 'grounding'],
  'sales-routing': ['sales', 'crm', 'routing', 'lead'],
  'it-ticketing': ['ticket', 'itsm', 'incident', 'service management', 'cmdb'],
}

const TEAM_TIER_FIT: Record<string, Record<Platform['tier'], number>> = {
  'non-technical': {
    'enterprise-os': 2,
    'ipaas-agent': 5,
    'developer-first': 1,
    vertical: 5,
  },
  'some-technical': {
    'enterprise-os': 4,
    'ipaas-agent': 5,
    'developer-first': 2,
    vertical: 4,
  },
  'engineering-team': {
    'enterprise-os': 5,
    'ipaas-agent': 4,
    'developer-first': 4,
    vertical: 3,
  },
  'ai-ml-expertise': {
    'enterprise-os': 4,
    'ipaas-agent': 3,
    'developer-first': 5,
    vertical: 2,
  },
}

const TIMELINE_TIER_FIT: Record<string, Record<Platform['tier'], number>> = {
  asap: {
    'enterprise-os': 2,
    'ipaas-agent': 5,
    'developer-first': 1,
    vertical: 5,
  },
  '1-3-months': {
    'enterprise-os': 3,
    'ipaas-agent': 5,
    'developer-first': 2,
    vertical: 4,
  },
  '3-6-months': {
    'enterprise-os': 4,
    'ipaas-agent': 4,
    'developer-first': 3,
    vertical: 3,
  },
  '6-12-months': {
    'enterprise-os': 5,
    'ipaas-agent': 3,
    'developer-first': 4,
    vertical: 3,
  },
  exploring: {
    'enterprise-os': 4,
    'ipaas-agent': 3,
    'developer-first': 4,
    vertical: 3,
  },
}

const ORG_SIZE_TO_CONVERSATIONS: Record<string, number> = {
  '1-50': 1_000,
  '51-200': 5_000,
  '201-1000': 20_000,
  '1000+': 100_000,
}

const USAGE_VOLUME_TO_CONVERSATIONS: Record<string, number> = {
  // Use representative defaults instead of range ceilings so estimates do not
  // systematically skew toward the highest possible spend in each bucket.
  'under-1k': 1_000,
  '1k-10k': 5_000,
  '10k-100k': 50_000,
  '100k-plus': 200_000,
}

const USE_CASE_TOKEN_ESTIMATES: Record<string, number> = {
  'customer-support': 2_500,
  'data-extraction': 12_000,
  'workflow-automation': 3_500,
  'knowledge-qa': 5_000,
  'sales-routing': 3_000,
  'it-ticketing': 3_000,
}

const LOW_CODE_HINTS = [
  'low-code',
  'no-code',
  'visual workflow',
  'template',
  'virtual agent',
  'copilot studio',
  'builder',
]

export function getAssessmentArray(
  assessment: AssessmentRecord,
  ...keys: string[]
): string[] {
  for (const key of keys) {
    const value = assessment[key]
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string')
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    }
  }

  return []
}

export function getAssessmentString(
  assessment: AssessmentRecord,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = assessment[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

export function platformCapabilitiesText(platform: Platform): string {
  return platform.capabilities.join(' ').toLowerCase()
}

export function hasKeywordMatch(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}

export function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    return count + (text.includes(keyword.toLowerCase()) ? 1 : 0)
  }, 0)
}

export function getTeamTierFitScore(
  teamTechnicalLevel: string | undefined,
  tier: Platform['tier']
): number {
  if (!teamTechnicalLevel) {
    return 3
  }

  return TEAM_TIER_FIT[teamTechnicalLevel]?.[tier] ?? 3
}

export function getTimelineTierFitScore(
  timeline: string | undefined,
  tier: Platform['tier']
): number {
  if (!timeline) {
    return 0
  }

  return TIMELINE_TIER_FIT[timeline]?.[tier] ?? 0
}

export function deriveUsageParameters(assessment: AssessmentRecord): UsageParameters {
  const expectedMonthlyConversations = getAssessmentString(
    assessment,
    'expectedMonthlyConversations'
  )
  const organizationSize = getAssessmentString(assessment, 'organizationSize')
  const monthlyConversations = expectedMonthlyConversations
    ? (USAGE_VOLUME_TO_CONVERSATIONS[expectedMonthlyConversations] ?? 5_000)
    : organizationSize
      ? (ORG_SIZE_TO_CONVERSATIONS[organizationSize] ?? 5_000)
      : 5_000

  const useCases = getAssessmentArray(assessment, 'primaryUseCases', 'useCases')
  const avgTokensPerConversation = useCases.length
    ? Math.round(
        useCases.reduce((sum, useCase) => {
          return sum + (USE_CASE_TOKEN_ESTIMATES[useCase] ?? 2_500)
        }, 0) / useCases.length
      )
    : 2_500

  return {
    monthlyConversations,
    monthlyInputTokens: monthlyConversations * Math.round(avgTokensPerConversation * 0.8),
    monthlyOutputTokens: monthlyConversations * Math.round(avgTokensPerConversation * 0.2),
    avgTokensPerConversation,
  }
}

/**
 * Maps industries to compliance frameworks they commonly require.
 * Used to infer likely compliance needs when explicit requirements are not specified.
 */
export const INDUSTRY_COMPLIANCE_HINTS: Record<string, string[]> = {
  'healthcare': ['hipaa'],
  'financial-services': ['soc2'],
  'government': ['fedramp'],
}

/**
 * Returns inferred compliance requirements based on the user's industry selection.
 * This supplements (but does not override) explicitly stated compliance needs.
 */
export function getIndustryComplianceHints(assessment: AssessmentRecord): string[] {
  const industry = getAssessmentString(assessment, 'industry')
  if (!industry) return []
  return INDUSTRY_COMPLIANCE_HINTS[industry] ?? []
}

export function derivePlatformComplexity(
  platform: Platform,
  assessment: AssessmentRecord
): Omit<PlatformComplexity, 'tier'> {
  const capabilitiesText = platformCapabilitiesText(platform)
  const currentStack = getAssessmentArray(assessment, 'currentStack', 'techStack')
  const requiredCompliance = getAssessmentArray(
    assessment,
    'complianceRequirements'
  ).filter((value) => value !== 'none')
  const teamTechnicalLevel = getAssessmentString(assessment, 'teamTechnicalLevel')

  const stackKeywords = currentStack.flatMap((stack) => STACK_KEYWORD_MAP[stack] ?? [stack])
  const lowCodeFriendly = hasKeywordMatch(capabilitiesText, LOW_CODE_HINTS)
  const stackAligned =
    stackKeywords.length === 0 || hasKeywordMatch(capabilitiesText, stackKeywords)

  return {
    hasNativeIntegration:
      platform.tier === 'ipaas-agent' || stackAligned || platform.tier === 'vertical',
    requiresCustomCode:
      platform.tier === 'developer-first' ||
      (!lowCodeFriendly && teamTechnicalLevel === 'non-technical'),
    complianceRequirements: requiredCompliance,
  }
}

/**
 * Like derivePlatformComplexity but also returns heuristic flags
 * explaining which values were inferred rather than explicitly known.
 */
export function derivePlatformComplexityWithFlags(
  platform: Platform,
  assessment: AssessmentRecord
): { complexity: Omit<PlatformComplexity, 'tier'>; heuristicFlags: string[] } {
  const capabilitiesText = platformCapabilitiesText(platform)
  const currentStack = getAssessmentArray(assessment, 'currentStack', 'techStack')
  const requiredCompliance = getAssessmentArray(assessment, 'complianceRequirements').filter(v => v !== 'none')
  const teamTechnicalLevel = getAssessmentString(assessment, 'teamTechnicalLevel')
  const heuristicFlags: string[] = []

  const stackKeywords = currentStack.flatMap((stack) => STACK_KEYWORD_MAP[stack] ?? [stack])
  const lowCodeFriendly = hasKeywordMatch(capabilitiesText, LOW_CODE_HINTS)
  const stackAligned = stackKeywords.length === 0 || hasKeywordMatch(capabilitiesText, stackKeywords)

  // Detect heuristic inferences
  const hasNativeIntegration = platform.tier === 'ipaas-agent' || stackAligned || platform.tier === 'vertical'
  if (hasNativeIntegration && !platform.structuredCapabilities?.supportedIntegrations?.length) {
    heuristicFlags.push('Native integration inferred from platform tier')
  }
  if (stackAligned && stackKeywords.length > 0 && !platform.structuredCapabilities?.cloudNative?.length) {
    heuristicFlags.push('Stack compatibility inferred from keyword matching')
  }

  const requiresCustomCode = platform.tier === 'developer-first' || (!lowCodeFriendly && teamTechnicalLevel === 'non-technical')
  if (requiresCustomCode && !platform.structuredCapabilities?.hasLowCode === undefined) {
    heuristicFlags.push('Custom code burden inferred from tier')
  }

  return {
    complexity: { hasNativeIntegration, requiresCustomCode, complianceRequirements: requiredCompliance },
    heuristicFlags,
  }
}
