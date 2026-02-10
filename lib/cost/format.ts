/**
 * Formatting Utilities for Cost Display
 *
 * Provides consistent formatting for currency values, token counts,
 * and durations across the cost analysis UI.
 */

/**
 * Format currency values with appropriate precision.
 *
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
 * @param value - Dollar amount
 * @param options - compact: use K/M suffixes, showCents: include decimals
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234567, { compact: true }) // "$1.2M"
 * formatCurrency(45000, { compact: true }) // "$45K"
 * formatCurrency(1234.56, { showCents: true }) // "$1,234.56"
 */
export function formatCurrency(
  value: number,
  options: { compact?: boolean; showCents?: boolean } = {}
): string {
  const { compact = false, showCents = false } = options

  if (compact) {
    if (value >= 1_000_000) {
      const millions = value / 1_000_000
      return `$${millions.toFixed(1)}M`
    }
    if (value >= 1_000) {
      const thousands = value / 1_000
      // Use toFixed(0) for clean thousands, but toFixed(1) if there's a decimal
      const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)
      return `$${formatted}K`
    }
    // Fall through to standard formatting for small values
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  return formatter.format(value)
}

/**
 * Format token counts with K/M/B suffixes.
 *
 * Large token counts are common in LLM usage, so this makes
 * values like 1,500,000 more readable as "1.5M".
 *
 * @param tokens - Number of tokens
 * @returns Formatted token count string
 *
 * @example
 * formatTokenCount(1500000) // "1.5M"
 * formatTokenCount(45000) // "45K"
 * formatTokenCount(500) // "500"
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000_000) {
    const billions = tokens / 1_000_000_000
    return `${billions.toFixed(1)}B`
  }
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000
    return `${millions.toFixed(1)}M`
  }
  if (tokens >= 1_000) {
    const thousands = tokens / 1_000
    // Use toFixed(0) for clean thousands
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)
    return `${formatted}K`
  }

  return tokens.toLocaleString('en-US')
}

/**
 * Format duration in days or weeks.
 *
 * For larger durations (>= 20 days), converts to weeks
 * for better comprehension.
 *
 * @param days - Number of engineering days
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(5) // "5 days"
 * formatDuration(25) // "5 weeks"
 * formatDuration(1) // "1 day"
 */
export function formatDuration(days: number): string {
  if (days >= 20) {
    const weeks = Math.round(days / 5) // 5 working days per week
    return `${weeks} week${weeks === 1 ? '' : 's'}`
  }

  return `${days} day${days === 1 ? '' : 's'}`
}

/**
 * Format a range of days.
 *
 * Used for displaying confidence ranges in engineering estimates.
 *
 * @param low - Minimum days
 * @param high - Maximum days
 * @returns Formatted range string
 *
 * @example
 * formatRange(5, 10) // "5-10 days"
 * formatRange(20, 40) // "4-8 weeks"
 */
export function formatRange(low: number, high: number): string {
  // If both values are large, use weeks
  if (low >= 20 && high >= 20) {
    const lowWeeks = Math.round(low / 5)
    const highWeeks = Math.round(high / 5)
    return `${lowWeeks}-${highWeeks} weeks`
  }

  return `${low}-${high} days`
}
