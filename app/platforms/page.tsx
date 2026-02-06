import { platforms } from "@/.velite"
import { PlatformCard } from "@/components/platform/PlatformCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Platforms | Agentic Decisions",
  description: "Browse AI agent platforms with verified capabilities and pricing.",
}

export default function PlatformsPage() {
  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Platforms
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {platforms.length} platforms with verified data
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
  )
}
