'use server'

import { headers } from 'next/headers'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import {
  RECOMMENDATION_BRIEF_SYSTEM_PROMPT,
  buildRecommendationBriefPrompt,
} from '@/lib/assessment/ai-prompts'

// ── Rate limiting ────────────────────────────────────────────────────
// Simple sliding-window rate limiter: max requests per IP within a window.
// In-memory — resets on redeploy, which is fine for a portfolio project.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10           // per IP per window

const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = requestLog.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  requestLog.set(ip, recent)
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return true
  recent.push(now)
  return false
}

async function getClientIp(): Promise<string> {
  const hdrs = await headers()
  return hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

const recommendationBriefSchema = z.object({
  executiveSummary: z.string().describe('2-3 sentence summary of the decision'),
  recommendation: z.string().describe('Why the top-ranked platform is the current recommendation'),
  tradeoffs: z.array(z.string()).min(2).max(4).describe('Key tradeoffs or reasons runner-ups were not selected'),
  riskChecks: z.array(z.string()).min(2).max(4).describe('Operational or procurement checks to validate before committing'),
  questionsThatWouldChangeDecision: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Questions or changing assumptions most likely to alter the recommendation'),
  nextStep: z.string().describe('Single concrete next action'),
})

export type RecommendationBrief = z.infer<typeof recommendationBriefSchema>

interface RecommendationBriefInput {
  assessment: Record<string, unknown>
  topRecommendations: Array<{
    platformId: string
    platformName: string
    totalScore: number
    headline: string
    rationale: string
    strengths: string[]
    caveats: string[]
    estimatedAnnualCost: number | null
    criteria: Array<{
      name: string
      weight: number
      normalizedValue: number
    }>
  }>
}

const BRIEF_ASSESSMENT_FIELDS = [
  'organizationSize',
  'industry',
  'currentStack',
  'integrationNeeds',
  'primaryUseCases',
  'complianceRequirements',
  'timeline',
  'budgetRange',
  'teamTechnicalLevel',
  'expectedMonthlyConversations',
  'decisionMakers',
] as const

function sanitizeAssessmentForBrief(
  assessment: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    BRIEF_ASSESSMENT_FIELDS.flatMap((field) => {
      const value = assessment[field]

      if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length > 0 ? [[field, trimmed]] : []
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? [[field, value]] : []
      }

      if (typeof value === 'boolean') {
        return [[field, value]]
      }

      return value !== null && value !== undefined ? [[field, value]] : []
    })
  )
}

export async function generateRecommendationBrief(
  input: RecommendationBriefInput
): Promise<{ brief: RecommendationBrief } | { error: string }> {
  const ip = await getClientIp()
  if (isRateLimited(ip)) {
    return { error: 'Rate limit reached. Please try again later.' }
  }

  try {
    const sanitizedInput = {
      assessment: sanitizeAssessmentForBrief(input.assessment),
      topRecommendations: input.topRecommendations,
    }

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: recommendationBriefSchema,
      system: RECOMMENDATION_BRIEF_SYSTEM_PROMPT,
      prompt: buildRecommendationBriefPrompt(sanitizedInput),
    })

    return { brief: result.object }
  } catch (error) {
    console.error('AI recommendation brief generation failed:', error)

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('rate limit')) {
        return { error: 'Too many requests. Please wait a moment and try again.' }
      }
      if (message.includes('api key') || message.includes('401')) {
        return { error: 'AI service configuration error. Please try again later.' }
      }
    }

    return {
      error: 'Unable to generate the AI decision brief right now. The deterministic recommendation remains available below.',
    }
  }
}
