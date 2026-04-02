import Link from 'next/link'
import { type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-brand-500 text-white font-semibold',
    'shadow-lg shadow-brand-900/40',
    'hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-800/40',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
  ].join(' '),
  secondary: [
    'border border-neutral-700 text-neutral-300 font-semibold',
    'hover:border-brand-600/50 hover:text-white',
    'hover:bg-brand-950/30',
    'hover:-translate-y-0.5',
  ].join(' '),
  ghost: [
    'text-neutral-400 font-medium',
    'hover:text-neutral-200',
    'hover:bg-neutral-800/50',
  ].join(' '),
}

const sizeClasses = {
  sm: 'px-5 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-7 py-3 text-sm rounded-full gap-2',
  lg: 'px-8 py-3.5 text-base rounded-full gap-2',
}

type BaseProps = {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: ReactNode
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

type LinkProps = BaseProps & {
  href: string
}

type Props = ButtonProps | LinkProps

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  ...props
}: Props) {
  const classes = `
    inline-flex items-center justify-center
    transition-all duration-200
    cursor-pointer
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const content = (
    <>
      {children}
      {icon && <span className="inline-flex">{icon}</span>}
    </>
  )

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    )
  }

  const { href: _, ...buttonProps } = props as ButtonProps
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  )
}
