/**
 * Token Cost Calculator
 *
 * Calculates costs for token-based (pay-per-use) pricing models.
 * Handles separate input and output token pricing, which is standard
 * for LLM providers (output tokens typically cost 3-5x more).
 */

import type { TokenPricing, TokenUsage } from './types'

/**
 * Average tokens per conversation based on industry benchmarks.
 * Input tokens typically include: system prompt, conversation history, user message
 * Output tokens: AI response
 */
const AVG_INPUT_TOKENS_PER_CONVERSATION = 2000
const AVG_OUTPUT_TOKENS_PER_CONVERSATION = 500

/**
 * Calculate the total token cost for a given pricing and usage.
 *
 * @param pricing - Token pricing with input/output rates per million
 * @param usage - Token usage with monthly input/output counts
 * @returns Total monthly cost in USD
 *
 * @example
 * const cost = calculateTokenCost(
 *   { inputPricePerMillion: 3, outputPricePerMillion: 15 },
 *   { monthlyInputTokens: 1_000_000, monthlyOutputTokens: 250_000 }
 * )
 * // Returns: 6.75 ($3 + $3.75)
 */
export function calculateTokenCost(
  pricing: TokenPricing | undefined,
  usage: TokenUsage
): number {
  if (!pricing) {
    return 0
  }

  const inputCost =
    (usage.monthlyInputTokens / 1_000_000) * pricing.inputPricePerMillion
  const outputCost =
    (usage.monthlyOutputTokens / 1_000_000) * pricing.outputPricePerMillion

  return inputCost + outputCost
}

/**
 * Convert a number of conversations to estimated token usage.
 *
 * Uses industry-standard averages:
 * - Input: ~2,000 tokens per conversation (prompt + context)
 * - Output: ~500 tokens per conversation (AI response)
 *
 * Note: Actual usage varies significantly based on use case.
 * Customer support: ~2,500 total tokens
 * Document analysis: ~15,000 total tokens
 * Code generation: ~10,000 total tokens
 *
 * @param conversations - Number of monthly conversations
 * @returns Estimated token usage breakdown
 */
export function conversationsToTokens(
  conversations: number,
  avgTokensPerConversation?: number,
): TokenUsage {
  const totalTokens = avgTokensPerConversation ?? (AVG_INPUT_TOKENS_PER_CONVERSATION + AVG_OUTPUT_TOKENS_PER_CONVERSATION)
  // 80/20 split: input tokens are typically 80% of total (prompt + context), output is 20% (response)
  const inputTokens = Math.round(totalTokens * 0.8)
  const outputTokens = Math.round(totalTokens * 0.2)

  return {
    monthlyInputTokens: conversations * inputTokens,
    monthlyOutputTokens: conversations * outputTokens,
  }
}
