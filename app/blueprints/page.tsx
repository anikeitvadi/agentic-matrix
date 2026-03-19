import { blueprints } from "@/.velite"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blueprint Library | Agentic Decisions",
  description: "Implementation-ready guidance for common enterprise AI agent use cases",
}

export default function BlueprintsPage() {
  return (
    <div className="p-8">
      {/* Hero header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Blueprint Library
        </h1>
        <p className="text-neutral-500 mt-2 max-w-2xl">
          Implementation-ready guidance for common enterprise AI agent use cases. Each blueprint includes architecture diagrams, implementation checklists, and platform-specific considerations.
        </p>
      </header>

      {/* Blueprint cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {blueprints.map((blueprint) => (
          <Link
            key={blueprint.slug}
            href={`/blueprints/${blueprint.slug}`}
            className="block p-5 bg-white rounded-lg border border-neutral-200 hover:border-brand-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {blueprint.title}
            </h2>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {blueprint.description}
            </p>

            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  blueprint.complexity === 'simple'
                    ? 'bg-green-100 text-green-800'
                    : blueprint.complexity === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {blueprint.complexity}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                {blueprint.applicablePlatforms.length} platforms
              </span>
            </div>

            {/* Build duration */}
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
