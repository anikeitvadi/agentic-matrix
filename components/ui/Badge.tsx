import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
type TierColor = 'blue' | 'green' | 'purple' | 'orange'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-neutral-700 bg-neutral-800/60 text-neutral-300',
  brand: 'border-brand-700/30 bg-brand-900/50 text-brand-400',
  success: 'border-emerald-800/50 bg-emerald-950/40 text-emerald-400',
  warning: 'border-amber-800/50 bg-amber-950/40 text-amber-400',
  danger: 'border-red-800/50 bg-red-950/40 text-red-400',
  info: 'border-sky-800/50 bg-sky-950/40 text-sky-400',
}

const tierClasses: Record<TierColor, string> = {
  blue: 'border-blue-800/50 bg-blue-950/40 text-blue-400',
  green: 'border-green-800/50 bg-green-950/40 text-green-400',
  purple: 'border-purple-800/50 bg-purple-950/40 text-purple-400',
  orange: 'border-orange-800/50 bg-orange-950/40 text-orange-400',
}

export function Badge({
  children,
  variant = 'default',
  tier,
  size = 'sm',
  glow = false,
  className = '',
}: {
  children: ReactNode
  variant?: BadgeVariant
  tier?: TierColor
  size?: 'xs' | 'sm'
  glow?: boolean
  className?: string
}) {
  const colorClass = tier ? tierClasses[tier] : variantClasses[variant]
  const sizeClass = size === 'xs'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-3 py-1 text-xs'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-semibold
        ${colorClass}
        ${sizeClass}
        ${glow ? 'animate-glow-pulse' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  )
}
