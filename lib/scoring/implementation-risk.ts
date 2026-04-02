/**
 * Implementation Risk Score
 *
 * Uses evaluationContext fields (modelFlexibility, observability, ecosystemMaturity,
 * vendorViability, documentationQuality) plus team/platform fit to produce a
 * 0-100 risk score. Higher = lower risk = better.
 */

import type { Platform } from '.velite'
import type { ImplementationRisk, RiskFactor } from './types'
import { getAssessmentString } from '@/lib/assessment/recommendation-context'

const DOC_QUALITY_SCORES: Record<string, number> = {
  comprehensive: 10,
  adequate: 5,
  minimal: 0,
}

const OBSERVABILITY_SCORES: Record<string, number> = {
  comprehensive: 10,
  basic: 5,
  minimal: 0,
}

const ECOSYSTEM_SCORES: Record<string, number> = {
  dominant: 10,
  established: 8,
  growing: 4,
  emerging: 1,
}

const VENDOR_SCORES: Record<string, number> = {
  'big-tech': 10,
  established: 7,
  startup: 3,
}

const FLEXIBILITY_SCORES: Record<string, number> = {
  'bring-your-own': 10,
  'multi-provider': 7,
  'single-provider': 3,
}

export function calculateImplementationRisk(
  platform: Platform,
  assessment: Record<string, unknown>,
): ImplementationRisk {
  const ctx = platform.evaluationContext
  const caps = platform.structuredCapabilities
  const teamLevel = getAssessmentString(assessment, 'teamTechnicalLevel')
  const factors: RiskFactor[] = []
  let rawScore = 0

  // Documentation quality
  const docQuality = ctx?.documentationQuality ?? 'adequate'
  const docScore = DOC_QUALITY_SCORES[docQuality] ?? 5
  rawScore += docScore
  factors.push({
    name: 'Documentation',
    value: docQuality,
    impact: docScore >= 8 ? 'positive' : docScore >= 5 ? 'neutral' : 'negative',
    explanation: `${docQuality} documentation ${docScore >= 8 ? 'reduces' : 'increases'} implementation risk`,
  })

  // Observability
  const obs = ctx?.observability ?? 'basic'
  const obsScore = OBSERVABILITY_SCORES[obs] ?? 5
  rawScore += obsScore
  factors.push({
    name: 'Observability',
    value: obs,
    impact: obsScore >= 8 ? 'positive' : obsScore >= 5 ? 'neutral' : 'negative',
    explanation: `${obs} observability for monitoring and debugging`,
  })

  // Ecosystem maturity
  const eco = ctx?.ecosystemMaturity ?? 'growing'
  const ecoScore = ECOSYSTEM_SCORES[eco] ?? 4
  rawScore += ecoScore
  factors.push({
    name: 'Ecosystem',
    value: eco,
    impact: ecoScore >= 8 ? 'positive' : ecoScore >= 4 ? 'neutral' : 'negative',
    explanation: `${eco} ecosystem with ${ecoScore >= 8 ? 'strong' : 'limited'} community and tooling`,
  })

  // Vendor viability
  const vendor = ctx?.vendorViability ?? 'established'
  const vendorScore = VENDOR_SCORES[vendor] ?? 7
  rawScore += vendorScore
  factors.push({
    name: 'Vendor',
    value: vendor,
    impact: vendorScore >= 8 ? 'positive' : vendorScore >= 5 ? 'neutral' : 'negative',
    explanation: `${vendor} vendor with ${vendorScore >= 8 ? 'strong' : 'moderate'} long-term viability`,
  })

  // Model flexibility
  const flex = ctx?.modelFlexibility ?? 'single-provider'
  const flexScore = FLEXIBILITY_SCORES[flex] ?? 3
  rawScore += flexScore
  factors.push({
    name: 'Model Flexibility',
    value: flex,
    impact: flexScore >= 8 ? 'positive' : flexScore >= 5 ? 'neutral' : 'negative',
    explanation: `${flex} model access ${flexScore >= 8 ? 'avoids' : 'increases'} vendor lock-in`,
  })

  // Team fit modifier
  if (teamLevel === 'non-technical' && platform.tier === 'developer-first') {
    rawScore -= 15
    factors.push({
      name: 'Team Fit',
      value: 'Mismatch',
      impact: 'negative',
      explanation: 'Non-technical team with developer-first platform creates significant implementation burden',
    })
  } else if (teamLevel === 'ai-ml-expertise' && platform.tier === 'developer-first') {
    rawScore += 5
    factors.push({
      name: 'Team Fit',
      value: 'Strong',
      impact: 'positive',
      explanation: 'AI/ML expertise aligns well with developer-first platform',
    })
  }

  // Low-code bonus for non-technical teams
  if (caps?.hasLowCode && (teamLevel === 'non-technical' || teamLevel === 'some-technical')) {
    rawScore += 10
    factors.push({
      name: 'Low-Code',
      value: 'Available',
      impact: 'positive',
      explanation: 'Low-code capabilities reduce implementation burden for this team',
    })
  }

  // Normalize to 0-100 (max theoretical = 50 base + 10 low-code + 5 team = 65)
  const score = Math.max(0, Math.min(100, Math.round((rawScore / 60) * 100)))

  const label: ImplementationRisk['label'] = score >= 70 ? 'Low' : score >= 40 ? 'Medium' : 'High'

  return { score, label, factors }
}
