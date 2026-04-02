'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

export interface FilterValues {
  budgetRange: string
  compliance: string[]
  stack: string[]
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void
}

/**
 * Filter panel for narrowing platform recommendations.
 *
 * Filters align to assessment vocabulary:
 * - Budget: annual display ranges (under-10k, 10k-50k, 50k-200k, 200k-plus)
 * - Compliance: SOC2, HIPAA, GDPR
 * - Stack: infrastructure values (AWS, Azure, GCP, On-premise, Hybrid)
 */
export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const { register, watch } = useForm<FilterValues>({
    defaultValues: {
      budgetRange: 'all',
      compliance: [],
      stack: [],
    },
  })

  const values = watch()
  const prevRef = useRef('')

  useEffect(() => {
    const serialized = JSON.stringify(values)
    if (serialized !== prevRef.current) {
      prevRef.current = serialized
      onFilterChange(values)
    }
  }, [values, onFilterChange])

  const complianceOptions = [
    { value: 'soc2', label: 'SOC 2' },
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'gdpr', label: 'GDPR' },
  ]

  const stackOptions = [
    { value: 'aws', label: 'AWS' },
    { value: 'azure', label: 'Azure' },
    { value: 'gcp', label: 'GCP' },
    { value: 'on-premise', label: 'On-premise' },
    { value: 'hybrid', label: 'Hybrid' },
  ]

  return (
    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 sticky top-4">
      <h3 className="font-semibold mb-4 text-lg">Filter Platforms</h3>

      {/* Budget filter — annual ranges */}
      <div className="mb-6">
        <label
          htmlFor="budgetRange"
          className="block text-sm font-medium mb-2 text-neutral-300"
        >
          Budget Range
        </label>
        <select
          id="budgetRange"
          {...register('budgetRange')}
          className="w-full p-2 bg-neutral-800 rounded-lg border border-neutral-700 text-neutral-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All budgets</option>
          <option value="under-10k">&lt;$10k/year</option>
          <option value="10k-50k">$10k–$50k/year</option>
          <option value="50k-200k">$50k–$200k/year</option>
          <option value="200k-plus">$200k+/year</option>
        </select>
      </div>

      {/* Compliance checkboxes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Compliance Requirements
        </label>
        <div className="space-y-2">
          {complianceOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-neutral-200 cursor-pointer hover:text-white"
            >
              <input
                type="checkbox"
                value={option.value}
                {...register('compliance')}
                className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-neutral-900"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Infrastructure stack checkboxes */}
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Tech Stack
        </label>
        <div className="space-y-2">
          {stackOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-neutral-200 cursor-pointer hover:text-white"
            >
              <input
                type="checkbox"
                value={option.value}
                {...register('stack')}
                className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-neutral-900"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Active filters count */}
      {(values.budgetRange !== 'all' ||
        values.compliance.length > 0 ||
        values.stack.length > 0) && (
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-400">
            Active filters:{' '}
            {[
              values.budgetRange !== 'all' ? 1 : 0,
              values.compliance.length,
              values.stack.length,
            ].reduce((a, b) => a + b, 0)}
          </p>
        </div>
      )}
    </div>
  )
}
