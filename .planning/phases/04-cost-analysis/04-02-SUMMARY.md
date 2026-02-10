---
phase: 04
plan: 02
subsystem: cost-analysis
tags: [tco, token-pricing, subscription, engineering-estimate, tdd]
dependencies:
  requires: [04-01]
  provides: [cost-calculators, tco-projections]
  affects: [04-03, 04-04]
tech-stack:
  added: []
  patterns: [three-point-estimation, tco-calculation, pricing-model-abstraction]
key-files:
  created:
    - lib/cost/token-calculator.ts
    - lib/cost/subscription-calculator.ts
    - lib/cost/engineering-estimate.ts
    - lib/cost/tco-calculator.ts
    - lib/cost/__tests__/cost.test.ts
  modified:
    - lib/cost/types.ts
decisions:
  - three-point-formula: "PERT (O+4M+P)/6 for engineering estimates"
  - pricing-models: "Unified cost output regardless of input pricing model"
  - hourly-rate-default: "$150/hr default engineer rate, configurable"
  - personnel-spread: "Engineering costs spread over first 3 months in timeline"
metrics:
  duration: "5 min"
  completed: "2026-02-10"
---

# Phase 4 Plan 02: Cost Calculators Summary

TDD implementation of cost calculation business logic - 4 calculator modules with 38 comprehensive tests.

## What Was Built

### Token Calculator (`lib/cost/token-calculator.ts`)
- `calculateTokenCost(pricing, usage)` - Computes costs for separate input/output token pricing
- `conversationsToTokens(count)` - Converts conversation count to estimated token usage
- Handles undefined pricing gracefully (returns 0)

### Subscription Calculator (`lib/cost/subscription-calculator.ts`)
- `selectTier(tiers, usage)` - Selects smallest tier that accommodates usage
- `calculateSubscriptionCost(tier, usage, overageRate?)` - Computes subscription cost with optional overage
- Supports unlimited tiers (no includedUnits)

### Engineering Estimator (`lib/cost/engineering-estimate.ts`)
- `estimateEngineeringDays(tier, complexity)` - Uses PERT three-point formula
- `engineeringDaysToCost(days, rate?, hours?)` - Converts days to dollar cost
- Base estimates by platform tier:
  - enterprise-os: O=15, M=25, P=45 days
  - ipaas-agent: O=5, M=10, P=20 days
  - developer-first: O=10, M=20, P=35 days
  - vertical: O=3, M=7, P=15 days
- Complexity multipliers: +30% no native integration, +25% custom code, +10% per compliance req

### TCO Calculator (`lib/cost/tco-calculator.ts`)
- `calculatePlatformCost(platform, usageParams, engineerRate?)` - Complete cost aggregation
- `generateTCOTimeline(estimate, months?)` - Monthly cumulative costs for charts
- Handles all 4 pricing models: pay-per-use, subscription, per-conversation, hybrid
- Outputs 12/24/36 month TCO projections

### Type Extensions (`lib/cost/types.ts`)
Added missing types needed by calculators:
- `TokenUsage` - Monthly input/output token counts
- `TCODataPoint` - Timeline data point for visualization
- `PlatformTier` - Platform tier enum type

## Test Coverage

38 test cases covering:
- Token calculation with various volumes (5 tests)
- Subscription tier selection and overage (7 tests)
- Engineering three-point estimation (10 tests)
- TCO aggregation and timeline generation (16 tests)

All tests pass in 11ms.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| PERT three-point formula | Industry standard for uncertain estimates, accounts for risk |
| $150/hr default rate | Market rate for senior engineers, user-configurable |
| Engineering in first 3 months | Implementation typically front-loaded |
| Unified output format | Same CostEstimate regardless of pricing model |
| Separate input/output pricing | Output tokens cost 3-5x more, must track separately |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added missing types to types.ts**
- **Found during:** RED phase test setup
- **Issue:** TokenUsage, TCODataPoint, PlatformTier types missing
- **Fix:** Added to types.ts as exports
- **Files modified:** lib/cost/types.ts

## Verification

```bash
npm test -- --run lib/cost/__tests__/cost.test.ts
# 38 tests pass

npm run build
# Compiles successfully
```

## Next Phase Readiness

Ready for Phase 4 Plan 03 (Cost Calculator UI):
- All calculator functions exported and tested
- CostEstimate type provides complete data for display
- TCODataPoint ready for Recharts visualization
- generateTCOTimeline() produces chart-ready data

## Commits

| Hash | Message |
|------|---------|
| 63c921a | test(04-02): add failing tests for cost calculators |
| eaff0cb | feat(04-02): implement cost calculators |
