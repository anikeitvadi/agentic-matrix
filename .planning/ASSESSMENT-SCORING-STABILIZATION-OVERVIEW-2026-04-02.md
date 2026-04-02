# Assessment + Scoring Stabilization Overview

Date: 2026-04-02

## Why This Keeps Happening

The review findings have kept changing because the codebase is moving in several layers at once:

1. The assessment UI, schema, and scoring engine are not using one shared contract.
2. Some fixes have landed in one layer but not the adjacent layer.
3. Reviews were sometimes describing code that changed again before the next pass.
4. The project now has richer scoring features (`gates`, `evidence`, `confidence`, `implementationRisk`), but the tests and assessment contract still largely reflect the older SAW-only model.

This is not one bug. It is a coordination problem between:

- assessment question rendering
- assessment validation/schema
- assessment storage shape
- scoring inputs
- results rendering
- regression coverage

Until those are aligned, we will keep fixing symptoms and then finding drift somewhere else.

## Current Architecture Map

### Assessment contract

- Canonical schema: [app/assessment/schemas/assessment-schema.ts](/Users/anikeit/agentic-decisions/app/assessment/schemas/assessment-schema.ts)
- Step schemas: [app/assessment/schemas/step-schemas.ts](/Users/anikeit/agentic-decisions/app/assessment/schemas/step-schemas.ts)
- Step registry and validation: [app/assessment/steps/index.ts](/Users/anikeit/agentic-decisions/app/assessment/steps/index.ts)

### Live assessment implementation

- Form container: [app/assessment/components/AssessmentForm.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/AssessmentForm.tsx)
- Question renderer: [app/assessment/components/QuestionStep.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/QuestionStep.tsx)
- Step UIs:
  - [app/assessment/steps/step-01-basics.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-01-basics.tsx)
  - [app/assessment/steps/step-02-current-state.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-02-current-state.tsx)
  - [app/assessment/steps/step-03-requirements.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-03-requirements.tsx)
  - [app/assessment/steps/step-04-constraints.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-04-constraints.tsx)

### Assessment branching

- Conditional rendering rules: [lib/assessment/conditional-logic.ts](/Users/anikeit/agentic-decisions/lib/assessment/conditional-logic.ts)

### Scoring engine

- Shared types: [lib/scoring/types.ts](/Users/anikeit/agentic-decisions/lib/scoring/types.ts)
- Weight derivation: [lib/scoring/weights.ts](/Users/anikeit/agentic-decisions/lib/scoring/weights.ts)
- Core scoring and ranking: [lib/scoring/score-platform.ts](/Users/anikeit/agentic-decisions/lib/scoring/score-platform.ts)
- Gates: [lib/scoring/gates.ts](/Users/anikeit/agentic-decisions/lib/scoring/gates.ts)
- Evidence builder: [lib/scoring/evidence.ts](/Users/anikeit/agentic-decisions/lib/scoring/evidence.ts)
- Risk model: [lib/scoring/implementation-risk.ts](/Users/anikeit/agentic-decisions/lib/scoring/implementation-risk.ts)
- Confidence model: [lib/scoring/confidence.ts](/Users/anikeit/agentic-decisions/lib/scoring/confidence.ts)
- Assessment-derived context: [lib/assessment/recommendation-context.ts](/Users/anikeit/agentic-decisions/lib/assessment/recommendation-context.ts)

### Results surface

- Results orchestration: [app/assessment/results/components/ResultsContent.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ResultsContent.tsx)
- Top recommendations: [app/assessment/results/components/PlatformScores.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/PlatformScores.tsx)
- Matrix: [app/assessment/results/components/ComparisonMatrix.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ComparisonMatrix.tsx)
- Filters: [app/assessment/results/components/FilterPanel.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/FilterPanel.tsx)
- Cost analysis: [app/assessment/results/components/CostCalculator.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/CostCalculator.tsx)
- Decision memo: [app/assessment/results/components/DecisionMemo.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/DecisionMemo.tsx)
- AI brief: [app/assessment/results/components/AIDecisionBrief.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/AIDecisionBrief.tsx)

### Regression coverage

- Main scoring tests: [lib/scoring/__tests__/scoring.test.ts](/Users/anikeit/agentic-decisions/lib/scoring/__tests__/scoring.test.ts)
- Decision memo tests: [lib/scoring/__tests__/decision-memo.test.ts](/Users/anikeit/agentic-decisions/lib/scoring/__tests__/decision-memo.test.ts)
- Decision packet tests: [lib/scoring/__tests__/decision-packet.test.ts](/Users/anikeit/agentic-decisions/lib/scoring/__tests__/decision-packet.test.ts)

## What Is Actually Fixed

These areas are no longer the main problem:

- Ranking now sorts gate-passing platforms ahead of platforms with hard failures.
- The matrix is no longer a pure normalized-percent table.
- `evaluationContext` is now used in `implementationRisk`, `confidence`, and `evidence`.
- Cost analysis now derives complexity from assessment context instead of hardcoded defaults.
- Deployment mismatch from `currentStack` is now treated as a soft signal in `gates.ts`, not a hard gate.

This matters because the next work should not revisit those fixes unless we are refining them.

## Live Problems

### 1. Assessment schema and live form are still out of sync

Current reality:

- The canonical assessment type is nested by step in [assessment-schema.ts](/Users/anikeit/agentic-decisions/app/assessment/schemas/assessment-schema.ts).
- The live form registers flat fields in [AssessmentForm.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/AssessmentForm.tsx).
- The form uses `useForm<any>`, which weakens compiler guarantees.

Impact:

- Schema drift is easy to introduce.
- UI can ask questions that are outside validated data.
- Results/scoring read a flattened object that is not the same shape as the canonical type.

### 2. Step 3 detail questions are outside the schema and not truly conditional

Current reality:

- [step-03-requirements.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-03-requirements.tsx) renders `healthcareDataTypes` and `governmentAgency`.
- [step-schemas.ts](/Users/anikeit/agentic-decisions/app/assessment/schemas/step-schemas.ts) does not define them in `step3Schema`.
- [conditional-logic.ts](/Users/anikeit/agentic-decisions/lib/assessment/conditional-logic.ts) now only special-cases `existingPlatforms`, so those Step 3 questions fall through the default path.

Impact:

- They appear more broadly than intended.
- They bypass canonical validation.
- They are not wired into scoring.

### 3. Several collected answers still do not influence the recommendation

Current reality:

- [weights.ts](/Users/anikeit/agentic-decisions/lib/scoring/weights.ts) only consumes:
  - `integrationNeeds`
  - `complianceRequirements`
  - `budgetRange`
  - `primaryUseCases` / `useCases`
  - `currentStack` / `techStack`
  - `teamTechnicalLevel`
  - `organizationSize`
- The assessment also collects:
  - `decisionMakers`
  - `existingPlatforms`
  - `healthcareDataTypes`
  - `governmentAgency`

Impact:

- The assessment implies more personalization than the engine actually provides.
- Extra required questions create friction without improving the recommendation.

### 4. Regression coverage still reflects the older scoring model

Current reality:

- [scoring.test.ts](/Users/anikeit/agentic-decisions/lib/scoring/__tests__/scoring.test.ts) still includes deprecated budget enums like `under-5000`.
- It mostly tests SAW output and criterion presence.
- It does not meaningfully protect:
  - gate ordering
  - hard vs soft gate behavior
  - evidence payload shape
  - confidence behavior
  - implementation-risk behavior

Impact:

- The trust-critical parts of the product are easiest to regress silently.

## Root Cause By Layer

### Contract drift

The system has two competing assessment contracts:

- canonical nested Zod schema
- actual flattened form payload used by scoring/results

This is the biggest structural reason fixes do not "stick."

### Feature drift

The product now has richer logic than before, but new scoring concepts were added faster than:

- the questionnaire was redesigned,
- the validation model was updated,
- the tests were rewritten.

### Presentation drift

The results page is already built around the richer model, but the assessment still behaves like an older form with patchwork additions.

## Source Of Truth Going Forward

To stop repetition, each concern needs one owner.

### Assessment fields

Source of truth should be:
- [app/assessment/schemas/step-schemas.ts](/Users/anikeit/agentic-decisions/app/assessment/schemas/step-schemas.ts)

Rule:
- No question should appear in the UI unless it exists in the schema.

### Assessment payload shape

Source of truth should be:
- the actual shape consumed by [ResultsContent.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ResultsContent.tsx#L61)
- and [deriveWeights()](/Users/anikeit/agentic-decisions/lib/scoring/weights.ts#L65)

Rule:
- The stored payload shape and the TypeScript form type must match.

### Recommendation logic

Source of truth should be:
- [lib/scoring/types.ts](/Users/anikeit/agentic-decisions/lib/scoring/types.ts)
- [lib/scoring/score-platform.ts](/Users/anikeit/agentic-decisions/lib/scoring/score-platform.ts)

Rule:
- If a field materially affects the recommendation, it must be visible in scoring types/tests.

### Results evidence

Source of truth should be:
- [lib/scoring/evidence.ts](/Users/anikeit/agentic-decisions/lib/scoring/evidence.ts)

Rule:
- Matrix columns should only display facts that are deliberately defined in `Evidence`.

### Regression coverage

Source of truth should be:
- [lib/scoring/__tests__/scoring.test.ts](/Users/anikeit/agentic-decisions/lib/scoring/__tests__/scoring.test.ts)

Rule:
- Every new scoring layer must have tests before UI polish is added on top.

## Recommended Fix Order

### Phase 1. Freeze the assessment contract

Goal:
- remove schema/UI drift

Changes:
- Decide whether the form should be flat or nested.
- Make [AssessmentForm.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/AssessmentForm.tsx) use the real typed shape instead of `any`.
- Remove or schema-back `healthcareDataTypes` and `governmentAgency`.
- Ensure conditional logic only references fields that are in schema and intentionally stored.

Definition of done:
- every rendered field exists in schema
- no `useForm<any>` in the assessment flow

### Phase 2. Trim or wire every collected answer

Goal:
- stop collecting unused nuance

Changes:
- For each field, explicitly choose one:
  - affects gating
  - affects weights
  - affects evidence/explanation only
  - remove it

Recommended treatment:
- `decisionMakers`: likely explanation/evidence only unless you want procurement weighting
- `existingPlatforms`: likely switching-cost / migration-risk input
- `healthcareDataTypes`: likely explanation and maybe HIPAA-risk nuance
- `governmentAgency`: likely FedRAMP/government-readiness nuance

Definition of done:
- no required field exists without a documented reason it is collected

### Phase 3. Rewrite the scoring tests around the layered model

Goal:
- protect what now matters

Add tests for:
- hard-gate ranking precedence
- soft deployment warnings not counting as hard requirement failures
- evidence payload fields
- confidence label behavior
- implementation-risk label behavior
- current valid budget enums only

Definition of done:
- tests fail if layered-model behavior regresses

### Phase 4. Only then redesign the assessment and matrix further

Goal:
- improve depth without reintroducing drift

Assessment improvements after stabilization:
- split `current infrastructure` from `required deployment model`
- add `hard requirement` vs `preference`
- add `acceptable implementation burden`
- add `migration tolerance`
- add `top 3 priorities`

Matrix improvements after stabilization:
- keep evidence-first structure
- add explicit integration coverage details
- add confidence tooltip / assumption disclosure
- show hard-fail reasons more clearly

## Field-by-Field Recommendation

### Keep and score now

- `integrationNeeds`
- `complianceRequirements`
- `budgetRange`
- `primaryUseCases`
- `teamTechnicalLevel`
- `organizationSize`
- `expectedMonthlyConversations`
- `timeline`

### Keep, but reframe

- `currentStack`
  - current environment only
- add a separate future field:
  - `requiredDeploymentModel`

### Keep for explanation or risk, not core weighting

- `decisionMakers`
- `existingPlatforms`
- `industry`

### Remove or defer unless you implement real logic

- `healthcareDataTypes`
- `governmentAgency`

## Short Answer To “Why Isn’t It Fixing Things?”

Because we have been fixing individual symptoms inside a multi-layer system without first locking the contract between:

- questionnaire
- schema
- stored assessment payload
- scoring engine
- matrix/evidence
- tests

The next pass should not start with UI polish or more scoring tweaks.

It should start by stabilizing the assessment contract and the scoring tests.

Once that is done, the matrix and deeper recommendation logic will stop drifting every time we touch one piece.
