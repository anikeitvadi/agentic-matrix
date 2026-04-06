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
import { isEstimatedAnnualCostInDisplayRange, type BudgetFilterRange } from '@/lib/assessment/budget-ranges'

interface ComparisonMatrixProps {
  scores: PlatformScore[]
  platforms: Platform[]
  filters: FilterValues
}

const columnHelper = createColumnHelper<PlatformScore>()

export function ComparisonMatrix({ scores, platforms, filters }: ComparisonMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalScore', desc: true },
  ])

  // Define evidence-first columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('platformName', {
        header: 'Platform',
        cell: (info) => {
          const row = info.row.original
          const hasHardFail = row.gateFailures?.some(g => g.severity === 'hard')
          return (
            <div>
              <Link
                href={`/platforms/${row.platformId}`}
                className="font-medium hover:text-brand-400 transition-colors"
              >
                {info.getValue()}
              </Link>
              {hasHardFail && (
                <span className="ml-2 text-[10px] text-red-400 font-medium uppercase">Req gap</span>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor('totalScore', {
        header: 'Score',
        cell: (info) => (
          <span className="font-bold text-brand-500">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) => row.evidence?.annualCostEstimate ?? 0,
        {
          id: 'annualCost',
          header: 'Est. Annual',
          cell: (info) => {
            const val = info.getValue()
            if (!val) return <span className="text-neutral-500">—</span>
            return <span className="font-mono text-sm">${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}</span>
          },
        }
      ),
      columnHelper.accessor(
        (row) => {
          const e = row.evidence
          if (!e || e.hardRequirementsTotal === 0) return 1
          return e.hardRequirementsMet / e.hardRequirementsTotal
        },
        {
          id: 'requirements',
          header: 'Requirements',
          cell: (info) => {
            const row = info.row.original
            const e = row.evidence
            if (!e || e.hardRequirementsTotal === 0) return <span className="text-neutral-500">—</span>
            const allMet = e.hardRequirementsMet === e.hardRequirementsTotal
            return (
              <span className={allMet ? 'text-emerald-400' : 'text-red-400'}>
                {e.hardRequirementsMet}/{e.hardRequirementsTotal}
              </span>
            )
          },
        }
      ),
      columnHelper.accessor(
        (row) => row.implementationRisk?.score ?? 50,
        {
          id: 'risk',
          header: 'Risk',
          cell: (info) => {
            const risk = info.row.original.implementationRisk
            if (!risk) return <span className="text-neutral-500">—</span>
            const color = risk.label === 'Low' ? 'text-emerald-400' : risk.label === 'Medium' ? 'text-amber-400' : 'text-red-400'
            return <span className={`text-sm font-medium ${color}`}>{risk.label}</span>
          },
        }
      ),
      columnHelper.accessor(
        (row) => row.evidence?.vendorViability ?? '',
        {
          id: 'vendor',
          header: 'Vendor',
          cell: (info) => (
            <span className="text-sm capitalize">{info.getValue() || '—'}</span>
          ),
        }
      ),
      columnHelper.accessor(
        (row) => row.evidence?.deploymentOptions?.join(', ') ?? '',
        {
          id: 'deployment',
          header: 'Deploy',
          cell: (info) => (
            <span className="text-xs text-neutral-400">{info.getValue() || 'SaaS'}</span>
          ),
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-heading text-lg font-bold text-white">
          All platforms ({filteredData.length}/{scores.length})
        </h3>
        <span className="text-xs text-neutral-500">Sortable by any column</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-950/50">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-950/95">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 cursor-pointer hover:text-neutral-200 select-none"
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
                  className="p-10 text-center text-neutral-400"
                >
                  No platforms match your filters. Try adjusting your criteria.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-neutral-800/70 hover:bg-neutral-900/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm align-top">
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
    const platform = platforms.find((p) => p.slug === score.platformId)
    if (!platform) return false

    // Budget filter: use estimated annual cost from scoring
    if (filters.budgetRange !== 'all') {
      const annualCost = score.recommendationSummary?.estimatedAnnualCost
      if (annualCost == null) return false // Exclude if no cost estimate

      if (!isEstimatedAnnualCostInDisplayRange(annualCost, filters.budgetRange as BudgetFilterRange)) {
        return false
      }
    }

    // Compliance filter: check structuredCapabilities.complianceCerts
    if (filters.compliance.length > 0) {
      const certs = platform.structuredCapabilities?.complianceCerts ?? []
      const certsLower = certs.map((c: string) => c.toLowerCase())
      const hasAllRequired = filters.compliance.every((req) =>
        certsLower.includes(req.toLowerCase())
      )
      if (!hasAllRequired) return false
    }

    // Stack filter: check structuredCapabilities.cloudNative + deployment
    if (filters.stack.length > 0) {
      const cloudNative = platform.structuredCapabilities?.cloudNative ?? []
      const deploymentOptions = platform.structuredCapabilities?.deploymentOptions ?? []
      const hasSelfHosted = platform.structuredCapabilities?.hasSelfHosted ?? false

      const hasStackMatch = filters.stack.some((stack) => {
        const stackLower = stack.toLowerCase()
        // Cloud provider match
        if (cloudNative.some((c: string) => c.toLowerCase() === stackLower)) return true
        // On-premise / hybrid match
        if (stackLower === 'on-premise' && (hasSelfHosted || deploymentOptions.includes('on-prem') || deploymentOptions.includes('vpc'))) return true
        if (stackLower === 'hybrid' && (deploymentOptions.includes('hybrid-cloud') || hasSelfHosted)) return true
        return false
      })

      if (!hasStackMatch) return false
    }

    return true
  })
}
