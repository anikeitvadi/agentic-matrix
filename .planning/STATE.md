# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** IT leaders can input their situation and get an honest, actionable recommendation — not a vendor pitch.
**Current focus:** Phase 5 - Blueprint Library

## Current Position

Phase: 5 of 6 (Blueprint Library)
Plan: 3 of 7 complete
Status: In progress
Last activity: 2026-03-19 — Completed 05-03-PLAN.md

Progress: [█████████████████████████░░░░░] 92% (23/25 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 23
- Average duration: 15 min
- Total execution time: 5h 59min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-platform-data | 4 | 242 min | 61 min |
| 02-assessment-engine | 6 | 30 min | 5 min |
| 03-recommendation-comparison | 5 | 14 min | 3 min |
| 04-cost-analysis | 6 | 24 min | 4 min |
| 05-blueprint-library | 3 | 5 min | 2 min |

**Recent Trend:**
- Last 5 plans: [04-05: 3min, 04-06: human, 05-01: 2min, 05-02: 0min, 05-03: 3min]
- Phase 5 in progress, customer support blueprint complete with architecture diagram

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Web app over static content (interactive assessment provides more value)
- 10-12 platforms in v1 (comprehensive landscape coverage - 5 created in 01-02, 5-7 remaining)
- 5-6 blueprints in v1 (most common enterprise use cases)
- Vendor-neutral positioning (core differentiator, non-negotiable)
- Tailwind v4 CSS-first config (01-01: cleaner, more standard CSS architecture)
- Velite webpack integration (01-01: ensures types are always fresh at dev start)
- Platform schema includes lastVerified timestamp (01-01: addresses staleness concern)
- Navigation sticky positioning (01-03: keeps links accessible while scrolling)
- Minimal footer for v1 (01-03: can expand in later phases as needed)
- Three value props on landing page (01-03: establishes vendor neutrality trust immediately)
- 4-step questionnaire structure (02-01: Basics, Current State, Requirements, Constraints)
- React Hook Form for form state (02-01: minimal re-renders, excellent DX)
- Zod schema-driven validation (02-01: type safety via z.infer, custom error messages)
- AI SDK for follow-up questions (02-01: future-ready for dynamic question generation)
- Manual step validation over zodResolver (02-02: cleaner for multi-step forms with dynamic schemas)
- Step registry pattern (02-02: centralizes step components and validation logic)
- Explicit switch statements for conditional logic (02-03: more maintainable than rule engine for ~10 fields)
- useWatch for reactive form values (02-03: React 19 compatible, triggers conditional visibility updates)
- Lazy state initialization for currentStep (02-04: prevents hydration mismatch with SSR)
- Auto-hide resume notice after 5 seconds (02-04: non-intrusive UX feedback)
- Separate step persistence from form data (02-04: independent tracking and restoration)
- generateObject for structured AI output (02-05: ensures Zod schema compliance)
- useTransition over useActionState (02-05: simpler for non-form Server Action calls)
- AI follow-up on final step only (02-06: gather all context first, then clarify before submission)
- 0.5 neutral score when max equals min (03-01: fair treatment when no variation)
- CRITERION_DIRECTIONS as constant map (03-01: easy extension for new criteria)
- Vitest over Jest (03-02: faster execution, ESM native, Vite ecosystem)
- TDD RED-GREEN for scoring (03-02: critical business logic tested before UI)
- MAX_WEIGHT 0.35 cap (03-02: ensures multiple criteria influence results)
- Tier-to-budget mapping (03-03: practical heuristic for filter logic)
- Memoized filter application (03-03: performance optimization for TanStack Table)
- Performance thresholds at 0.8/0.6/0.4/0.2 (03-04: natural language breakpoints)
- Top 3 advantages + top 2 disadvantages (03-04: balance between detail and brevity)
- Four pricing model taxonomy (04-01: pay-per-use, subscription, per-conversation, hybrid)
- TokenPricing includes modelVariants array (04-01: support multi-model platforms)
- PERT formula for engineering estimates (04-01: realistic effort estimation with uncertainty)
- Default TCO config: $800/day engineering, 15% infra, 20% contingency (04-01: conservative baselines)
- PERT three-point formula for engineering (04-02: (O+4M+P)/6 accounts for uncertainty)
- $150/hr default engineer rate (04-02: market rate, user-configurable)
- Engineering costs spread over first 3 months in timeline (04-02: implementation front-loaded)
- Logarithmic-feel slider steps for usage input (04-03: intuitive scaling from 1K to 1M)
- Three usage presets: Starter 5K, Growth 50K, Enterprise 500K (04-03: common organization sizes)
- Horizontal bar layout for cost comparison (04-03: accommodates long platform names)
- Engineering costs only in yearly/tco36 views (04-03: implementation is one-time)
- Gradient fills with low opacity for TCO chart distinction (04-04: visual clarity)
- Confidence bar visualization for engineering estimates (04-04: shows range and expected value)
- Category icons for cost breakdown items (04-04: quick visual scanning)
- Default to 50K conversations for baseline usage (04-05: Growth tier balances starter and enterprise)
- Filter to top 5 platforms for cost comparison (04-05: prevents UI overwhelm with 11 platforms)
- Engineering costs spread over 3 months in TCO timeline (04-05: realistic implementation schedule)
- Default to yearly view for period selector (04-05: shows complete TCO including implementation)
- Click platform card to highlight TCO curve (04-05: connects detail to timeline)
- mdx-mermaid for blueprint diagrams (05-01: diagrams-as-code in MDX content)
- useCase enum with 5 values (05-01: customer-support, data-extraction, workflow-automation, knowledge-base, approval-workflows)
- applicablePlatforms as slug array (05-01: matrix relationships without file explosion)
- PERT-style duration breakdown (05-01: foundation/build/test/deploy phases for realistic estimates)
- Admonition component for platform callouts (05-02: warning/tip/info/danger types with styled borders)
- Customer support blueprint pattern (05-03: 379 lines with Mermaid diagram, 5-phase checklist, 17 callouts, common pitfalls)

### Pending Todos

None yet.

### Blockers/Concerns

**Research insights:**
- Phase 1: Start with 5 platforms (not 12) to establish sustainable maintenance cadence before expanding — ADDRESSED: 5 platforms created in 01-02
- Phase 1: Build timestamp and confidence level system from day one to combat data staleness — ADDRESSED: lastVerified visible on all views
- Phase 5: Blueprint library may need deeper research during planning (agent-specific patterns less documented)

**Content maintenance:**
- 11 platforms now have structured pricing data (up from 5)
- 1 blueprint complete (customer-support), 2 placeholders (data-extraction, workflow-automation)
- Need process for quarterly re-verification of platform data and blueprints
- No automated link validation for external docs/pricing URLs

## Session Continuity

Last session: 2026-03-19
Stopped at: Completed 05-03-PLAN.md
Resume file: None
Next action: Continue Phase 5 execution (remaining blueprints: data-extraction, workflow-automation)

---
*State initialized: 2026-02-05*
*Last updated: 2026-03-19*
