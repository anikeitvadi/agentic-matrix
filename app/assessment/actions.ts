'use server'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { FOLLOW_UP_SYSTEM_PROMPT, buildFollowUpPrompt } from '@/lib/assessment/ai-prompts'

// Schema for AI-generated follow-up questions
const followUpSchema = z.object({
  questions: z.array(z.object({
    id: z.string().describe('Unique identifier for the question'),
    text: z.string().describe('The question text to display'),
    rationale: z.string().describe('Brief explanation of why this question matters'),
    fieldType: z.enum(['text', 'textarea', 'select', 'multi-select', 'scale']).describe('Input type for the answer'),
    options: z.array(z.string()).optional().describe('Options for select/multi-select fields'),
  })).min(1).max(2),
})

export type FollowUpQuestion = z.infer<typeof followUpSchema>['questions'][number]

export async function generateFollowUp(
  context: Record<string, unknown>
): Promise<{ questions: FollowUpQuestion[] } | { error: string }> {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: followUpSchema,
      system: FOLLOW_UP_SYSTEM_PROMPT,
      prompt: buildFollowUpPrompt(context),
    })

    return { questions: result.object.questions }
  } catch (error) {
    console.error('AI follow-up generation failed:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return { error: 'Too many requests. Please wait a moment and try again.' }
      }
      if (error.message.includes('API key')) {
        return { error: 'AI service configuration error. Please try again later.' }
      }
    }

    return { error: 'Unable to generate follow-up questions. You can continue without them.' }
  }
}
