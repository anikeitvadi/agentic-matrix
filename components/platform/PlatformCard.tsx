import Link from "next/link"
import type { Platform } from "@/.velite"

interface PlatformCardProps {
  platform: Platform
}

const tierStyles = {
  "enterprise-os": "bg-brand-100 text-brand-800 border-brand-300",
  "ipaas-agent": "bg-green-100 text-green-800 border-green-300",
  "developer-first": "bg-purple-100 text-purple-800 border-purple-300",
  vertical: "bg-orange-100 text-orange-800 border-orange-300",
}

const tierLabels = {
  "enterprise-os": "Enterprise OS",
  "ipaas-agent": "iPaaS + Agent",
  "developer-first": "Developer-First",
  vertical: "Vertical",
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  )

  return (
    <Link
      href={`/platforms/${platform.slug}`}
      className="block group bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
            {platform.title}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${tierStyles[platform.tier]}`}
          >
            {tierLabels[platform.tier]}
          </span>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {platform.description}
        </p>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {platform.capabilities.slice(0, 3).map((capability) => (
              <span
                key={capability}
                className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded"
              >
                {capability}
              </span>
            ))}
            {platform.capabilities.length > 3 && (
              <span className="px-2 py-1 text-xs text-neutral-500">
                +{platform.capabilities.length - 3} more
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            Last verified: {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  )
}
