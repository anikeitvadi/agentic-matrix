---
phase: 03-recommendation-comparison
plan: 02
subsystem: scoring-engine
tags: [saw, weights, tdd, scoring, normalization]
dependency-graph:
  requires:
    - 03-01 (scoring types and normalization)
  provides:
    - SAW scoring formula implementation
    - Weight derivation from user assessment
    - Criterion calculation helpers
    - Audit trail for scoring transparency
  affects:
    - 03-03 (recommendation display will use PlatformScore[])
    - 03-04 (comparison view will use criteriaScores)
tech-stack:
  added:
    - vitest (^4.0.18)
    - @testing-library/react (^16.3.2)
    - @vitejs/plugin-react (^5.1.3)
    - jsdom (^28.0.0)
  patterns:
    - TDD (RED-GREEN cycle)
    - SAW multi-criteria decision making
key-files:
  created:
    - lib/scoring/weights.ts
    - lib/scoring/score-platform.ts
    - lib/scoring/__tests__/scoring.test.ts
    - vitest.config.mjs
  modified:
    - package.json (added test script)
decisions:
  - id: vitest-for-testing
    choice: Vitest over Jest
    rationale: Faster execution, ESM native, integrates with Vite ecosystem
  - id: tdd-approach
    choice: TDD RED-GREEN cycle for scoring engine
    rationale: Scoring is critical business logic - tests ensure correctness before building UI
  - id: max-weight-cap
    choice: 0.35 maximum for any single weight
    rationale: Ensures multiple criteria influence results, no single criterion can dominate
metrics:
  duration: 4 min
  completed: 2026-02-09
---

# Phase 03 Plan 02: SAW Scoring Engine Summary

SAW scoring engine with TDD: weight derivation from user assessment, weighted sum calculation, and audit trail for transparency.

## What Was Built

### 1. Weight Derivation (`lib/scoring/weights.ts`)

**DEFAULT_WEIGHTS:** Equal 0.20 distribution across 5 criteria (integrationFit, complianceMatch, budgetFit, featureMatch, stackCompatibility).

**deriveWeights():** Adapts weights based on user assessment:
- More integrations needed → higher integrationFit weight
- Compliance requirements → higher complianceMatch weight
- Tight budget range → higher budgetFit weight
- Multiple use cases → higher featureMatch weight
- Tech stack specified → higher stackCompatibility weight

**Constraints enforced:**
- No single weight exceeds 0.35 (MAX_WEIGHT cap)
- All weights always sum to exactly 1.0 (normalization)

### 2. SAW Scoring (`lib/scoring/score-platform.ts`)

**calculateSAW():** Core SAW formula implementation
```
Score = sum(weight_i * normalizedValue_i) * 100
```

**scorePlatform():** Full platform scoring with:
- Raw criterion value calculation from platform data
- Min-max normalization across all platforms
- Criteria breakdown with individual scores
- Complete audit trail generation

**scoreAllPlatforms():** Scores all platforms and sorts by totalScore descending.

### 3. Criterion Calculation Helpers

| Helper | Logic |
|--------|-------|
| `calculateIntegrationFit` | Matches platform capabilities to user's integrationNeeds |
| `calculateComplianceMatch` | Tier-based score + compliance capabilities (soc2, hipaa, etc.) |
| `calculateBudgetFit` | Estimated annual cost from tier and pricing model (inverted) |
| `calculateFeatureMatch` | Capability count + use case matching |
| `calculateStackCompatibility` | Tier score + SDK/API/webhook indicators |

### 4. Audit Trail Generation

Every PlatformScore includes an auditTrail array with:
- criterionName: Which criterion
- rawValue: Original calculation value
- normalizedValue: 0-1 scaled value
- weight: Applied weight
- weightedScore: Contribution to total score
- reasoning: Human-readable explanation

Example reasoning: "Zapier supports 2 of your needed integrations (75% normalized, contributes 15.0 points)"

### 5. Test Infrastructure

Installed vitest with configuration for:
- Node environment for unit tests
- Path aliases matching Next.js (@, .velite)
- Globals for describe/it/expect

**22 tests covering:**
- DEFAULT_WEIGHTS validation
- deriveWeights behavior for all assessment fields
- MAX_WEIGHT cap enforcement
- Weight sum normalization
- calculateSAW formula correctness
- scorePlatform output structure
- scoreAllPlatforms sorting
- Audit trail field validation
- Criterion calculation behavior

## TDD Cycle

**RED Phase (Task 1):**
- Created comprehensive test file with 16 initial tests
- All tests failed (modules don't exist)
- Commit: `0432bc1`

**GREEN Phase (Task 2):**
- Implemented weights.ts and score-platform.ts
- All 16 tests pass
- Commit: `771cf97`

**REFACTOR Phase (Task 3):**
- Added 6 more tests for audit trail and criterion calculations
- All 22 tests pass
- Commit: `158a95d`

## Verification Results

| Check | Result |
|-------|--------|
| All tests pass | 22/22 passing |
| TypeScript compiles | No errors |
| Weights sum to 1.0 | Verified by test |
| No weight > 0.35 | Verified by test |
| Scores 0-100 range | Verified by formula |

## Key Code Patterns

**Weight normalization:**
```typescript
function normalizeWeights(weights: WeightConfig): WeightConfig {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / sum])
  ) as WeightConfig
}
```

**SAW calculation:**
```typescript
export function calculateSAW(criteria: SAWInput[]): number {
  const weightedSum = criteria.reduce((sum, c) =>
    sum + c.weight * c.normalizedValue, 0)
  return Math.round(weightedSum * 100)
}
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test infrastructure not present**
- **Found during:** Task 1 (RED phase)
- **Issue:** No test framework installed, no test script in package.json
- **Fix:** Installed vitest + testing libraries, created vitest.config.mjs, added test script
- **Files:** package.json, vitest.config.mjs
- **Commit:** 0432bc1

## Files Delivered

| File | Lines | Purpose |
|------|-------|---------|
| lib/scoring/weights.ts | 130 | Weight derivation from assessment |
| lib/scoring/score-platform.ts | 395 | SAW scoring implementation |
| lib/scoring/__tests__/scoring.test.ts | 390 | Unit tests for scoring engine |
| vitest.config.mjs | 17 | Test framework configuration |

## Next Phase Readiness

**Ready for 03-03 (Recommendation Display):**
- `scoreAllPlatforms()` returns sorted `PlatformScore[]`
- Each score includes totalScore, criteriaScores, auditTrail
- Import: `import { scoreAllPlatforms } from '@/lib/scoring/score-platform'`

**Ready for 03-04 (Comparison View):**
- `criteriaScores` array has all 5 criteria with normalized values
- Can be used for side-by-side bar chart comparison
- `auditTrail` provides reasoning for each criterion

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 0432bc1 | test | Add failing tests for SAW scoring engine (RED) |
| 771cf97 | feat | Implement SAW scoring engine (GREEN) |
| 158a95d | feat | Add criterion calculation helpers and audit trail |
