'use client'

import { type ReactNode } from 'react'

type Variant = 'default' | 'strong' | 'accent'

const variantClasses: Record<Variant, string> = {
  default: 'glass-card',
  strong: 'glass-card-strong',
  accent: 'glass-card-accent',
}

export function AnimatedCard({
  children,
  variant = 'default',
  className = '',
  hover = true,
  glow = false,
  as: Tag = 'div',
  ...props
}: {
  children: ReactNode
  variant?: Variant
  className?: string
  hover?: boolean
  glow?: boolean
  as?: 'div' | 'article' | 'section'
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`
        ${variantClasses[variant]}
        ${hover ? 'glow-border' : ''}
        ${glow ? 'animate-glow-pulse' : ''}
        transition-all duration-300
        ${hover ? 'hover:-translate-y-0.5' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
