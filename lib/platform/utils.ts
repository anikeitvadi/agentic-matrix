import type { Platform } from "@/.velite"

export type TierKey = Platform["tier"]

export const tierMeta: Record<
  TierKey,
  {
    label: string
    badge: string          // pill badge classes
    dot: string            // small dot color
    tint: string           // card background tint
    hoverBorder: string    // border on hover
    hoverText: string      // title color on hover
    capabilityBadge: string // capability tag styling on detail page
  }
> = {
  "enterprise-os": {
    label: "Enterprise OS",
    badge: "bg-blue-950/40 text-blue-400 ring-1 ring-blue-500/30",
    dot: "bg-blue-500",
    tint: "bg-neutral-900/50",
    hoverBorder: "hover:border-blue-700/50",
    hoverText: "group-hover:text-blue-400",
    capabilityBadge: "bg-blue-950/40 text-blue-400",
  },
  "ipaas-agent": {
    label: "iPaaS + Agent",
    badge: "bg-green-950/40 text-green-400 ring-1 ring-green-500/30",
    dot: "bg-green-500",
    tint: "bg-neutral-900/50",
    hoverBorder: "hover:border-green-700/50",
    hoverText: "group-hover:text-green-400",
    capabilityBadge: "bg-green-950/40 text-green-400",
  },
  "developer-first": {
    label: "Developer-First",
    badge: "bg-purple-950/40 text-purple-400 ring-1 ring-purple-500/30",
    dot: "bg-purple-500",
    tint: "bg-neutral-900/50",
    hoverBorder: "hover:border-purple-700/50",
    hoverText: "group-hover:text-purple-400",
    capabilityBadge: "bg-purple-950/40 text-purple-400",
  },
  vertical: {
    label: "Vertical",
    badge: "bg-orange-950/40 text-orange-400 ring-1 ring-orange-500/30",
    dot: "bg-orange-500",
    tint: "bg-neutral-900/50",
    hoverBorder: "hover:border-orange-700/50",
    hoverText: "group-hover:text-orange-400",
    capabilityBadge: "bg-orange-950/40 text-orange-400",
  },
}

export const pricingModelLabels: Record<Platform["pricing"]["model"], string> = {
  "pay-per-use": "Pay-per-use",
  subscription: "Subscription",
  "per-conversation": "Per-conversation",
  hybrid: "Hybrid",
}

/** Returns a human-friendly pricing preview string */
export function getPricingPreview(platform: Platform): string {
  const { pricing } = platform

  if (pricing.perConversationRate) {
    return `$${pricing.perConversationRate}/conversation`
  }

  if (pricing.tiers?.length && !pricing.tokenPricing) {
    const lowest = pricing.tiers.reduce((min, t) =>
      t.monthlyPrice < min.monthlyPrice ? t : min
    )
    return `From $${lowest.monthlyPrice.toLocaleString()}/mo`
  }

  if (pricing.tokenPricing) {
    const tp = pricing.tokenPricing
    if (tp.modelVariants?.length) {
      const cheapest = tp.modelVariants.reduce((min, v) =>
        v.inputPrice < min.inputPrice ? v : min
      )
      return `From $${cheapest.inputPrice}/1M tokens`
    }
    return `$${tp.inputPricePerMillion}/1M input tokens`
  }

  if (pricing.tiers?.length) {
    const lowest = pricing.tiers.reduce((min, t) =>
      t.monthlyPrice < min.monthlyPrice ? t : min
    )
    return `From $${lowest.monthlyPrice.toLocaleString()}/mo`
  }

  return pricingModelLabels[pricing.model]
}

/** Group platforms by tier, preserving a consistent tier order */
export function groupByTier(
  allPlatforms: Platform[]
): { tier: TierKey; platforms: Platform[] }[] {
  const order: TierKey[] = [
    "enterprise-os",
    "ipaas-agent",
    "developer-first",
    "vertical",
  ]

  return order
    .map((tier) => ({
      tier,
      platforms: allPlatforms.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.platforms.length > 0)
}

/** Counts by tier for the stats row */
export function getStats(allPlatforms: Platform[]) {
  const order: TierKey[] = [
    "enterprise-os",
    "ipaas-agent",
    "developer-first",
    "vertical",
  ]

  return order.map((tier) => ({
    tier,
    label: tierMeta[tier].label,
    dot: tierMeta[tier].dot,
    count: allPlatforms.filter((p) => p.tier === tier).length,
  }))
}
