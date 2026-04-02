# Context And Codebase Review

**Date:** 2026-03-24
**Scope:** Project context files, assessment flow, scoring engine, results UI, cost model, and verification tooling

## Reviewed Sources

- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PORTFOLIO-CONTEXT.md`
- `.planning/REDESIGN-SCORING-RESULTS.md`
- `app/assessment/**`
- `app/assessment/results/**`
- `lib/scoring/**`
- `lib/cost/**`
- `content/platforms/**`
- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`

## Executive Summary

The project is materially farther along than the roadmap suggests: the app builds, tests pass, and the product already includes the assessment flow, results page, cost analysis, and blueprint pages. The main risk is not missing infrastructure. The main risk is recommendation credibility.

The planning docs already identify this correctly. The scoring engine still relies on proxies and weak matching in places where the app now has richer structured data available. That creates a trust problem: the recommendation, comparison matrix, and cost analysis can disagree with each other.

## What Is Working

- Multi-step assessment flow with validation and local persistence
- AI follow-up question generation
- Results page with ranking, matrix, audit trail, and cost analysis
- TCO calculator and engineering estimate logic
- 11 platform profiles with structured pricing and compliance data
- 3 blueprint pages with MDX rendering
- Production build passes
- Test suite passes

## Findings

### 1. Planning state is inconsistent

**Severity:** P3

The project context files do not agree on the current phase.

- `.planning/STATE.md:12` says Phase 5 is 6 of 7 complete and overall progress is 26 of 26 plans complete
- `.planning/ROADMAP.md:145` still shows Phase 5 as 0 of 7 and planned

This makes it unclear whether the correct next step is:

- Phase 5 verification
- scoring/results redesign
- Phase 6 planning

**Impact:** Low direct product risk, but high coordination risk. The docs are no longer a reliable execution guide.

### 2. Budget scoring ignores real pricing data

**Severity:** P1

`lib/scoring/score-platform.ts:279` still derives budget fit from hardcoded tier estimates and string heuristics:

- `enterprise-os -> 50000`
- `ipaas-agent -> 5000`
- `developer-first -> 1000`
- `vertical -> 15000`

This logic does not use:

- platform frontmatter pricing tiers
- token pricing
- per-conversation pricing
- the existing TCO calculator

The app already has richer pricing data and a cost engine, but scoring does not consume them.

**Impact:** Recommendation rankings can contradict the cost calculator and platform pages, which undermines trust in the top-line recommendation.

### 3. Required assessment fields do not influence recommendations

**Severity:** P1

The assessment collects more information than the scoring layer uses.

Collected but not meaningfully used in scoring:

- `teamTechnicalLevel` from `app/assessment/steps/step-04-constraints.tsx:45`
- `organizationSize` from `app/assessment/steps/step-01-basics.tsx:44`
- `timeline` from `app/assessment/steps/step-03-requirements.tsx:97`
- `decisionMakers` from `app/assessment/steps/step-04-constraints.tsx:63`
- `industry` from `app/assessment/steps/step-01-basics.tsx:62`
- AI follow-up answers from `app/assessment/components/AIFollowUp.tsx:97`

`lib/scoring/weights.ts:36` only accepts:

- integrations
- compliance
- budget
- use cases
- stack

**Impact:** The recommendation appears more personalized than it actually is. This is a product credibility issue, not just a minor implementation gap.

### 4. Results filters use a different taxonomy than the assessment

**Severity:** P2

The assessment, scoring, and results filtering are not aligned.

Assessment values:

- annual budget ranges like `under-10k`, `10k-50k`
- cloud stack values like `aws`, `azure`, `gcp`, `hybrid`

Results filter values in `app/assessment/results/components/FilterPanel.tsx:91`:

- monthly budget buckets like `under-1000`, `1000-5000`, `enterprise`
- language/runtime stack values like `python`, `typescript`, `nodejs`

Filtering logic in `app/assessment/results/components/ComparisonMatrix.tsx:264` then maps those filter values using tier heuristics and capability text matching.

**Impact:** Users can filter with criteria that do not match either their assessment answers or the scoring model. This weakens explainability and makes the matrix feel disconnected from the recommendation.

### 5. Linting and standalone typecheck are weaker than they appear

**Severity:** P2

Tooling coverage is incomplete.

- `package.json:9` only lints `.js`, `.mjs`, and `.cjs`
- `eslint.config.mjs` only defines JavaScript handling
- the build warns that the Next.js ESLint plugin is not configured
- `tsconfig.json:35` includes `.next/types/**/*.ts`, which caused `npx tsc --noEmit` to fail until generated files existed

**Impact:** Critical application code in TS/TSX can accumulate issues without being caught by the normal lint command. Local type-checking is also brittle outside the build path.

## Supporting Observations

### Scoring redesign docs match the actual problem

The most useful planning document right now is `.planning/REDESIGN-SCORING-RESULTS.md`.

Its diagnosis matches the implementation:

- clustered scores
- neutral/noisy criteria
- tier-based budget proxies
- abstract percentages with weak explanatory value
- mismatch between scoring and cost analysis

This is consistent with the code in `lib/scoring/score-platform.ts` and the current results UI.

### Portfolio context is directionally correct

`.planning/PORTFOLIO-CONTEXT.md` correctly identifies the biggest portfolio risks:

- scoring feels random
- developer-first platform coverage is missing
- AI follow-ups do not affect outcomes
- no README / deployment / portfolio packaging yet

That document is a better guide for prioritization than the roadmap at this point.

### Cost model is better than the scorer, but still incomplete

The cost calculator is more concrete than the recommendation engine, but it still uses simplifying assumptions.

Examples:

- `lib/cost/tco-calculator.ts:61` assumes `1` user for `unitType: users`
- `app/assessment/results/components/CostCalculator.tsx:66` hardcodes simplified complexity inputs
- `content/platforms/sap-joule.mdx:21` exposes a `$0` standard tier that still depends on external SAP Cloud subscription cost

This is less urgent than the scoring issue, but it should be cleaned up once pricing and assessment inputs are unified.

## Verification Run

Commands executed during review:

- `npm test -- --run`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Results:

- `npm test -- --run`: passed, 72/72 tests
- `npm run lint`: passed, but only lints JavaScript config files
- `npx tsc --noEmit`: failed before generated `.next/types` files were present
- `npm run build`: passed

## Recommended Next Steps

### Priority 1: Fix recommendation credibility

Do this before export/sharing work.

1. Replace budget proxies in scoring with real pricing inputs from the cost model
2. Use `teamTechnicalLevel` in recommendation logic
3. Add usage-volume input to the assessment so scoring and cost analysis use the same baseline
4. Build explicit mappings for:
   - `currentStack -> platform attributes`
   - `primaryUseCases -> platform attributes or blueprint applicability`
5. Move the results page toward concrete match reporting, not just normalized percentages

### Priority 2: Unify the data model across the product

1. Align assessment enums, scorer inputs, and results filters
2. Decide which inputs are first-class recommendation drivers
3. Either use AI follow-up answers in scoring or demote/remove them from the product story

### Priority 3: Clean up execution hygiene

1. Reconcile `.planning/STATE.md` and `.planning/ROADMAP.md`
2. Add real TS/TSX lint coverage and Next ESLint integration
3. Make standalone type-check reliable without depending on stale `.next/types`

### Priority 4: Improve portfolio completeness

1. Add 2-3 developer-first platforms
2. Add README and screenshots
3. Deploy a live demo
4. Then consider export/sharing as the next feature milestone

## Suggested Execution Order

If work starts immediately, the best sequence is:

1. Scoring and results redesign
2. Assessment input expansion and data-model unification
3. Tooling hygiene and planning-doc cleanup
4. Developer-first platform coverage
5. README and deployment
6. Export/sharing

## Bottom Line

This is already a real product-shaped codebase, not a prototype. The blocker is not lack of features. The blocker is that the recommendation layer has not caught up with the quality of the surrounding product.

The highest-leverage move is to make the recommendation engine concrete, internally consistent, and obviously tied to the user’s answers.
