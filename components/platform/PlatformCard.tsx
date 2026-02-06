import Link from "next/link"
import type { Platform } from "@/.velite"

interface PlatformCardProps {
  platform: Platform
}

const tierColors = {
  "enterprise-os": "bg-blue-500",
  "ipaas-agent": "bg-green-500",
  "developer-first": "bg-purple-500",
  vertical: "bg-orange-500",
}

const tierLabels = {
  "enterprise-os": "Enterprise",
  "ipaas-agent": "iPaaS",
  "developer-first": "Dev-First",
  vertical: "Vertical",
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  )

  return (
    <Link
      href={`/platforms/${platform.slug}`}
      className="block group bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2 h-2 rounded-full ${tierColors[platform.tier]}`} />
          <h3 className="font-medium text-neutral-900 group-hover:text-brand-600 transition-colors truncate">
            {platform.title}
          </h3>
          <span className="ml-auto text-xs text-neutral-400 shrink-0">
            {tierLabels[platform.tier]}
          </span>
        </div>

        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
          {platform.description}
        </p>

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{platform.pricing.model}</span>
          <span>Verified {formattedDate}</span>
        </div>
      </div>
    </Link>
  )
}
