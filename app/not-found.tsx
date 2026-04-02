import { GlowButton } from "@/components/ui/GlowButton"

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-brand-500/5 blur-3xl" />

      {/* Large 404 */}
      <p className="font-mono text-[120px] font-bold leading-none text-neutral-800/60 sm:text-[160px]">
        404
      </p>

      <h1 className="mt-2 font-heading text-3xl font-bold text-white">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-center text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8">
        <GlowButton href="/" variant="primary">
          Back to home
        </GlowButton>
      </div>
    </div>
  )
}
