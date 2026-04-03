import type { CostEstimate, CostBreakdown } from '@/lib/cost/types'
import { formatCurrency, formatDuration } from '@/lib/cost/format'

interface PlatformCostCardProps {
  estimate: CostEstimate
  isRecommended?: boolean // Highlight if top recommendation
}

/**
 * Platform Cost Card
 *
 * Displays a detailed cost breakdown for a single platform.
 *
 * Includes:
 * - Platform header with name and pricing model badge
 * - Monthly cost summary
 * - Itemized cost breakdown table
 * - TCO projections for 1/2/3 years
 * - Engineering time estimate
 */
export function PlatformCostCard({ estimate, isRecommended = false }: PlatformCostCardProps) {
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm h-full ${
        isRecommended
          ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-950/20'
          : 'border-neutral-800 bg-neutral-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{estimate.platformName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <PricingModelBadge model={estimate.pricingModel} />
            {isRecommended && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-brand-900/50 text-brand-400 border border-brand-700">
                Recommended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Cost Summary */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-brand-400 tabular-nums">
          {formatCurrency(estimate.monthlyTotal)}/month
        </div>
        <p className="text-sm text-neutral-400 mt-1">
          Platform: {formatCurrency(estimate.monthlyBaseCost)} + Usage:{' '}
          {formatCurrency(estimate.monthlyUsageCost)}
        </p>
      </div>

      {/* Cost Breakdown Table */}
      {estimate.breakdown.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Cost Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-2 pr-4 text-neutral-400 font-medium">Item</th>
                  <th className="text-right py-2 px-4 text-neutral-400 font-medium">Monthly</th>
                  <th className="text-right py-2 pl-4 text-neutral-400 font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {estimate.breakdown.map((item, index) => (
                  <BreakdownRow key={`${item.category}-${index}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TCO Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-300 mb-3">Total Cost of Ownership</h4>
        <div className="grid grid-cols-3 gap-4">
          <TCOColumn label="1 Year" value={estimate.tcoPeriods.months12} />
          <TCOColumn label="2 Years" value={estimate.tcoPeriods.months24} />
          <TCOColumn label="3 Years" value={estimate.tcoPeriods.months36} />
        </div>
      </div>

      {/* Engineering Time */}
      <div className="pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Implementation estimate</span>
          <span className="text-sm font-medium tabular-nums">
            {formatDuration(estimate.engineeringDays)}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Engineering cost: {formatCurrency(estimate.engineeringCost)} (based on platform complexity)
        </p>
      </div>
    </div>
  )
}

/**
 * Pricing model badge component.
 */
function PricingModelBadge({
  model,
}: {
  model: 'pay-per-use' | 'subscription' | 'per-conversation' | 'hybrid'
}) {
  const labels: Record<typeof model, string> = {
    'pay-per-use': 'Pay-per-use',
    subscription: 'Subscription',
    'per-conversation': 'Per Conversation',
    hybrid: 'Hybrid',
  }

  const colors: Record<typeof model, string> = {
    'pay-per-use': 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
    subscription: 'bg-sky-900/50 text-sky-400 border-sky-700',
    'per-conversation': 'bg-amber-900/50 text-amber-400 border-amber-700',
    hybrid: 'bg-violet-900/50 text-violet-400 border-violet-700',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${colors[model]}`}
    >
      {labels[model]}
    </span>
  )
}

/**
 * Cost breakdown row with category icon.
 */
function BreakdownRow({ item }: { item: CostBreakdown }) {
  return (
    <tr className="border-b border-neutral-800 last:border-b-0">
      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <CategoryIcon category={item.category} />
          <div>
            <span className="text-neutral-200">{item.item}</span>
            {item.notes && <p className="text-xs text-neutral-500 mt-0.5">{item.notes}</p>}
          </div>
        </div>
      </td>
      <td className="py-2 px-4 text-right tabular-nums text-neutral-200">
        {item.monthlyCost > 0 ? formatCurrency(item.monthlyCost) : '-'}
      </td>
      <td className="py-2 pl-4 text-right tabular-nums text-neutral-200">
        {formatCurrency(item.annualCost)}
      </td>
    </tr>
  )
}

/**
 * Category icon for cost breakdown items.
 */
function CategoryIcon({ category }: { category: CostBreakdown['category'] }) {
  const iconClass = 'w-4 h-4 text-neutral-400'

  switch (category) {
    case 'platform':
      // Building icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      )
    case 'token':
      // Coins icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case 'infrastructure':
      // Server icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      )
    case 'personnel':
      // Users icon
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )
    default:
      return null
  }
}

/**
 * TCO column for year projections.
 */
function TCOColumn({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 rounded-lg bg-neutral-800/50">
      <div className="text-xs text-neutral-400 mb-1">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{formatCurrency(value, { compact: true })}</div>
    </div>
  )
}

export type { PlatformCostCardProps }
