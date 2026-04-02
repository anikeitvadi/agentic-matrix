import Link from "next/link"
import type { Platform } from "@/.velite"
import { tierMeta, getPricingPreview } from "@/lib/platform/utils"

interface PlatformCardProps {
  platform: Platform
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const meta = tierMeta[platform.tier]
  const pricingPreview = getPricingPreview(platform)

  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  )

  const maxTags = 3
  const visibleCaps = platform.capabilities.slice(0, maxTags)
  const overflowCount = platform.capabilities.length - maxTags

  return (
    <Link
      href={`/platforms/${platform.slug}`}
      className={`block group rounded-lg border border-neutral-800 bg-neutral-900/50 ${meta.hoverBorder} transition-all`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${meta.badge}`}
          >
            {meta.label}
          </span>
        </div>
        <h3 className={`font-medium text-white ${meta.hoverText} transition-colors mb-2`}>
          {platform.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
          {platform.description}
        </p>

        {/* Capability tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleCaps.map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded"
            >
              {cap}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2 py-0.5 text-xs text-neutral-500 rounded">
              +{overflowCount} more
            </span>
          )}
        </div>
      </div>

      {/* Footer divider + pricing & date */}
      <div className="border-t border-neutral-800 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium text-neutral-300">{pricingPreview}</span>
        <span>Verified {formattedDate}</span>
      </div>
    </Link>
  )
}
