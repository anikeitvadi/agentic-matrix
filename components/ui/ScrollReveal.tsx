'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Direction = 'up' | 'left' | 'right' | 'scale' | 'fade'

const directionStyles: Record<Direction, { from: string; to: string }> = {
  up: {
    from: 'opacity-0 translate-y-6',
    to: 'opacity-100 translate-y-0',
  },
  left: {
    from: 'opacity-0 translate-x-8',
    to: 'opacity-100 translate-x-0',
  },
  right: {
    from: 'opacity-0 -translate-x-8',
    to: 'opacity-100 translate-x-0',
  },
  scale: {
    from: 'opacity-0 scale-[0.92]',
    to: 'opacity-100 scale-100',
  },
  fade: {
    from: 'opacity-0',
    to: 'opacity-100',
  },
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  threshold?: number
  className?: string
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true) // Start visible to avoid blank content

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    // Only animate if element is NOT already in viewport
    const rect = el.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (inViewport) {
      setVisible(true)
      return
    }

    // Element is below fold — hide it and animate on scroll
    setVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const styles = directionStyles[direction]

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? styles.to : styles.from
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
