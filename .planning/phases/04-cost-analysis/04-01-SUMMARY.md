---
phase: 04-cost-analysis
plan: 01
subsystem: cost
tags: [recharts, radix-slider, velite, pricing, tco]

# Dependency graph
requires:
  - phase: 01-foundation-platform-data
    provides: velite platform schema with basic pricing
provides:
  - Cost type definitions (9+ interfaces) in lib/cost/types.ts
  - Extended velite pricing schema with tokenPricing, tiers, perConversationRate
  - Structured pricing data in all 11 platform MDX files
  - Dependencies for cost UI (recharts, @radix-ui/react-slider)
affects: [04-02, 04-03, 04-04 cost calculators and UI components]

# Tech tracking
tech-stack:
  added: [recharts, @radix-ui/react-slider]
  patterns: [structured pricing schema, 4-model pricing taxonomy]

key-files:
  created:
    - lib/cost/types.ts
  modified:
    - velite.config.ts
    - content/platforms/*.mdx (all 11 files)
    - package.json

key-decisions:
  - "Four pricing model enum: pay-per-use, subscription, per-conversation, hybrid"
  - "TokenPricing includes modelVariants array for multi-model platforms"
  - "SubscriptionTier uses generic unitType enum for flexibility"
  - "PERT formula for engineering estimates (optimistic + 4*likely + pessimistic) / 6"
  - "Default TCO config: $800/day engineering, 15% infra markup, 20% contingency"

patterns-established:
  - "Pricing enum in velite must match PricingModel type in lib/cost/types.ts"
  - "All platforms must have valid enum pricing model value"

# Metrics
duration: 3min
completed: 2026-02-10
---

# Phase 04 Plan 01: Cost Analysis Foundation Summary

**Cost type infrastructure with 9+ interfaces, extended velite pricing schema supporting 4 pricing models, and structured pricing data across all 11 platforms**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-10T15:03:11Z
- **Completed:** 2026-02-10T15:06:30Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Installed recharts and @radix-ui/react-slider for cost visualization UI
- Created comprehensive cost type system in lib/cost/types.ts with PricingModel, TokenPricing, SubscriptionTier, PricingData, UsageParameters, CostBreakdown, CostEstimate, EngineeringEstimate, PlatformComplexity, TcoConfig
- Extended velite pricing schema to support all four pricing models with structured data fields
- Updated all 11 platform MDX files with structured pricing data representing all 4 pricing models

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create cost types** - `4478ef7` (feat)
2. **Task 2: Extend velite pricing schema** - `ce21182` (feat)
3. **Task 3: Update platform MDX with structured pricing** - `822b252` (feat)

## Files Created/Modified

- `lib/cost/types.ts` - Cost calculation type definitions (232 lines)
- `velite.config.ts` - Extended pricing schema with tokenPricing, tiers, perConversationRate
- `package.json` - Added recharts and @radix-ui/react-slider dependencies
- `content/platforms/anthropic-claude.mdx` - pay-per-use with tokenPricing
- `content/platforms/openai-frontier.mdx` - pay-per-use with tokenPricing
- `content/platforms/salesforce-agentforce.mdx` - per-conversation with tiers
- `content/platforms/microsoft-copilot-studio.mdx` - hybrid with both tiers and tokenPricing
- `content/platforms/tray-ai.mdx` - subscription with tiers
- `content/platforms/google-vertex-ai.mdx` - pay-per-use with tokenPricing
- `content/platforms/amazon-bedrock-agents.mdx` - pay-per-use with tokenPricing and infrastructureCosts
- `content/platforms/boomi-agent-studio.mdx` - subscription with tiers
- `content/platforms/servicenow-ai-agents.mdx` - subscription with per-user tiers
- `content/platforms/ibm-watsonx-orchestrate.mdx` - hybrid with tiers and tokenPricing
- `content/platforms/sap-joule.mdx` - subscription with embedded pricing tiers

## Decisions Made

- **Four pricing model taxonomy:** pay-per-use (token-based), subscription (fixed fee), per-conversation (per interaction), hybrid (base + usage). Covers all enterprise AI platform pricing models observed in research.
- **Token pricing structure:** inputPricePerMillion and outputPricePerMillion as base rates, with optional modelVariants array for platforms offering multiple model tiers (e.g., GPT-4o vs GPT-4.5).
- **Subscription tier flexibility:** Generic unitType enum ('conversations' | 'users' | 'tasks' | 'tokens') accommodates different platform metering approaches.
- **PERT for engineering estimates:** Industry-standard formula for realistic effort estimation accounting for uncertainty.
- **Default TCO assumptions:** $800/day engineering rate, 15% infrastructure markup, 20% contingency - conservative estimates that can be customized.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated all 11 platform MDX files instead of just 5**
- **Found during:** Task 3 (Update platform MDX)
- **Issue:** Changing pricing.model from free-form string to enum required ALL platforms to use valid enum values, not just the 5 specified in the plan
- **Fix:** Updated all 11 platforms with valid enum values and structured pricing data where appropriate
- **Files modified:** All 11 content/platforms/*.mdx files
- **Verification:** npm run build succeeds with no velite validation errors
- **Committed in:** 822b252 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Necessary to complete the schema change. Additional platforms got structured pricing data as a bonus, improving data quality across the board.

## Issues Encountered
None - execution proceeded smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cost types ready for calculator implementation in 04-02
- Extended pricing schema provides structured data for token, subscription, and per-conversation calculators
- recharts and slider dependencies ready for TCO visualization UI
- All platforms have structured pricing data that calculators can consume

---
*Phase: 04-cost-analysis*
*Completed: 2026-02-10*
