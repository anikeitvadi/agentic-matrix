import { z } from 'zod'

/**
 * Step 1 - Basics: What are you trying to do?
 */
export const step1Schema = z.object({
  useCase: z.enum(
    ['vendor-selection', 'implementation-planning', 'platform-evaluation', 'cost-analysis'],
    {
      errorMap: () => ({ message: 'Please select a primary use case' })
    }
  ),
  organizationSize: z.enum(
    ['1-50', '51-200', '201-1000', '1000+'],
    {
      errorMap: () => ({ message: 'Please select your organization size' })
    }
  ),
  industry: z.string().optional()
})

export type Step1Data = z.infer<typeof step1Schema>

// Helper to transform comma-separated string to array
const commaSeparatedToArray = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (Array.isArray(val)) return val
    return []
  },
  z.array(z.string())
)

/**
 * Step 2 - Current State: What do you have?
 */
export const step2Schema = z.object({
  hasExistingPlatform: z.enum(['true', 'false'], {
    errorMap: () => ({ message: 'Please indicate if you have an existing platform' })
  }),
  existingPlatforms: commaSeparatedToArray.optional(),
  currentStack: z.array(
    z.enum(['aws', 'azure', 'gcp', 'on-premise', 'hybrid'])
  ).min(1, 'Please select at least one infrastructure option'),
  integrationNeeds: commaSeparatedToArray.optional()
})

export type Step2Data = z.infer<typeof step2Schema>

/**
 * Step 3 - Requirements: What do you need?
 */
export const step3Schema = z.object({
  primaryUseCases: z.array(
    z.enum([
      'customer-support',
      'data-extraction',
      'workflow-automation',
      'knowledge-qa',
      'sales-routing',
      'it-ticketing'
    ])
  ).min(1, 'Please select at least one use case'),
  complianceRequirements: z.array(
    z.enum(['hipaa', 'soc2', 'gdpr', 'fedramp', 'none'])
  ).min(1, 'Please select at least one compliance requirement'),
  timeline: z.enum(
    ['asap', '1-3-months', '3-6-months', '6-12-months', 'exploring'],
    {
      errorMap: () => ({ message: 'Please select your timeline' })
    }
  )
})

export type Step3Data = z.infer<typeof step3Schema>

/**
 * Step 4 - Constraints: What are your limits?
 */
export const step4Schema = z.object({
  budgetRange: z.enum(
    ['under-10k', '10k-50k', '50k-200k', '200k-plus', 'unknown'],
    {
      errorMap: () => ({ message: 'Please select your budget range' })
    }
  ),
  teamTechnicalLevel: z.enum(
    ['non-technical', 'some-technical', 'engineering-team', 'ai-ml-expertise'],
    {
      errorMap: () => ({ message: 'Please indicate your team\'s technical level' })
    }
  ),
  expectedMonthlyConversations: z.enum(
    ['under-1k', '1k-10k', '10k-100k', '100k-plus'],
    {
      errorMap: () => ({ message: 'Please select expected usage volume' })
    }
  ),
  decisionMakers: z.array(
    z.enum(['it-leader', 'business-leader', 'executive', 'technical-team'])
  ).optional()
})

export type Step4Data = z.infer<typeof step4Schema>
