"use client"

import { useEffect } from "react"
import { GlowButton } from "@/components/ui/GlowButton"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      {/* Glitch-style error indicator */}
      <div className="relative">
        <p className="font-mono text-6xl font-bold text-red-500/80 neon-text">ERR</p>
        <p
          className="absolute inset-0 font-mono text-6xl font-bold text-red-400/30"
          style={{ transform: 'translate(2px, -2px)', clipPath: 'inset(10% 0 60% 0)' }}
          aria-hidden="true"
        >
          ERR
        </p>
      </div>

      <h1 className="mt-6 font-heading text-3xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-center text-neutral-400">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8">
        <GlowButton variant="primary" onClick={reset}>
          Try again
        </GlowButton>
      </div>
    </div>
  )
}
