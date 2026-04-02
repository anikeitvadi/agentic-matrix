'use client'

import * as Slider from '@radix-ui/react-slider'
import { useState, useCallback } from 'react'
import type { UsageParameters } from '@/lib/cost/types'
import { conversationsToTokens } from '@/lib/cost/token-calculator'
import { formatTokenCount } from '@/lib/cost/format'

interface UsageInputPanelProps {
  onUsageChange: (usage: UsageParameters) => void
  initialUsage?: UsageParameters
}

/**
 * Usage presets for quick selection.
 * These represent typical usage tiers for different organization sizes.
 */
const USAGE_PRESETS = [
  { label: 'Starter', value: 5_000, description: 'Small team or pilot' },
  { label: 'Growth', value: 50_000, description: 'Mid-size deployment' },
  { label: 'Enterprise', value: 500_000, description: 'Large-scale operations' },
] as const

/**
 * Slider step values for a smooth logarithmic-feel experience.
 * Values are chosen to provide intuitive increments at each scale.
 */
const SLIDER_STEPS = [
  1_000, 2_000, 5_000, 10_000, 20_000, 50_000,
  100_000, 200_000, 500_000, 1_000_000,
]

/**
 * Format conversation count for display.
 */
function formatConversations(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K`
  }
  return count.toLocaleString()
}

/**
 * Find the closest slider step index for a given value.
 */
function valueToIndex(value: number): number {
  let closestIndex = 0
  let closestDiff = Math.abs(SLIDER_STEPS[0] - value)

  for (let i = 1; i < SLIDER_STEPS.length; i++) {
    const diff = Math.abs(SLIDER_STEPS[i] - value)
    if (diff < closestDiff) {
      closestDiff = diff
      closestIndex = i
    }
  }

  return closestIndex
}

/**
 * Panel for adjusting expected usage volume.
 *
 * Provides a slider to set monthly conversation count with presets
 * for common usage tiers. Shows estimated token usage based on
 * industry averages (2000 input + 500 output tokens per conversation).
 */
export function UsageInputPanel({ onUsageChange, initialUsage }: UsageInputPanelProps) {
  const [sliderIndex, setSliderIndex] = useState(() => {
    if (initialUsage?.monthlyConversations) {
      return valueToIndex(initialUsage.monthlyConversations)
    }
    return valueToIndex(50_000) // Default to Growth tier
  })

  // Preserve the assessment-derived token profile instead of hardcoding
  const avgTokens = initialUsage?.avgTokensPerConversation ?? 2500

  const currentValue = SLIDER_STEPS[sliderIndex]
  const tokenUsage = conversationsToTokens(currentValue, avgTokens)

  const handleSliderChange = useCallback((values: number[]) => {
    const newIndex = values[0]
    setSliderIndex(newIndex)

    const conversations = SLIDER_STEPS[newIndex]
    const tokens = conversationsToTokens(conversations, avgTokens)

    onUsageChange({
      monthlyConversations: conversations,
      monthlyInputTokens: tokens.monthlyInputTokens,
      monthlyOutputTokens: tokens.monthlyOutputTokens,
      avgTokensPerConversation: avgTokens,
    })
  }, [onUsageChange, avgTokens])

  const handlePresetClick = useCallback((value: number) => {
    const index = valueToIndex(value)
    handleSliderChange([index])
  }, [handleSliderChange])

  return (
    <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800">
      <h3 className="text-lg font-semibold mb-2">Expected Usage</h3>
      <p className="text-sm text-neutral-400 mb-6">
        Estimate your monthly AI conversation volume to calculate costs.
        This affects token costs and helps determine the best pricing tier.
      </p>

      {/* Preset buttons */}
      <div className="flex gap-2 mb-6">
        {USAGE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.value)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentValue === preset.value
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-neutral-400">Monthly Conversations</span>
          <span className="text-lg font-semibold text-brand-400">
            {formatConversations(currentValue)}
          </span>
        </div>

        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[sliderIndex]}
          onValueChange={handleSliderChange}
          max={SLIDER_STEPS.length - 1}
          min={0}
          step={1}
          aria-label="Monthly conversations"
        >
          <Slider.Track className="bg-neutral-700 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-brand-600 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-brand-600 rounded-full shadow-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-neutral-900 cursor-grab active:cursor-grabbing"
            aria-label="Monthly conversations slider thumb"
          />
        </Slider.Root>

        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>1K</span>
          <span>1M</span>
        </div>
      </div>

      {/* Token estimate */}
      <div className="p-4 bg-neutral-800 rounded-md">
        <div className="text-sm text-neutral-400 mb-2">Estimated Token Usage</div>
        <div className="flex gap-4">
          <div>
            <span className="text-neutral-300">Input: </span>
            <span className="font-medium text-white">
              ~{formatTokenCount(tokenUsage.monthlyInputTokens)}
            </span>
          </div>
          <div>
            <span className="text-neutral-300">Output: </span>
            <span className="font-medium text-white">
              ~{formatTokenCount(tokenUsage.monthlyOutputTokens)}
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Based on ~{Math.round(avgTokens * 0.8).toLocaleString()} input and ~{Math.round(avgTokens * 0.2).toLocaleString()} output tokens per conversation
        </p>
      </div>
    </div>
  )
}
