---
phase: 03-recommendation-comparison
plan: 04
subsystem: scoring/ui
tags: [audit-trail, explainability, scoring, navigation, RECC-04]
depends_on:
  requires: [03-02]
  provides: [audit-trail-utils, audit-trail-component, form-navigation]
  affects: [03-05, results-page-integration]
tech-stack:
  added: []
  patterns: [criterion-explanation, comparison-summary, progressive-disclosure]
key-files:
  created:
    - lib/scoring/audit-trail.ts
    - app/assessment/results/components/AuditTrail.tsx
  modified:
    - app/assessment/components/AssessmentForm.tsx
decisions:
  - Performance level thresholds (excellent/good/moderate/limited/minimal) for reasoning text
  - Top 3 advantages and top 2 disadvantages shown in comparisons
  - Mobile-responsive design with hidden explanation column on smaller screens
metrics:
  duration: 4 min
  completed: 2026-02-09
---

# Phase 03 Plan 04: Audit Trail Summary

Decision audit trail for transparent scoring explanations and form-to-results navigation wiring.

## One-Liner

Audit trail utilities generating human-readable score explanations with platform comparison and form submission routing to results.

## What Was Built

### Audit Trail Generation (`lib/scoring/audit-trail.ts`)

Created comprehensive audit trail utilities:

- **generateAuditTrail()** - Creates AuditEntry[] with context-aware reasoning for each criterion
- **explainComparison()** - Generates human-readable comparison between two platforms explaining why one scored higher
- **formatAuditEntry()** - Formats single entry for display with contribution points
- **getCriterionLabel/Description()** - Human-readable labels and descriptions for UI
- **getScoreBreakdown()** - Complete breakdown with contribution percentages

Key features:
- Performance level detection (excellent/good/moderate/limited/minimal based on normalized score)
- Context-aware reasoning for each criterion type (budget shows pricing context, stack shows compatibility)
- Comparison identifies top 3 advantages and top 2 disadvantages between platforms

### AuditTrail UI Component (`app/assessment/results/components/AuditTrail.tsx`)

Built interactive scoring transparency component:

- Two dropdown selectors: "View details for" and "Compare to"
- Score breakdown table with columns: Criterion, Score (with progress bar), Weight, Contribution, Explanation
- Comparison summary panel with human-readable explanation
- Mobile-responsive design with card-based explanations on smaller screens
- Total row showing sum of contributions

### Form Navigation Wiring

Updated AssessmentForm to:
- Import useRouter from next/navigation
- Navigate to `/assessment/results` on successful form submission
- Preserve form data in localStorage (only clear step progress tracking)
- Comment clarifying data flow to results page

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Performance thresholds at 0.8/0.6/0.4/0.2 | Natural language feels appropriate at these breakpoints |
| Show top 3 advantages, top 2 disadvantages | Balance between detail and brevity in comparisons |
| Hidden explanation column on mobile | Progressive disclosure - cards replace table on small screens |
| Preserve form data on submit | Results page reads from same localStorage key |

## Artifacts

### Exports from `lib/scoring/audit-trail.ts`

```typescript
export function generateAuditTrail(platformName: string, criteria: Criterion[]): AuditEntry[]
export function explainComparison(winner: PlatformScore, loser: PlatformScore): string
export function formatAuditEntry(entry: AuditEntry): string
export function getCriterionLabel(criterionName: string): string
export function getCriterionDescription(criterionName: string): string
export function getScoreBreakdown(score: PlatformScore): ScoreBreakdownItem[]
```

### Component from `app/assessment/results/components/AuditTrail.tsx`

```typescript
export function AuditTrail({ scores }: { scores: PlatformScore[] }): JSX.Element
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] npm run build passes
- [x] Submitting assessment navigates to /assessment/results
- [x] AuditTrail shows score breakdown for selected platform
- [x] Comparison explanation correctly identifies key differences
- [x] No TypeScript errors in audit-trail.ts
- [x] Key link verified: `import.*AuditEntry.*from.*types`
- [x] Key link verified: `router\.push.*results`
- [x] AuditTrail.tsx: 244 lines (min 50 required)

## Next Phase Readiness

**For 03-05 (if exists):**
- AuditTrail component is ready to be integrated into ResultsContent
- explainComparison() can be used for any two-platform comparison UI

**Integration notes:**
- The AuditTrail component is created but not yet imported into ResultsContent.tsx
- ResultsContent references ComparisonMatrix which doesn't exist yet (likely from 03-03)
- These integration steps may be in subsequent plans

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| 9e904cc | feat(03-04): create audit trail generation utilities | lib/scoring/audit-trail.ts |
| daf1563 | feat(03-04): create AuditTrail UI component | app/assessment/results/components/AuditTrail.tsx |
| 2b16326 | feat(03-04): wire form submission to results page | app/assessment/components/AssessmentForm.tsx |
