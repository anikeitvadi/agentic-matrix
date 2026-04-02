import { platforms } from "@/.velite"
import Link from "next/link"
import { PlatformCard } from "@/components/platform/PlatformCard"
import { groupByTier, getStats, tierMeta } from "@/lib/platform/utils"
import { DataDisclaimer } from "@/components/ui/DataDisclaimer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Agent Platforms | Agentic Matrix",
  description: "Browse structured AI agent platform profiles with pricing, capabilities, and source links.",
}

export default function PlatformsPage() {
  const groups = groupByTier(platforms)
  const stats = getStats(platforms)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Hero header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-serif">
          AI Agent Platforms
        </h1>
        <p className="text-neutral-400 mt-2 max-w-2xl">
          Compare {platforms.length} platforms with structured pricing, capability,
          and integration details.
        </p>
      </header>

      {/* Assessment CTA banner */}
      <Link
        href="/assessment"
        className="flex items-center justify-between p-3 mb-8 border border-brand-700/50 bg-brand-950/30 rounded-lg hover:border-brand-600/50 transition-colors group"
      >
        <span className="text-sm text-brand-400">
          Not sure which platform fits? <span className="font-medium">Take the Assessment</span>
        </span>
        <svg className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {stats.map((s) => (
          <div
            key={s.tier}
            className="flex items-center gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <div>
              <p className="text-lg font-semibold text-white leading-tight">
                {s.count}
              </p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grouped platform sections */}
      <div className="space-y-10">
        {groups.map((group) => {
          const meta = tierMeta[group.tier]
          return (
            <section key={group.tier}>
              {/* Section header */}
              <div className={`border-l-3 ${meta.dot.replace('bg-', 'border-')} pl-3 py-1 mb-4`}>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-white">
                    {meta.label}
                  </h2>
                  <span className="text-sm text-neutral-500">
                    {group.platforms.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.platforms.map((platform) => (
                  <PlatformCard key={platform.slug} platform={platform} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No platforms available yet.</p>
        </div>
      )}

      <div className="mt-10">
        <DataDisclaimer />
      </div>
    </div>
  )
}
