import { platforms } from "@/.velite"
import { PlatformCard } from "@/components/platform/PlatformCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Agent Platforms | Agentic Decisions",
  description:
    "Vendor-neutral profiles of enterprise AI agent platforms. Compare capabilities, pricing, and use cases to find the right platform for your needs.",
}

export default function PlatformsPage() {
  return (
    <div className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            AI Agent Platforms
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl">
            Vendor-neutral profiles of enterprise agent platforms. Each profile
            includes verified capabilities, pricing models, and guidance to help
            you make informed decisions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <PlatformCard key={platform.slug} platform={platform} />
          ))}
        </div>

        {platforms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No platforms available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
