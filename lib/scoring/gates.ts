/**
 * Hard Gates — Pass/fail requirements evaluated before SAW scoring.
 *
 * Gates flag platforms that cannot meet explicit user requirements.
 * Hard failures indicate disqualifying gaps. Soft failures are warnings.
 * Platforms with gate failures still receive scores but are flagged.
 */

import type { Platform } from '.velite'
import type { GateFailure } from './types'
import {
  getAssessmentArray,
  getAssessmentString,
  getIndustryComplianceHints,
} from '@/lib/assessment/recommendation-context'

const BUDGET_CEILINGS: Record<string, number | null> = {
  'under-10k': 10_000,
  '10k-50k': 50_000,
  '50k-200k': 200_000,
  '200k-plus': null,
  unknown: null,
}

/**
 * Evaluate all hard gates for a platform against user requirements.
 */
export function evaluateGates(
  platform: Platform,
  assessment: Record<string, unknown>,
  estimatedAnnualCost: number,
): GateFailure[] {
  const failures: GateFailure[] = []

  failures.push(...evaluateComplianceGate(platform, assessment))
  failures.push(...evaluateBudgetGate(estimatedAnnualCost, assessment))
  failures.push(...evaluateDeploymentGate(platform, assessment))

  return failures
}

/**
 * Compliance gate: are required certifications present?
 */
function evaluateComplianceGate(
  platform: Platform,
  assessment: Record<string, unknown>,
): GateFailure[] {
  const failures: GateFailure[] = []

  // Merge explicit requirements with industry-inferred hints
  const explicit = getAssessmentArray(assessment, 'complianceRequirements').filter(v => v !== 'none')
  const industryHints = getIndustryComplianceHints(assessment)
  const allRequired = [...new Set([...explicit, ...industryHints])]

  if (allRequired.length === 0) return []

  const certs = platform.structuredCapabilities?.complianceCerts ?? []
  const certsLower = certs.map(c => c.toLowerCase())

  for (const req of allRequired) {
    if (!certsLower.includes(req.toLowerCase())) {
      const isExplicit = explicit.includes(req)
      failures.push({
        gate: 'compliance',
        requirement: req.toUpperCase(),
        actual: certs.length > 0 ? certs.join(', ') : 'No certifications listed',
        severity: isExplicit ? 'hard' : 'soft', // Industry-inferred = soft
      })
    }
  }

  return failures
}

/**
 * Budget gate: is estimated cost within the user's ceiling?
 */
function evaluateBudgetGate(
  estimatedAnnualCost: number,
  assessment: Record<string, unknown>,
): GateFailure[] {
  const budgetRange = getAssessmentString(assessment, 'budgetRange')
  if (!budgetRange) return []

  const ceiling = BUDGET_CEILINGS[budgetRange]
  if (ceiling == null || estimatedAnnualCost <= 0) return []

  const ratio = estimatedAnnualCost / ceiling

  if (ratio > 2) {
    return [{
      gate: 'budget-ceiling',
      requirement: `Under $${ceiling.toLocaleString()}/year`,
      actual: `~$${Math.round(estimatedAnnualCost).toLocaleString()}/year (${ratio.toFixed(1)}x ceiling)`,
      severity: 'hard',
    }]
  }

  if (ratio > 1.5) {
    return [{
      gate: 'budget-ceiling',
      requirement: `Under $${ceiling.toLocaleString()}/year`,
      actual: `~$${Math.round(estimatedAnnualCost).toLocaleString()}/year (${ratio.toFixed(1)}x ceiling)`,
      severity: 'soft',
    }]
  }

  return []
}

/**
 * Deployment gate: can the platform be deployed as required?
 */
function evaluateDeploymentGate(
  platform: Platform,
  assessment: Record<string, unknown>,
): GateFailure[] {
  const failures: GateFailure[] = []
  const stack = getAssessmentArray(assessment, 'currentStack', 'techStack')
  const caps = platform.structuredCapabilities

  const needsOnPrem = stack.includes('on-premise')
  const needsHybrid = stack.includes('hybrid')

  if (needsOnPrem) {
    const hasOnPrem = caps?.hasSelfHosted ||
      caps?.deploymentOptions?.some(d => d === 'on-prem' || d === 'vpc')

    if (!hasOnPrem) {
      failures.push({
        gate: 'deployment',
        requirement: 'On-premise deployment',
        actual: `Available: ${caps?.deploymentOptions?.join(', ') || 'SaaS only'}`,
        severity: 'soft',
      })
    }
  }

  if (needsHybrid) {
    const hasHybrid = caps?.deploymentOptions?.some(d =>
      d === 'hybrid-cloud' || d === 'vpc'
    ) || caps?.hasSelfHosted

    if (!hasHybrid) {
      failures.push({
        gate: 'deployment',
        requirement: 'Hybrid cloud deployment',
        actual: `Available: ${caps?.deploymentOptions?.join(', ') || 'SaaS only'}`,
        severity: 'soft',
      })
    }
  }

  return failures
}
