# Phase 3: Recommendation & Comparison - Research

**Researched:** 2026-02-08
**Domain:** Multi-Criteria Decision Analysis (MCDA) & Recommendation Systems
**Confidence:** MEDIUM

## Summary

Phase 3 implements a weighted scoring and recommendation engine that takes user questionnaire responses and outputs ranked platform recommendations with transparent reasoning. The core challenge is implementing explainable multi-criteria decision analysis (MCDA) in a way that's transparent, auditable, and bias-free.

The standard approach for this domain is Simple Additive Weighting (SAW) - a straightforward MCDA method that multiplies criterion values by their weights and sums the scores. More complex methods like TOPSIS (distance from ideal solution) or AHP (pairwise comparisons) add complexity without meaningful benefits for a 5-platform comparison system. The key technical challenges are: (1) proper normalization to avoid scale bias, (2) weight calibration to avoid overemphasis of single criteria, and (3) explainability through audit trails showing why each platform scored as it did.

For UI implementation, TanStack Table provides the standard headless table solution with built-in filtering, sorting, and TypeScript support. No specialized MCDA libraries exist in the JavaScript ecosystem - scoring logic should be implemented directly with careful attention to normalization edge cases (zero division, empty ranges, missing data).

**Primary recommendation:** Implement Simple Additive Weighting (SAW) with min-max normalization, use TanStack Table for comparison matrix, and generate audit trails by capturing each scoring step (criterion → normalized value → weighted score → contribution to total).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Table | v8+ | Table state management, filtering, sorting | Industry standard headless table library, 40k+ GitHub stars, full TypeScript support, framework-agnostic core |
| Zod | 3.24+ | Runtime scoring rule validation | Already in stack from Phase 2, ensures scoring rules are type-safe |
| React Hook Form | 7.71+ | Filter form state | Already in stack from Phase 2, consistent form handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | SAW scoring should be implemented directly (see Don't Hand-Roll section) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | AG Grid Community | AG Grid provides built-in UI but adds 500kb+ bundle size and opinionated styling. TanStack Table is headless (full UI control) with minimal footprint |
| TanStack Table | Material React Table | Couples table logic to Material UI design system. TanStack Table works with any UI framework (Tailwind in this project) |
| Custom scoring | MCDA library | No mature JavaScript MCDA libraries exist. Academic implementations (TOPSIS, AHP) add complexity without benefit for 5-platform comparison |

**Installation:**
```bash
# TanStack Table already included via @tanstack/react-table
npm install @tanstack/react-table
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── assessment/
│   └── results/                    # New results page
│       ├── page.tsx                # Results layout with scoring + comparison
│       └── components/
│           ├── PlatformScores.tsx  # Scored recommendations list
│           ├── ComparisonMatrix.tsx # Side-by-side table with TanStack
│           ├── FilterPanel.tsx      # Budget/compliance/stack filters
│           └── AuditTrail.tsx      # Explainability component
lib/
├── scoring/                        # New scoring module
│   ├── types.ts                    # Score, Criterion, WeightedScore types
│   ├── normalize.ts                # Min-max normalization utilities
│   ├── weights.ts                  # Criterion weight configuration
│   ├── score-platform.ts           # SAW implementation
│   └── audit-trail.ts              # Generate decision reasoning
content/
└── platforms/*.mdx                 # Extend frontmatter with scoring attributes
```

### Pattern 1: Simple Additive Weighting (SAW)
**What:** Multiply each criterion value by its weight, then sum all weighted scores to get final platform score (0-100 scale).

**When to use:** When you have independent criteria with known weights and need transparent, explainable scoring.

**Example:**
```typescript
// Source: Verified from multiple MCDA research papers
// https://www.researchgate.net/publication/324076628

interface Criterion {
  name: string;
  weight: number;        // Must sum to 1.0 across all criteria
  value: number;         // Raw value (may need normalization)
  normalizedValue: number; // 0-1 scale after min-max normalization
}

interface PlatformScore {
  platformId: string;
  totalScore: number;    // 0-100 scale
  criteriaScores: Criterion[];
  auditTrail: AuditEntry[];
}

function calculateSAW(
  criteria: Criterion[]
): number {
  // SAW formula: Score = Σ(weight_i × normalized_value_i)
  const weightedSum = criteria.reduce(
    (sum, criterion) => sum + (criterion.weight * criterion.normalizedValue),
    0
  );

  // Convert to 0-100 scale
  return weightedSum * 100;
}
```

### Pattern 2: Min-Max Normalization
**What:** Transform values to 0-1 scale using formula: `(value - min) / (max - min)`

**When to use:** Before scoring, to ensure criteria on different scales (e.g., price $0-$10k vs features 0-5) don't bias results.

**Example:**
```typescript
// Source: Google ML Course - Numerical Data Normalization
// https://developers.google.com/machine-learning/crash-course/numerical-data/normalization

function normalizeMinMax(
  value: number,
  min: number,
  max: number,
  higherIsBetter: boolean = true
): number {
  // Handle edge case: empty range
  if (max === min) return 0.5; // Neutral score when no variation

  const normalized = (value - min) / (max - min);

  // Invert for "lower is better" criteria (e.g., price)
  return higherIsBetter ? normalized : (1 - normalized);
}

function normalizeCriteria(
  platforms: Platform[],
  criterionExtractor: (p: Platform) => number,
  higherIsBetter: boolean
): Map<string, number> {
  const values = platforms.map(criterionExtractor);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return new Map(
    platforms.map((platform, i) => [
      platform.id,
      normalizeMinMax(values[i], min, max, higherIsBetter)
    ])
  );
}
```

### Pattern 3: Audit Trail Generation
**What:** Capture each step of scoring process to enable "why did X score higher than Y?" explanations.

**When to use:** Required for transparent, explainable recommendations per RECC-04.

**Example:**
```typescript
// Source: AI Audit Trail best practices
// https://law.co/blog/legal-ai-audit-trails-designing-for-traceability

interface AuditEntry {
  criterionName: string;
  rawValue: number | string;
  normalizedValue: number;
  weight: number;
  weightedScore: number;
  reasoning: string;
}

function generateAuditTrail(
  platform: Platform,
  criteria: Criterion[]
): AuditEntry[] {
  return criteria.map(criterion => ({
    criterionName: criterion.name,
    rawValue: criterion.value,
    normalizedValue: criterion.normalizedValue,
    weight: criterion.weight,
    weightedScore: criterion.weight * criterion.normalizedValue,
    reasoning: `${criterion.name}: ${criterion.value} → normalized to ${
      criterion.normalizedValue.toFixed(2)
    } → weighted score ${(criterion.weight * criterion.normalizedValue * 100).toFixed(1)}/100`
  }));
}

function compareAuditTrails(
  platformA: PlatformScore,
  platformB: PlatformScore
): string {
  const diff = platformA.totalScore - platformB.totalScore;
  const mainDifferences = platformA.criteriaScores
    .map((criterionA, i) => {
      const criterionB = platformB.criteriaScores[i];
      const scoreDiff = criterionA.weightedScore - criterionB.weightedScore;
      return { criterion: criterionA.name, diff: scoreDiff };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3); // Top 3 contributing factors

  return `${platformA.platformId} scores ${diff.toFixed(1)} points higher than ${
    platformB.platformId
  } primarily due to: ${mainDifferences.map(d =>
    `${d.criterion} (+${d.diff.toFixed(1)} pts)`
  ).join(', ')}`;
}
```

### Pattern 4: TanStack Table with Filtering
**What:** Headless table state management that handles filtering, sorting, and column visibility without dictating UI.

**When to use:** For the comparison matrix (RECC-02) and filter panel (RECC-03).

**Example:**
```typescript
// Source: TanStack Table v8 documentation
// https://tanstack.com/table/v8

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  FilterFn
} from '@tanstack/react-table';

interface PlatformComparison {
  name: string;
  score: number;
  pricing: string;
  compliance: string[];
  stackFit: string[];
}

const columns: ColumnDef<PlatformComparison>[] = [
  { accessorKey: 'name', header: 'Platform' },
  { accessorKey: 'score', header: 'Score', sortDescFirst: true },
  { accessorKey: 'pricing', header: 'Pricing' },
  { accessorKey: 'compliance', header: 'Compliance', enableSorting: false },
  { accessorKey: 'stackFit', header: 'Stack Fit', enableSorting: false },
];

// Custom filter for array-based criteria (compliance, stack)
const arrayIncludesFilter: FilterFn<PlatformComparison> = (
  row,
  columnId,
  filterValue: string[]
) => {
  const rowValue = row.getValue(columnId) as string[];
  return filterValue.some(filter => rowValue.includes(filter));
};

function ComparisonMatrix({ platforms, filters }: Props) {
  const table = useReactTable({
    data: platforms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters: [
        { id: 'compliance', value: filters.complianceRequirements },
        { id: 'stackFit', value: filters.existingStack },
      ],
    },
    filterFns: {
      arrayIncludes: arrayIncludesFilter,
    },
  });

  // Render table using your UI components (Tailwind, etc.)
  // TanStack Table provides state, you provide markup
}
```

### Anti-Patterns to Avoid

- **Premature TOPSIS/AHP adoption:** These methods require distance calculations (TOPSIS) or pairwise comparisons (AHP) that add complexity without improving transparency. SAW is proven sufficient for small option sets (5 platforms).

- **Scale-unaware scoring:** Directly summing criteria on different scales (e.g., price $0-$10k + features 1-5) causes large-scale criteria to dominate. Always normalize first.

- **Opaque weight selection:** Hardcoding weights without justification makes system non-transparent. Document why each criterion has its weight (e.g., "integration needs = 0.25 because users cited it as top priority in questionnaire").

- **Missing edge case handling:** Normalization fails when max = min (no variation). Must handle with neutral score (0.5) or skip criterion.

- **Offline-only validation:** Scoring formulas that work on paper can produce unexpected results with real data. Test with actual platform data before deploying.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table filtering, sorting, pagination | Custom table state management | TanStack Table | Handles edge cases like nested sorting, custom filters, column visibility, virtualization for large datasets. 40k+ stars, battle-tested. |
| Form-based filters with persistence | Custom filter state | React Hook Form | Already in stack, provides validation, persistence, and controlled state. Don't duplicate state management. |
| Type-safe scoring rules | Runtime checks with if/else | Zod schemas | Already in stack. Define scoring rules as schemas, get validation + TypeScript types automatically. |

**Key insight:** MCDA scoring logic (SAW) should be implemented directly because (1) no mature JavaScript libraries exist, (2) SAW is simple enough (sum of products), and (3) custom implementation enables transparent audit trails. However, table state and form state should use existing libraries due to their complexity and edge cases.

## Common Pitfalls

### Pitfall 1: Weight Overemphasis
**What goes wrong:** Assigning too much weight to one criterion (e.g., 0.6 to pricing) makes other criteria nearly irrelevant, reducing system to single-factor decision.

**Why it happens:** Teams either (a) haven't calibrated weights based on user priorities, or (b) one stakeholder dominates weight selection.

**How to avoid:**
- Weights should sum to 1.0
- No single weight > 0.35 (ensures multiple criteria influence result)
- Derive weights from questionnaire responses (e.g., if user rates "integration needs" as 5/5 and "budget" as 3/5, weight integration higher)
- Test with edge cases: what if all criteria equal except one?

**Warning signs:**
- Final scores are nearly proportional to one criterion
- Changing a low-weight criterion doesn't affect rankings

### Pitfall 2: Normalization Edge Cases
**What goes wrong:** Division by zero when all platforms have same value for a criterion (max = min), or incorrect inversion for "lower is better" criteria.

**Why it happens:** Normalization formula `(value - min) / (max - min)` assumes variation exists. Also, developers forget that price should be inverted (lower = higher score).

**How to avoid:**
```typescript
// Always check for empty range
if (max === min) {
  return 0.5; // Neutral score - all platforms equal on this criterion
}

// Always specify direction
interface CriterionConfig {
  name: string;
  weight: number;
  higherIsBetter: boolean; // false for price, timeline
}
```

**Warning signs:**
- `NaN` or `Infinity` in scores
- Price showing higher scores for more expensive platforms
- Console errors during scoring

### Pitfall 3: Missing Audit Trail Context
**What goes wrong:** Audit trail shows numbers (0.75 → 0.25 → 18.75 pts) but doesn't explain what they mean in business terms.

**Why it happens:** Developers focus on calculation accuracy, not user comprehension.

**How to avoid:**
- Include human-readable reasoning: "Anthropic Claude supports 3 of your 4 required integrations (Slack, GitHub, Jira), scoring 0.75/1.0 on integration fit"
- Show comparison context: "This is 0.25 points higher than OpenAI because OpenAI lacks native Jira integration"
- Link to source data: "Based on your questionnaire response: 'We need Slack, GitHub, Jira, and Salesforce integrations'"

**Warning signs:**
- User asks "why did this score higher?" and team can't answer from UI alone
- Audit trail looks like a spreadsheet rather than an explanation

### Pitfall 4: Static Weight Configuration
**What goes wrong:** Weights hardcoded in config file, don't adapt to user's questionnaire responses.

**Why it happens:** Easier to implement fixed weights than dynamic weighting based on user priorities.

**How to avoid:**
- Map questionnaire responses to weights:
```typescript
function deriveWeights(assessment: Assessment): WeightConfig {
  const priorities = {
    integration: assessment.integrationNeeds.length > 3 ? 0.30 : 0.15,
    compliance: assessment.complianceRequirements.length > 0 ? 0.25 : 0.10,
    budget: assessment.budgetRange === 'tight' ? 0.30 : 0.20,
    features: 1.0 - (integration + compliance + budget), // Remainder
  };

  // Ensure sums to 1.0
  const total = Object.values(priorities).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(priorities).map(([k, v]) => [k, v / total])
  );
}
```

**Warning signs:**
- All users get same recommendations regardless of questionnaire answers
- Weights don't reflect business logic ("Why is budget only 10% when users say it's critical?")

### Pitfall 5: Filter Implementation Without TanStack Table State
**What goes wrong:** Developers manually filter arrays in React state, duplicating logic that TanStack Table already handles (nested filters, sort + filter interaction, filter state persistence).

**Why it happens:** Unfamiliarity with TanStack Table's filtering APIs leads to "I'll just filter the array myself" approach.

**How to avoid:**
- Use TanStack Table's `columnFilters` state:
```typescript
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

const table = useReactTable({
  data: platforms,
  columns,
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
});

// Filters apply automatically, no manual array.filter needed
```

**Warning signs:**
- `useState` for filter values separate from table state
- Manual `platforms.filter(...)` calls in render
- Filters don't work well with sorting

## Code Examples

Verified patterns from official sources:

### Scoring a Single Platform
```typescript
// Source: SAW methodology from MCDA research
// https://www.6sigma.us/six-sigma-in-focus/weighted-scoring-prioritization/

interface ScoringContext {
  allPlatforms: Platform[];
  userAssessment: Assessment;
  weightConfig: WeightConfig;
}

function scorePlatform(
  platform: Platform,
  context: ScoringContext
): PlatformScore {
  const criteria: Criterion[] = [
    {
      name: 'Integration Fit',
      weight: context.weightConfig.integration,
      value: calculateIntegrationFit(platform, context.userAssessment),
      normalizedValue: 0, // Set below
    },
    {
      name: 'Compliance Match',
      weight: context.weightConfig.compliance,
      value: calculateComplianceMatch(platform, context.userAssessment),
      normalizedValue: 0,
    },
    {
      name: 'Budget Fit',
      weight: context.weightConfig.budget,
      value: calculateBudgetScore(platform, context.userAssessment),
      normalizedValue: 0,
    },
    // ... more criteria
  ];

  // Normalize each criterion across all platforms
  criteria.forEach(criterion => {
    const allValues = context.allPlatforms.map(p =>
      extractCriterionValue(p, criterion.name, context)
    );
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const higherIsBetter = criterion.name !== 'Budget Fit'; // Price inverted

    criterion.normalizedValue = normalizeMinMax(
      criterion.value,
      min,
      max,
      higherIsBetter
    );
  });

  // Calculate SAW score
  const totalScore = calculateSAW(criteria);

  // Generate audit trail
  const auditTrail = generateAuditTrail(platform, criteria);

  return {
    platformId: platform.slug,
    totalScore,
    criteriaScores: criteria,
    auditTrail,
  };
}
```

### Budget Range Filtering
```typescript
// Source: TanStack Table filtering patterns
// https://tanstack.com/table/v8/docs/guide/filters

function budgetInRange(
  platformPricing: string, // e.g., "$500-2000/month"
  userBudget: { min: number; max: number }
): boolean {
  // Parse platform pricing (simplified - real version needs robust parsing)
  const match = platformPricing.match(/\$(\d+)-(\d+)/);
  if (!match) return true; // "Contact for pricing" = assume in range

  const [_, platformMin, platformMax] = match.map(Number);

  // Platform is in range if there's any overlap
  return !(platformMin > userBudget.max || platformMax < userBudget.min);
}

const budgetFilter: FilterFn<PlatformComparison> = (row, columnId, filterValue) => {
  const pricing = row.getValue(columnId) as string;
  return budgetInRange(pricing, filterValue);
};

// Use in table config
const table = useReactTable({
  // ...
  filterFns: {
    budgetRange: budgetFilter,
  },
});
```

### Comparison Explanation Generator
```typescript
// Source: AI Audit Trail for explainability
// https://www.aptusdatalabs.com/thought-leadership/the-rise-of-ai-audit-trails-ensuring-traceability-in-decision-making

function explainComparison(
  winnerScore: PlatformScore,
  loserScore: PlatformScore
): string {
  const scoreDiff = winnerScore.totalScore - loserScore.totalScore;

  // Find criteria where winner outperformed
  const advantages = winnerScore.criteriaScores
    .map((criterion, i) => ({
      name: criterion.name,
      winnerScore: criterion.weightedScore,
      loserScore: loserScore.criteriaScores[i].weightedScore,
      diff: criterion.weightedScore - loserScore.criteriaScores[i].weightedScore,
      weight: criterion.weight,
    }))
    .filter(c => c.diff > 0.01) // Meaningful difference
    .sort((a, b) => b.diff - a.diff);

  const topAdvantage = advantages[0];

  return `
    ${winnerScore.platformId} scores ${scoreDiff.toFixed(1)} points higher than ${loserScore.platformId}.

    Key advantage: ${topAdvantage.name}
    - ${winnerScore.platformId}: ${(topAdvantage.winnerScore * 100).toFixed(1)}/100
    - ${loserScore.platformId}: ${(topAdvantage.loserScore * 100).toFixed(1)}/100
    - Difference: +${(topAdvantage.diff * 100).toFixed(1)} points

    This criterion carries ${(topAdvantage.weight * 100).toFixed(0)}% weight in your scoring,
    based on your questionnaire responses.

    Other advantages: ${advantages.slice(1, 3).map(a => a.name).join(', ')}
  `.trim();
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Black-box ML recommendation models | Transparent rule-based scoring (SAW) | 2024-2025 | Regulatory pressure (EU AI Act, GDPR) requires explainability. SAW provides audit trail that ML cannot. |
| Complex MCDA (AHP, TOPSIS) | Simple Additive Weighting (SAW) | Ongoing | Research shows SAW performs as well as complex methods for small option sets (<10) while being more transparent. |
| Static weight configuration | User-adaptive weights | 2025-2026 | Modern systems derive weights from user input rather than one-size-fits-all scoring. |
| Server-side scoring | Client-side scoring | 2024+ | Static site generation + client-side scoring enables fast, privacy-preserving recommendations without server costs. |

**Deprecated/outdated:**
- **Collaborative filtering for product recommendation:** Requires large user base and item catalog. Not applicable to 5-platform comparison where all platforms are already known.
- **Neural network recommenders:** Cannot provide transparent audit trails. Regulatory compliance requires explainable decisions.
- **AHP (Analytic Hierarchy Process):** Requires n² pairwise comparisons (25 comparisons for 5 platforms). Too complex for user-facing system, offers no accuracy benefit over SAW for small option sets.

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal weight calibration methodology**
   - What we know: Weights should be derived from user questionnaire responses, sum to 1.0, and no single weight > 0.35
   - What's unclear: Exact formula for mapping questionnaire answers (e.g., "integration is important" rated 4/5) to weight values (e.g., 0.25)
   - Recommendation: Start with heuristic mapping (high priority = 0.30, medium = 0.20, low = 0.10), normalize to sum to 1.0, then validate with user testing. Track if recommended platforms match user expectations.

2. **Handling missing platform data**
   - What we know: Some platforms may lack data for certain criteria (e.g., "pricing not publicly disclosed")
   - What's unclear: Should missing data be treated as (a) neutral score (0.5), (b) worst case (0.0), or (c) exclude criterion from that platform's score?
   - Recommendation: Use neutral score (0.5) by default, but flag in audit trail: "Pricing unknown, assumed mid-range for scoring purposes." Re-normalize weights across remaining criteria if criterion truly doesn't apply.

3. **Multi-stakeholder weighting**
   - What we know: Some organizations have multiple decision makers with different priorities (technical lead values integrations, CFO values budget)
   - What's unclear: How to aggregate multiple stakeholders' priorities into single weight config
   - Recommendation: Phase 3 uses single-user weights (from questionnaire). If multi-stakeholder needed in future, implement weighted average of stakeholder weights or show multiple scoring perspectives side-by-side.

4. **Real-time platform data updates**
   - What we know: Platform capabilities and pricing change over time (lastVerified field in MDX)
   - What's unclear: How to surface "this data may be outdated" warnings without breaking user trust
   - Recommendation: Show lastVerified date prominently in comparison matrix. If > 90 days old, display warning badge. Consider automated checks against platform APIs (future enhancement).

## Sources

### Primary (HIGH confidence)
- TanStack Table v8 Documentation - https://tanstack.com/table/v8 (confirmed filtering, sorting, TypeScript support)
- Google ML Course: Normalization - https://developers.google.com/machine-learning/crash-course/numerical-data/normalization (verified min-max formula)

### Secondary (MEDIUM confidence)
- [Multi-Criteria Decision Analysis Overview](https://www.6sigma.us/six-sigma-in-focus/multi-criteria-decision-analysis-mcda/) - MCDA methodology introduction
- [Weighted Scoring Model Guide](https://productschool.com/blog/product-fundamentals/weighted-scoring-model) - SAW implementation patterns and common mistakes
- [Selection of Normalization Technique for MCDA](https://www.researchgate.net/publication/324076628_Selection_of_Normalization_Technique_for_Weighted_Average_Multi-criteria_Decision_Making) - Normalization methods comparison
- [Legal AI Audit Trails](https://law.co/blog/legal-ai-audit-trails-designing-for-traceability) - Audit trail best practices for explainability
- [The Rise of AI Audit Trails](https://www.aptusdatalabs.com/thought-leadership/the-rise-of-ai-audit-trails-ensuring-traceability-in-decision-making) - Traceability in decision-making systems
- [Designing UIs for Recommender Systems](https://medium.com/the-graph/designing-uis-for-recommender-systems-f7ffa2ca234f) - UI patterns for recommendation systems
- [10 Best Data Table Libraries for React (2026)](https://reactscript.com/best-data-table/) - TanStack Table positioning as standard
- [TOPSIS Method Wikipedia](https://en.wikipedia.org/wiki/TOPSIS) - Alternative MCDA method (not recommended)

### Tertiary (LOW confidence - flagged for validation)
- [Ten Mistakes to Avoid When Creating a Recommendation System](https://medium.com/@FunCorp/ten-mistakes-to-avoid-when-creating-a-recommendation-system-8268ed60aeba) - General recommendation system pitfalls
- [Comparison of AHP-SAW, AHP-WP, AHP-TOPSIS](https://www.mecs-press.org/ijmecs/ijmecs-v15-n1/v15n1-3.html) - Academic comparison showing SAW has 88% accuracy (but sample size unclear)
- npm search results for "weighted scoring" and "decision matrix" - No mature libraries found, confirming need for custom implementation

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - TanStack Table verified via official docs, but no specialized MCDA libraries exist (custom implementation needed)
- Architecture: MEDIUM - SAW methodology well-documented in research, but exact implementation details (weight mapping, edge cases) require validation with real data
- Pitfalls: MEDIUM - Common mistakes documented across multiple sources, but some are domain-specific (product management) rather than MCDA-specific

**Research date:** 2026-02-08
**Valid until:** 2026-03-10 (30 days - stable domain, TanStack Table v8 mature)

**Notes:**
- JavaScript MCDA ecosystem is immature - no libraries comparable to Python's scikit-criteria or R's MCDA package
- This is appropriate: SAW is simple enough to implement directly, and custom implementation enables transparent audit trails
- TanStack Table is the clear standard (40k+ stars, framework-agnostic, TypeScript-first) - no alternatives needed
- Focus on explainability over algorithmic complexity: SAW + audit trails > TOPSIS/AHP + black box
