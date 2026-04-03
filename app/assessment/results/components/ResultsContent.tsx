'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Platform } from '@/.velite'
import { scoreAllPlatforms } from '@/lib/scoring/score-platform'
import { deriveWeights } from '@/lib/scoring/weights'
import type { PlatformScore, ScoringContext } from '@/lib/scoring/types'
import { getFormStorageKey } from '@/lib/assessment/progress-storage'
import { PlatformScores } from './PlatformScores'
import { DecisionMemo } from './DecisionMemo'
import { AIDecisionBrief } from './AIDecisionBrief'
import { DecisionPacketExport } from './DecisionPacketExport'
import { AssessmentSnapshot } from './AssessmentSnapshot'
import { FilterPanel, type FilterValues } from './FilterPanel'
import { ComparisonMatrix } from './ComparisonMatrix'
import { AuditTrail } from './AuditTrail'
import { CostCalculator } from './CostCalculator'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { DataDisclaimer } from '@/components/ui/DataDisclaimer'

interface ResultsContentProps {
  platforms: Platform[]
}

/**
 * Client component that loads assessment from localStorage,
 * calculates scores, and displays results.
 */
export function ResultsContent({ platforms }: ResultsContentProps) {
  const router = useRouter()
  const [assessment, setAssessment] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>({
    budgetRange: 'all',
    compliance: [],
    stack: [],
  })

  // Load assessment from localStorage on mount
  useEffect(() => {
    const storageKey = getFormStorageKey()
    const savedData = localStorage.getItem(storageKey)

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setAssessment(parsed)
      } catch (error) {
        console.error('Failed to parse saved assessment:', error)
        setAssessment({})
      }
    } else {
      // No assessment data - use defaults
      setAssessment({})
    }

    setIsLoading(false)
  }, [])

  // Memoize scoring to avoid recalculation
  const scores = useMemo<PlatformScore[]>(() => {
    if (!assessment) return []

    const weightConfig = deriveWeights(assessment)
    const context: ScoringContext = {
      allPlatforms: platforms,
      userAssessment: assessment,
      weightConfig,
    }

    return scoreAllPlatforms(platforms, context)
  }, [platforms, assessment])

  // Handle filter changes with useCallback
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-400">Loading your recommendations...</div>
      </div>
    )
  }

  if (platforms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400 mb-4">No platforms available for comparison.</p>
        <button
          onClick={() => router.push('/assessment')}
          className="px-6 py-2 rounded-lg font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          Start Assessment
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr] xl:items-start">
        <PlatformScores scores={scores} maxDisplay={3} />
        <AssessmentSnapshot assessment={assessment} />
      </div>

      <DecisionMemo scores={scores} />

      <SectionDivider label="Support and share" />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
        <DecisionPacketExport assessment={assessment} scores={scores} />
        <AIDecisionBrief assessment={assessment} scores={scores} />
      </div>

      <SectionDivider label="Decision workspace" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-6">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
        <div className="min-w-0">
          <ComparisonMatrix
            scores={scores}
            platforms={platforms}
            filters={filters}
          />
        </div>
      </div>

      <SectionDivider label="Deep dive" />
      <CostCalculator
        platforms={platforms}
        topPlatformIds={scores.slice(0, 5).map((s) => s.platformId)}
        assessment={assessment}
      />

      <AuditTrail scores={scores} />
      <DataDisclaimer />
    </div>
  )
}
