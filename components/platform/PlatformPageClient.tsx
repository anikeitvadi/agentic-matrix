'use client'

import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { PlatformCard } from '@/components/platform/PlatformCard'
import { tierMeta } from '@/lib/platform/utils'
import type { Platform } from '@/.velite'

type StatItem = {
  tier: string
  label: string
  count: number
  dot: string
}

type GroupItem = {
  tier: string
  platforms: Platform[]
}

export function PlatformPageClient({ stats, groups }: { stats: StatItem[]; groups: GroupItem[] }) {
  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {stats.map((s, i) => (
          <ScrollReveal key={s.tier} delay={i * 60}>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-3.5 transition-all hover:border-neutral-700">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot} shadow-[0_0_6px] shadow-current`} />
              <div>
                <p className="font-heading text-lg font-bold text-white leading-tight">{s.count}</p>
                <p className="text-xs text-neutral-500">{s.label}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Grouped sections */}
      <div className="space-y-12">
        {groups.map((group) => {
          const meta = tierMeta[group.tier as keyof typeof tierMeta]
          if (!meta) return null
          return (
            <section key={group.tier}>
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-5 w-1 rounded-full ${meta.dot}`} />
                  <h2 className="font-heading text-lg font-bold text-white">{meta.label}</h2>
                  <span className="font-mono text-sm text-neutral-500">{group.platforms.length}</span>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.platforms.map((platform, i) => (
                  <ScrollReveal key={platform.slug} delay={i * 50}>
                    <PlatformCard platform={platform} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
