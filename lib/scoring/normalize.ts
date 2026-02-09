/**
 * Normalization Utilities for Scoring Engine
 *
 * Provides min-max normalization to ensure criteria on different scales
 * (e.g., price $0-$10k vs features 0-5) can be compared fairly.
 *
 * Uses min-max normalization: (value - min) / (max - min)
 * With inversion for "lower is better" criteria like price.
 */

/**
 * Criterion direction mapping.
 *
 * Defines whether higher values are better for each criterion.
 * Used to determine if normalization should be inverted.
 *
 * @example
 * - integrationFit: true (more integrations = better)
 * - budgetFit: false (lower price = better, so we invert)
 */
export const CRITERION_DIRECTIONS: Record<string, boolean> = {
  integrationFit: true,       // More integrations available = better
  complianceMatch: true,      // More compliance certifications = better
  budgetFit: false,           // Lower price = better (inverted)
  featureMatch: true,         // More matching features = better
  stackCompatibility: true,   // More compatible with user's stack = better
}

/**
 * Normalizes a value to 0-1 scale using min-max normalization.
 *
 * Formula: (value - min) / (max - min)
 *
 * For "lower is better" criteria (like price), the result is inverted.
 * Result is always clamped to [0, 1] range.
 *
 * @param value - The raw value to normalize
 * @param min - Minimum value in the dataset
 * @param max - Maximum value in the dataset
 * @param higherIsBetter - If false, inverts the result (for price, timeline, etc.)
 * @returns Normalized value between 0 and 1
 *
 * @example
 * // Standard normalization (features: 3 out of range 1-5)
 * normalizeMinMax(3, 1, 5, true) // => 0.5
 *
 * // Inverted normalization (price: $5000 out of range $1000-$10000)
 * normalizeMinMax(5000, 1000, 10000, false) // => 0.555... (lower price = higher score)
 *
 * // Edge case: all values same (max === min)
 * normalizeMinMax(100, 100, 100, true) // => 0.5 (neutral score)
 *
 * // Edge case: value outside range (clamped)
 * normalizeMinMax(150, 0, 100, true) // => 1.0 (clamped to max)
 * normalizeMinMax(-50, 0, 100, true) // => 0.0 (clamped to min)
 */
export function normalizeMinMax(
  value: number,
  min: number,
  max: number,
  higherIsBetter: boolean = true
): number {
  // Edge case: if all values are the same, return neutral score
  if (max === min) {
    return 0.5
  }

  // Calculate normalized value
  let normalized = (value - min) / (max - min)

  // Clamp to [0, 1] range
  normalized = Math.max(0, Math.min(1, normalized))

  // Invert if lower is better (e.g., price)
  if (!higherIsBetter) {
    normalized = 1 - normalized
  }

  return normalized
}

/**
 * Normalizes a criterion across all platforms.
 *
 * Takes raw values for each platform, finds min/max,
 * and returns normalized values for each.
 *
 * @param platforms - Array of platform IDs with their raw values
 * @param higherIsBetter - Whether higher raw values are better
 * @returns Map of platformId to normalized value (0-1)
 *
 * @example
 * // Normalizing integration scores across platforms
 * const platforms = [
 *   { id: 'platform-a', value: 10 },
 *   { id: 'platform-b', value: 5 },
 *   { id: 'platform-c', value: 8 }
 * ]
 * const normalized = normalizeCriterion(platforms, true)
 * // Map { 'platform-a' => 1.0, 'platform-b' => 0.0, 'platform-c' => 0.6 }
 *
 * @example
 * // Normalizing price (lower is better)
 * const prices = [
 *   { id: 'cheap', value: 100 },
 *   { id: 'expensive', value: 500 }
 * ]
 * const normalized = normalizeCriterion(prices, false)
 * // Map { 'cheap' => 1.0, 'expensive' => 0.0 }
 *
 * @example
 * // Edge case: empty array
 * normalizeCriterion([], true) // => Map {}
 *
 * @example
 * // Edge case: single platform (all values same)
 * normalizeCriterion([{ id: 'only-one', value: 50 }], true)
 * // => Map { 'only-one' => 0.5 }
 */
export function normalizeCriterion(
  platforms: Array<{ id: string; value: number }>,
  higherIsBetter: boolean
): Map<string, number> {
  const result = new Map<string, number>()

  // Edge case: empty array
  if (platforms.length === 0) {
    return result
  }

  // Extract all values to find min/max
  const values = platforms.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Normalize each platform's value
  for (const platform of platforms) {
    const normalized = normalizeMinMax(platform.value, min, max, higherIsBetter)
    result.set(platform.id, normalized)
  }

  return result
}
