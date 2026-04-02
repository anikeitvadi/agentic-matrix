export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      {/* Pulsing logo mark */}
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/40">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl animate-glow-pulse" />
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" style={{ animation: 'typing-dot 1.4s infinite 0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" style={{ animation: 'typing-dot 1.4s infinite 200ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" style={{ animation: 'typing-dot 1.4s infinite 400ms' }} />
      </div>
    </div>
  )
}
