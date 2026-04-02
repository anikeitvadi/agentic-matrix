import { describe, expect, it } from 'vitest'
import {
  isEstimatedAnnualCostInDisplayRange,
  isEstimatedAnnualCostWithinBudget,
} from '../budget-ranges'

describe('budget range helpers', () => {
  describe('isEstimatedAnnualCostWithinBudget', () => {
    it('treats unknown budget as non-blocking', () => {
      expect(isEstimatedAnnualCostWithinBudget(25_000, 'unknown')).toBe(true)
      expect(isEstimatedAnnualCostWithinBudget(25_000, undefined)).toBe(true)
    })

    it('allows any estimate for 200k-plus budgets', () => {
      expect(isEstimatedAnnualCostWithinBudget(80_000, '200k-plus')).toBe(true)
      expect(isEstimatedAnnualCostWithinBudget(320_000, '200k-plus')).toBe(true)
    })

    it('enforces upper budget caps for bounded ranges', () => {
      expect(isEstimatedAnnualCostWithinBudget(9_500, 'under-10k')).toBe(true)
      expect(isEstimatedAnnualCostWithinBudget(10_001, 'under-10k')).toBe(false)
      expect(isEstimatedAnnualCostWithinBudget(45_000, '10k-50k')).toBe(true)
      expect(isEstimatedAnnualCostWithinBudget(50_500, '10k-50k')).toBe(false)
    })
  })

  describe('isEstimatedAnnualCostInDisplayRange', () => {
    it('matches filter buckets using annual cost ranges', () => {
      expect(isEstimatedAnnualCostInDisplayRange(8_000, 'under-10k')).toBe(true)
      expect(isEstimatedAnnualCostInDisplayRange(8_000, '10k-50k')).toBe(false)
      expect(isEstimatedAnnualCostInDisplayRange(20_000, '10k-50k')).toBe(true)
      expect(isEstimatedAnnualCostInDisplayRange(120_000, '50k-200k')).toBe(true)
      expect(isEstimatedAnnualCostInDisplayRange(250_000, '200k-plus')).toBe(true)
    })

    it('excludes missing estimates when a budget filter is active', () => {
      expect(isEstimatedAnnualCostInDisplayRange(null, 'under-10k')).toBe(false)
      expect(isEstimatedAnnualCostInDisplayRange(undefined, '200k-plus')).toBe(false)
    })

    it('passes everything through when no budget filter is active', () => {
      expect(isEstimatedAnnualCostInDisplayRange(null, 'all')).toBe(true)
      expect(isEstimatedAnnualCostInDisplayRange(999_999, 'all')).toBe(true)
    })
  })
})
