'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Platform } from '@/.velite'
import type { UsageParameters, CostEstimate } from '@/lib/cost/types'
import { calculatePlatformCost } from '@/lib/cost/tco-calculator'
import { deriveUsageParameters, derivePlatformComplexity } from '@/lib/assessment/recommendation-context'
import { UsageInputPanel } from './UsageInputPanel'
import { CostComparisonChart } from './CostComparisonChart'
import { PlatformCostCard } from './PlatformCostCard'

interface CostCalculatorProps {
  platforms: Platform[]
  topPlatformIds?: string[]
  assessment?: Record<string, unknown> | null
}

type PeriodType = 'monthly' | 'yearly' | 'tco36'

/**
 * Cost Calculator Container
 *
 * Main orchestrator for all cost analysis components. Provides interactive
 * cost estimation with usage inputs and real-time calculation updates.
 *
 * Features:
 * - Usage input panel with slider controls
 * - Cost comparison chart across multiple platforms
 * - TCO projection over 12/24/36 months
 * - Detailed platform cost cards
 * - Responsive layout that adapts to screen size
 */
export function CostCalculator({ platforms, topPlatformIds = [], assessment }: CostCalculatorProps) {
  // Derive initial usage from assessment if available, otherwise use defaults
  const initialUsage = useMemo<UsageParameters>(() => {
    if (assessment) {
      return deriveUsageParameters(assessment)
    }
    return {
      monthlyConversations: 5_000,
      monthlyInputTokens: 4_000_000,
      monthlyOutputTokens: 1_000_000,
      avgTokensPerConversation: 2500,
    }
  }, [assessment])

  const [usageParams, setUsageParams] = useState<UsageParameters>(initialUsage)

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('yearly')
  const [expandedPlatformId, setExpandedPlatformId] = useState<string | null>(null) // kept for cost card click highlight

  // Show top recommended platforms in cost analysis
  const platformsToCalculate = useMemo(() => {
    if (topPlatformIds.length > 0) {
      return platforms.filter((p) => topPlatformIds.includes(p.slug))
    }
    return platforms.slice(0, 5)
  }, [platforms, topPlatformIds])

  // Calculate cost estimates for all platforms
  const estimates = useMemo<CostEstimate[]>(() => {
    const platformsWithPricing = platformsToCalculate.filter((p) => p.pricing?.model)

    if (platformsWithPricing.length === 0) return []

    return platformsWithPricing
      .map((platform) => {
        try {
          // Derive complexity from assessment context (or use safe defaults)
          const complexity = derivePlatformComplexity(platform, assessment ?? {})

          return calculatePlatformCost(
            platform as any, // Type assertion - Platform type matches PlatformForCost
            {
              ...usageParams,
              complexity,
            },
            150 // Default $150/hour engineering rate
          )
        } catch (error) {
          console.error(`Failed to calculate cost for ${platform.slug}:`, error)
          return null
        }
      })
      .filter((estimate): estimate is CostEstimate => estimate !== null)
  }, [platformsToCalculate, usageParams])

  // Handle usage changes from input panel
  const handleUsageChange = useCallback((newUsage: UsageParameters) => {
    setUsageParams(newUsage)
  }, [])

  // Handle period selection
  const handlePeriodChange = useCallback((period: PeriodType) => {
    setSelectedPeriod(period)
  }, [])

  // Handle platform card expand/collapse
  const handleCardClick = useCallback((platformId: string) => {
    setExpandedPlatformId((current) => (current === platformId ? null : platformId))
  }, [])

  // Empty state - no platforms have pricing data
  if (platformsToCalculate.length === 0 || estimates.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-2">Cost Analysis</h2>
        <p className="text-neutral-400 mb-6">Estimated costs based on your expected usage</p>

        <div className="flex items-center justify-center p-12 bg-neutral-900 rounded-lg border border-neutral-800">
          <div className="text-center max-w-md">
            <p className="text-neutral-300 mb-2">Cost analysis not available</p>
            <p className="text-sm text-neutral-500">
              Some platforms require contacting sales for pricing information.
              Visit platform pages for direct pricing details.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Cost Analysis</h2>
        <p className="text-neutral-400">Estimated costs based on your expected usage</p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 p-1 bg-neutral-900 rounded-lg border border-neutral-800 w-fit">
        <PeriodButton
          label="Monthly"
          period="monthly"
          currentPeriod={selectedPeriod}
          onClick={handlePeriodChange}
        />
        <PeriodButton
          label="Annual"
          period="yearly"
          currentPeriod={selectedPeriod}
          onClick={handlePeriodChange}
        />
        <PeriodButton
          label="3-Year TCO"
          period="tco36"
          currentPeriod={selectedPeriod}
          onClick={handlePeriodChange}
        />
      </div>

      {/* Main Layout: Input Panel + Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Input Panel - Sidebar */}
        <div className="lg:col-span-1">
          <UsageInputPanel
            onUsageChange={handleUsageChange}
            initialUsage={usageParams}
          />
        </div>

        {/* Cost Comparison Chart - Main area */}
        <div className="lg:col-span-2">
          <CostComparisonChart estimates={estimates} period={selectedPeriod} />
        </div>
      </div>

      {/* Platform Cost Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Detailed Cost Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {estimates.map((estimate, index) => (
            <div
              key={estimate.platformId}
              onClick={() => handleCardClick(estimate.platformId)}
              className="cursor-pointer transition-all hover:-translate-y-0.5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(estimate.platformId) }}
            >
              <PlatformCostCard
                estimate={estimate}
                isRecommended={index === 0}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-4 text-center">
          Click any card to highlight its TCO projection in the chart above
        </p>
      </div>
    </section>
  )
}

/**
 * Period selector button component.
 */
interface PeriodButtonProps {
  label: string
  period: PeriodType
  currentPeriod: PeriodType
  onClick: (period: PeriodType) => void
}

function PeriodButton({ label, period, currentPeriod, onClick }: PeriodButtonProps) {
  const isActive = currentPeriod === period

  return (
    <button
      onClick={() => onClick(period)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
      }`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  )
}
