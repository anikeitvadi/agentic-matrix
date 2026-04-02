import { blueprints } from "@/.velite"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blueprint Library | Agentic Decisions",
  description: "Implementation-ready guidance for common enterprise AI agent use cases",
}

export default function BlueprintsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-serif">
          Blueprint Library
        </h1>
        <p className="text-neutral-400 mt-2 max-w-2xl">
          Implementation-ready guidance for common enterprise AI agent use cases. Each blueprint includes architecture diagrams, implementation checklists, and platform-specific considerations.
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {blueprints.map((blueprint) => (
          <Link
            key={blueprint.slug}
            href={`/blueprints/${blueprint.slug}`}
            className="group block p-5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:border-brand-500/50 transition-all"
          >
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
              {blueprint.title}
            </h2>
            <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
              {blueprint.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  blueprint.complexity === 'simple'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                    : blueprint.complexity === 'moderate'
                    ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                    : 'bg-red-950/40 text-red-400 border border-red-800/30'
                }`}
              >
                {blueprint.complexity}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-neutral-800 text-neutral-400 rounded-full">
                {blueprint.applicablePlatforms.length} platforms
              </span>
            </div>

            <p className="text-xs text-neutral-500">
              Build time: {blueprint.estimatedDuration.build}
            </p>
          </Link>
        ))}
      </div>

      {blueprints.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No blueprints available yet.</p>
        </div>
      )}
    </div>
  )
}
