# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** IT leaders can input their situation and get an honest, actionable recommendation — not a vendor pitch.
**Current focus:** Portfolio hardening after original Phase 5 build work

## Current Position

Original roadmap phase: 5 of 6 (Blueprint Library)
Phase 5 execution: 6 of 7 plans complete (05-07 human verification still pending)
Current workstream: Portfolio hardening milestones from 2026-03-24 review
Status: Active
Last activity: 2026-03-24 — Results credibility, AI decision brief, and export packet shipped

Original roadmap progress: [██████████████████████████████░] 96% (26/27 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 26
- Average duration: 13 min
- Total execution time: 6h 17min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-platform-data | 4 | 242 min | 61 min |
| 02-assessment-engine | 6 | 30 min | 5 min |
| 03-recommendation-comparison | 5 | 14 min | 3 min |
| 04-cost-analysis | 6 | 24 min | 4 min |
| 05-blueprint-library | 6 | 23 min | 4 min |

**Recent Trend:**
- Last 5 plans: [05-02: 0min, 05-03: 3min, 05-04: 5min, 05-05: 10min, 05-06: 3min]
- Phase 5 build work complete through 05-06; 05-07 verification is still unrecorded
- Post-roadmap hardening underway on scoring/results credibility, export packet, and portfolio presentation

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Web app over static content (interactive assessment provides more value)
- Original v1 target was 10-12 platforms; the live catalog has since expanded to 19
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
- AI used for optional results-side decision brief, not for black-box ranking
- Manual step validation over zodResolver (02-02: cleaner for multi-step forms with dynamic schemas)
- Step registry pattern (02-02: centralizes step components and validation logic)
- Explicit switch statements for conditional logic (02-03: more maintainable than rule engine for ~10 fields)
- useWatch for reactive form values (02-03: React 19 compatible, triggers conditional visibility updates)
- Lazy state initialization for currentStep (02-04: prevents hydration mismatch with SSR)
- Auto-hide resume notice after 5 seconds (02-04: non-intrusive UX feedback)
- Separate step persistence from form data (02-04: independent tracking and restoration)
- generateObject for structured AI output (02-05: ensures Zod schema compliance)
- useTransition over useActionState (02-05: simpler for non-form Server Action calls)
- Assessment flow should only collect structured inputs that materially affect scoring
- 0.5 neutral score when max equals min (03-01: fair treatment when no variation)
- CRITERION_DIRECTIONS as constant map (03-01: easy extension for new criteria)
- Vitest over Jest (03-02: faster execution, ESM native, Vite ecosystem)
- TDD RED-GREEN for scoring (03-02: critical business logic tested before UI)
- MAX_WEIGHT 0.35 cap (03-02: ensures multiple criteria influence results)
- Pricing-backed annual cost filtering replaces tier-to-budget heuristics
- Deterministic decision memo on results page explains winner, runner-ups, and change scenarios
- Exportable decision packet supports copy/download/print for stakeholder sharing
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
- Filter to top 5 platforms for cost comparison (04-05: prevents UI overwhelm as platform coverage expanded)
- Engineering costs spread over 3 months in TCO timeline (04-05: realistic implementation schedule)
- Default to yearly view for period selector (04-05: shows complete TCO including implementation)
- Click platform card to highlight TCO curve (04-05: connects detail to timeline)
- mdx-mermaid for blueprint diagrams (05-01: diagrams-as-code in MDX content)
- useCase enum with 5 values (05-01: customer-support, data-extraction, workflow-automation, knowledge-base, approval-workflows)
- applicablePlatforms as slug array (05-01: matrix relationships without file explosion)
- PERT-style duration breakdown (05-01: foundation/build/test/deploy phases for realistic estimates)
- Admonition component for platform callouts (05-02: warning/tip/info/danger types with styled borders)
- Customer support blueprint pattern (05-03: 379 lines with Mermaid diagram, 5-phase checklist, 17 callouts, common pitfalls)
- Validation-first extraction (05-04: Zod schemas before extraction logic, confidence scoring per field)
- MDX angle bracket handling (05-04: write 'Less than 20%' not '<20%' to avoid JSX parse errors)
- Orchestrator-worker over multi-agent (05-05: single orchestrator coordinating workers vs agents negotiating)
- iPaaS for structured workflows (05-05: Tray/Workato recommended when pre-built connectors cover 80%+ needs)
- Decision framework upfront (05-05: "When NOT to use agents" section prevents over-engineering)
- MDX percentage symbol handling (05-05: write '80 percent' not '80%' to avoid JavaScript property access parsing)
- Async MDX rendering for Velite (05-06: useEffect with async function wrapper for await import statements)
- Client-side MDX evaluation (05-06: new Function() with component mapping for dynamic imports)

### Pending Todos

None yet.

### Blockers/Concerns

**Current concerns:**
- Phase 5 still lacks recorded human verification (`05-07-PLAN.md`)
- TS/TSX lint coverage is enabled, but the codebase still has lint warnings to clean up
- README/repo packaging still needs to catch up to product quality
- Developer-first platform coverage is still thinner than enterprise and iPaaS coverage

**Content maintenance:**
- 19 platforms now have structured profiles with pricing, capabilities, and source links
- 3 blueprints complete (customer-support, data-extraction, workflow-automation)
- Blueprint library UI complete with listing and detail pages
- Need process for quarterly re-verification of platform data and blueprints
- No automated link validation for external docs/pricing URLs
- MDX parsing edge cases documented (angle brackets, percentage symbols)
- Mermaid diagram rendering uses basic placeholder (may need enhancement for interactivity)

## Session Continuity

Last session: 2026-03-24
Stopped at: Portfolio hardening pass after recommendation/results redesign
Resume file: .planning/PREMIER-PORTFOLIO-EXECUTION-PLAN-2026-03-24.md
Next action: Record or perform 05-07 human verification, then finish repo credibility work (TS/TSX lint coverage, README, planning cleanup)

---
*State initialized: 2026-02-05*
*Last updated: 2026-03-28*
