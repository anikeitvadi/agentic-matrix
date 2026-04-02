/**
 * Confidence Score
 *
 * Tells the user how much of the recommendation is based on structured
 * evidence vs fallback assumptions. A tool that knows what it doesn't know
 * is more trustworthy than one that always sounds certain.
 */

import type { Platform } from '.velite'
import type { Confidence } from './types'
import { getAssessmentArray, getAssessmentString } from '@/lib/assessment/recommendation-context'

export function calculateConfidence(
  platform: Platform,
  assessment: Record<string, unknown>,
): Confidence {
  let score = 100
  const evidenceBasis: string[] = []
  const assumptions: string[] = []

  // Platform data completeness
  if (platform.evaluationContext) {
    evidenceBasis.push('Platform evaluation context available')
  } else {
    score -= 10
    assumptions.push('No evaluation context — using defaults for risk assessment')
  }

  if (platform.structuredCapabilities) {
    evidenceBasis.push('Structured capability flags verified')
  } else {
    score -= 15
    assumptions.push('No structured capabilities — scoring based on legacy capability strings')
  }

  const hasPricingData = platform.pricing?.tokenPricing || (platform.pricing?.tiers && platform.pricing.tiers.length > 0)
  if (hasPricingData) {
    evidenceBasis.push('Verified pricing data available')
  } else {
    score -= 10
    assumptions.push('No detailed pricing — cost estimate uses tier-based proxy')
  }

  // Check if token pricing is $0 (open-source — estimated LLM costs)
  if (platform.pricing?.tokenPricing &&
      platform.pricing.tokenPricing.inputPricePerMillion === 0 &&
      platform.pricing.tokenPricing.outputPricePerMillion === 0) {
    score -= 5
    assumptions.push('Framework is free — LLM costs estimated at mid-range provider pricing')
  }

  // Assessment completeness
  const integrations = getAssessmentArray(assessment, 'integrationNeeds')
  if (integrations.length > 0) {
    evidenceBasis.push(`${integrations.length} integration requirements specified`)
  } else {
    score -= 10
    assumptions.push('No integration requirements — scoring based on breadth')
  }

  const compliance = getAssessmentArray(assessment, 'complianceRequirements').filter(v => v !== 'none')
  if (compliance.length > 0) {
    evidenceBasis.push(`${compliance.length} compliance requirements specified`)
  } else {
    score -= 10
    assumptions.push('No compliance requirements — scoring based on cert breadth')
  }

  const budget = getAssessmentString(assessment, 'budgetRange')
  if (budget && budget !== 'unknown') {
    evidenceBasis.push('Budget range specified')
  } else {
    score -= 5
    assumptions.push('No budget constraint — all platforms treated as affordable')
  }

  const team = getAssessmentString(assessment, 'teamTechnicalLevel')
  if (team) {
    evidenceBasis.push('Team technical level specified')
  } else {
    score -= 5
    assumptions.push('No team level — using neutral team fit assumptions')
  }

  const useCases = getAssessmentArray(assessment, 'primaryUseCases', 'useCases')
  if (useCases.length > 0) {
    evidenceBasis.push(`${useCases.length} use cases specified`)
  } else {
    score -= 5
    assumptions.push('No use cases — feature match based on capability breadth')
  }

  score = Math.max(0, Math.min(100, score))
  const label: Confidence['label'] = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'

  return { score, label, evidenceBasis, assumptions }
}
