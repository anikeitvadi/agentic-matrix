export type AssessmentBudgetRange =
  | 'under-500'
  | 'under-1000'
  | 'under-2000'
  | 'under-5000'
  | 'under-10000'
  | 'under-10k'
  | '10k-50k'
  | '50k-200k'
  | '200k-plus'
  | 'unknown'
  | 'unlimited'

export type AnnualBudgetDisplayRange =
  | 'under-10k'
  | '10k-50k'
  | '50k-200k'
  | '200k-plus'

export type BudgetFilterRange = AnnualBudgetDisplayRange | 'all'

interface BudgetRangeBounds {
  min: number
  max: number | null
}

const DISPLAY_BUDGET_BOUNDS: Record<AnnualBudgetDisplayRange, BudgetRangeBounds> = {
  'under-10k': { min: 0, max: 10_000 },
  '10k-50k': { min: 10_000, max: 50_000 },
  '50k-200k': { min: 50_000, max: 200_000 },
  '200k-plus': { min: 200_000, max: null },
}

const ASSESSMENT_BUDGET_CAPS: Partial<Record<AssessmentBudgetRange, number | null>> = {
  'under-500': 6_000,
  'under-1000': 12_000,
  'under-2000': 24_000,
  'under-5000': 60_000,
  'under-10000': 120_000,
  'under-10k': 10_000,
  '10k-50k': 50_000,
  '50k-200k': 200_000,
  '200k-plus': null,
  unlimited: null,
}

export function isEstimatedAnnualCostWithinBudget(
  annualCost: number | null | undefined,
  budgetRange: string | undefined
): boolean {
  if (annualCost == null || !budgetRange || budgetRange === 'unknown') {
    return true
  }

  const budgetCap = ASSESSMENT_BUDGET_CAPS[budgetRange as AssessmentBudgetRange]

  if (budgetCap === undefined || budgetCap === null) {
    return true
  }

  return annualCost <= budgetCap
}

export function isEstimatedAnnualCostInDisplayRange(
  annualCost: number | null | undefined,
  budgetRange: BudgetFilterRange
): boolean {
  if (budgetRange === 'all') {
    return true
  }

  if (annualCost == null) {
    return false
  }

  const bounds = DISPLAY_BUDGET_BOUNDS[budgetRange]
  if (!bounds) {
    return false
  }

  const meetsMin = annualCost >= bounds.min
  const meetsMax = bounds.max === null ? true : annualCost <= bounds.max

  return meetsMin && meetsMax
}
