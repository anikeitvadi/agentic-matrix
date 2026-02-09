'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import Link from 'next/link'
import type { PlatformScore } from '@/lib/scoring/types'
import type { Platform } from '@/.velite'
import type { FilterValues } from './FilterPanel'

interface ComparisonMatrixProps {
  scores: PlatformScore[]
  platforms: Platform[]
  filters: FilterValues
}

const columnHelper = createColumnHelper<PlatformScore>()

/**
 * Comparison matrix using TanStack Table.
 *
 * Displays all platforms with sortable columns for:
 * - Platform name
 * - Total score (0-100)
 * - Individual criterion percentages (Integration, Compliance, Budget, Features, Stack)
 *
 * Filters are applied before rendering to reduce visible rows.
 */
export function ComparisonMatrix({ scores, platforms, filters }: ComparisonMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalScore', desc: true },
  ])

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('platformName', {
        header: 'Platform',
        cell: (info) => (
          <Link
            href={`/platforms/${info.row.original.platformId}`}
            className="font-medium hover:text-brand-400 transition-colors"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('totalScore', {
        header: 'Score',
        cell: (info) => (
          <span className="font-bold text-brand-500">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) =>
          row.criteriaScores.find((c) => c.name === 'integrationFit')?.normalizedValue ?? 0,
        {
          id: 'integrationFit',
          header: 'Integration',
          cell: (info) => formatPercent(info.getValue()),
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.criteriaScores.find((c) => c.name === 'complianceMatch')?.normalizedValue ?? 0,
        {
          id: 'complianceMatch',
          header: 'Compliance',
          cell: (info) => formatPercent(info.getValue()),
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.criteriaScores.find((c) => c.name === 'budgetFit')?.normalizedValue ?? 0,
        {
          id: 'budgetFit',
          header: 'Budget Fit',
          cell: (info) => formatPercent(info.getValue()),
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.criteriaScores.find((c) => c.name === 'featureMatch')?.normalizedValue ?? 0,
        {
          id: 'featureMatch',
          header: 'Features',
          cell: (info) => formatPercent(info.getValue()),
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.criteriaScores.find((c) => c.name === 'stackCompatibility')?.normalizedValue ?? 0,
        {
          id: 'stackCompatibility',
          header: 'Stack Fit',
          cell: (info) => formatPercent(info.getValue()),
        }
      ),
    ],
    []
  )

  // Apply filters to scores using memoization
  const filteredData = useMemo(() => {
    return applyFilters(scores, platforms, filters)
  }, [scores, platforms, filters])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Comparison Matrix</h2>
        <p className="text-sm text-neutral-400">
          {filteredData.length} of {scores.length} platforms
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left text-sm font-medium text-neutral-400 cursor-pointer hover:text-neutral-200 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIndicator
                        isSorted={header.column.getIsSorted()}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-neutral-400"
                >
                  No platforms match your filters. Try adjusting your criteria.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-neutral-800 hover:bg-neutral-900/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Sort indicator component for table headers.
 */
function SortIndicator({ isSorted }: { isSorted: false | 'asc' | 'desc' }) {
  if (!isSorted) {
    return (
      <span className="text-neutral-600 ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </span>
    )
  }

  return (
    <span className="text-brand-400 ml-1">
      {isSorted === 'asc' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </span>
  )
}

/**
 * Format normalized value (0-1) as percentage string.
 */
function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Apply filters to platform scores.
 *
 * Filter logic:
 * - Budget: Match platform.tier to budget range
 * - Compliance: enterprise-os and vertical tiers imply compliance support
 * - Stack: Check capabilities text + tier fallback for SDK-heavy platforms
 */
function applyFilters(
  scores: PlatformScore[],
  platforms: Platform[],
  filters: FilterValues
): PlatformScore[] {
  return scores.filter((score) => {
    // Find the full platform data for this score
    const platform = platforms.find((p) => p.slug === score.platformId)
    if (!platform) return false

    // Budget filter: map platform tier to budget range
    if (filters.budgetRange !== 'all') {
      const tierBudgetMap: Record<string, string[]> = {
        'under-1000': ['developer-first'],
        '1000-5000': ['developer-first', 'ipaas-agent'],
        'enterprise': ['enterprise-os', 'ipaas-agent', 'vertical'],
      }
      const allowedTiers = tierBudgetMap[filters.budgetRange] || []
      if (!allowedTiers.includes(platform.tier)) {
        return false
      }
    }

    // Compliance filter: check if platform tier suggests compliance support
    if (filters.compliance.length > 0) {
      // Enterprise-os and vertical tiers typically have compliance certifications
      const hasComplianceSupport =
        platform.tier === 'enterprise-os' || platform.tier === 'vertical'

      // Also check capabilities for compliance-related terms
      const capabilitiesText = platform.capabilities.join(' ').toLowerCase()
      const hasComplianceCap = filters.compliance.some(
        (req) =>
          capabilitiesText.includes(req.toLowerCase()) ||
          capabilitiesText.includes('compliance') ||
          capabilitiesText.includes('enterprise-sso') ||
          capabilitiesText.includes('audit')
      )

      if (!hasComplianceSupport && !hasComplianceCap) {
        return false
      }
    }

    // Stack filter: check capabilities for SDK/language mentions
    if (filters.stack.length > 0) {
      const capabilitiesText = platform.capabilities.join(' ').toLowerCase()

      // Check if any selected stack technology is mentioned
      const hasStackMatch = filters.stack.some(
        (tech) =>
          capabilitiesText.includes(tech.toLowerCase()) ||
          // Developer-first and enterprise-os typically have broad SDK support
          platform.tier === 'developer-first' ||
          platform.tier === 'enterprise-os'
      )

      if (!hasStackMatch) {
        return false
      }
    }

    return true
  })
}
