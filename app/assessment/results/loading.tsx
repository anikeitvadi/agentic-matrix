export default function ResultsLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6">
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
          <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-xl bg-brand-500/20 blur-xl animate-glow-pulse" />
      </div>
      <div className="text-center">
        <p className="font-heading text-sm font-semibold text-neutral-300">Calculating recommendations</p>
        <p className="mt-1 font-mono text-xs text-neutral-500">Scoring platforms against your requirements...</p>
      </div>
      {/* Skeleton shimmer bars */}
      <div className="mt-4 w-full max-w-md space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg animate-shimmer" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  )
}
