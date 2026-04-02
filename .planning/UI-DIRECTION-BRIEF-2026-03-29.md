# UI Direction Brief

**Project:** Agentic Decisions  
**Date:** 2026-03-29  
**Goal:** Make the UI/UX a clear part of the portfolio value proposition, not just a competent wrapper around strong logic.

## Why This Matters

The product is now much more credible on the recommendation side. The next gap is presentation.

Right now the app reads as:
- trustworthy
- clean
- structured

But it does not yet read as:
- distinctive
- premium
- memorable
- design-led

For recruiter impact, the target impression should be:

> This person can design and build serious decision products that feel both rigorous and unusually polished.

## Current UI Diagnosis

### What is working

- The information architecture is clear.
- The product already has strong content to work with: scoring, decision memo, audit trail, cost modeling, exports.
- The results page has substance and now behaves more like a real decision tool than a thin comparison app.

### What is holding it back

- [app/layout.tsx](/Users/anikeit/agentic-decisions/app/layout.tsx) still uses `Inter`, which makes the whole product feel generic.
- [app/globals.css](/Users/anikeit/agentic-decisions/app/globals.css) only defines a basic blue/gray palette and minimal global styling.
- [app/page.tsx](/Users/anikeit/agentic-decisions/app/page.tsx) has a competent but standard SaaS landing-page structure.
- [app/assessment/results/page.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/page.tsx) and [ResultsContent.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ResultsContent.tsx) still present the output as stacked dashboard sections rather than a cohesive decision dossier.
- [Sidebar.tsx](/Users/anikeit/agentic-decisions/components/ui/Sidebar.tsx) is functional, but the dark app-shell treatment currently feels more like internal tooling than a premium evaluation product.

## Design Positioning

### Direction

Build the product as **editorial decision intelligence**.

That means combining:
- the trust and seriousness of enterprise tooling
- the clarity of a high-end research product
- the restraint of a premium data app

This should feel closer to:
- a strategy memo
- a research product
- a premium SaaS launch

And less like:
- a generic admin dashboard
- a template landing page
- a default Tailwind app

## Reference Stack

Use these as pattern sources, not copy targets:

- **Homepage storytelling:** [Dub](https://dub.co), [OpenStatus](https://www.openstatus.dev/)
- **Results page structure:** [Umami](https://umami.is), [Papermark](https://www.papermark.com), [OpenStatus](https://www.openstatus.dev/)
- **Documentation/detail reading experience:** [Fumadocs](https://fumadocs.dev)
- **Enterprise trust styling:** [Infisical](https://www.infisical.com)
- **Motion accents only:** [Magic UI](https://magicui.design), [React Bits](https://reactbits.dev)
- **Primitive building blocks:** [shadcn/ui](https://ui.shadcn.com)

### Licensing guidance

- Safe to borrow/adapt directly from MIT sources.
- Use AGPL/open-core projects mainly for visual reference and interaction ideas unless you explicitly want those license obligations.

## Visual System

### Creative brief

The product should feel:
- precise
- calm
- high-signal
- slightly editorial
- deeply trustworthy

### Typography

Replace the default `Inter`-only voice with a deliberate pair.

Recommended pairing:
- **UI sans:** `Manrope`
- **Display/editorial serif:** `Newsreader`

Why this pair:
- `Manrope` keeps interface text modern and crisp.
- `Newsreader` adds a more intelligent, editorial tone without feeling decorative.

Use the serif selectively for:
- homepage hero
- major section headers
- decision packet / memo headers
- key pull-quotes or callouts

Keep dense interface tables, filters, and controls in the sans font.

### Color direction

Move away from generic blue-gray SaaS defaults.

Recommended palette:
- **Canvas:** warm ivory / paper
- **Surface:** soft white
- **Ink:** deep slate
- **Primary accent:** deep teal
- **Secondary accent:** muted amber
- **Data colors:** restrained green / rust / indigo

Suggested token mood:
- paper: `#f7f3eb`
- surface: `#fffdf8`
- ink: `#15212b`
- muted: `#667085`
- teal: `#0f766e`
- teal-deep: `#115e59`
- amber: `#b45309`
- border: `#e7dfd1`

This will feel more original, more premium, and more aligned with “decision toolkit” positioning than the current bright-blue palette.

### Surfaces

Standardize around 4 surface types:

1. `paper`
- page-level backgrounds
- subtle warmth and texture

2. `card`
- default white evaluation surface
- soft border, low shadow

3. `emphasis`
- stronger recommendation panels
- tinted or dark contrasting surfaces

4. `data`
- tables, matrices, calculators
- more compact and restrained

### Radius, borders, shadow

- Use larger radii more intentionally: `18-24px` for major panels.
- Prefer thin, warm borders over heavy shadow.
- Shadows should support depth, not define it.

### Motion

Use motion sparingly and with purpose:
- staggered section reveal on page load
- gentle score-bar fills
- subtle hover elevation
- animated background glow or grid in hero sections

Avoid:
- constant looping decoration
- excessive blur clouds
- flashy cursor effects

## Product-Level UX Direction

### Homepage

The homepage should stop feeling like a standard feature landing page and start feeling like a sharp product thesis.

Target structure:

1. Hero with stronger point of view
- “Choose an AI agent platform with evidence, not vendor claims.”
- show one strong artifact preview: recommendation memo, matrix, or scoring audit

2. Proof strip
- `19 structured platform profiles`
- `transparent weighted scoring`
- `pricing-backed comparison`
- `decision memo + export packet`

3. Decision workflow section
- turn the 3-step flow into a visually stronger narrative

4. Results artifact preview
- show a stylized excerpt of the recommendation dossier

5. Why this product exists
- short editorial section on vendor-neutral evaluation, trust, and implementation realism

6. Closing CTA
- more premium, less generic

### Results page

This should become the signature page of the project.

Current issue:
- it reads like multiple useful modules stacked together

Target:
- it should read like a cohesive **decision dossier**

Recommended structure:

1. Recommendation hero
- winner
- confidence
- estimated annual cost
- fit summary
- top reasons

2. Challenger comparison rail
- two runner-ups shown side-by-side with explicit tradeoffs

3. Decision memo block
- current winner
- why not the others
- what would change the recommendation

4. Matrix and filters
- visually subordinate to the recommendation hero
- feels like supporting evidence, not the main story

5. Audit and cost
- collapsible or more compact
- still available, but calmer

6. Export / AI brief
- presented as executive-output tools, not novelty features

### Assessment flow

The assessment should feel more like a guided evaluation than a form wizard.

Improve:
- stronger progress framing
- better question grouping
- clearer stakes for each step
- calmer whitespace and larger headers
- more confident input styling

### Platform and blueprint pages

These should feel like a polished knowledge product, not just long-form content pages.

Goals:
- stronger typographic hierarchy
- cleaner metadata bands
- better table styling
- more intentional prose presentation

## Page-to-Reference Mapping

### Homepage

- Borrow from `Dub`:
  - hero confidence
  - conversion clarity
  - crisp stat treatments
- Borrow from `OpenStatus`:
  - trust-first polish
  - modern product seriousness
- Adapt for this product:
  - less startup-marketing tone
  - more research-tool / decision-tool framing

### Results page

- Borrow from `Umami`:
  - restraint
  - chart/card discipline
- Borrow from `Papermark`:
  - document-style presentation
  - executive-summary feel
- Borrow from `OpenStatus`:
  - premium system-level polish

### Platform / blueprint details

- Borrow from `Fumadocs`:
  - content readability
  - spacing
  - documentation hierarchy
- Borrow from `Infisical`:
  - enterprise credibility
  - settings/data layout discipline

## Implementation Strategy

### Phase 1: Global Visual System

Primary files:
- [app/layout.tsx](/Users/anikeit/agentic-decisions/app/layout.tsx)
- [app/globals.css](/Users/anikeit/agentic-decisions/app/globals.css)
- [components/ui/Sidebar.tsx](/Users/anikeit/agentic-decisions/components/ui/Sidebar.tsx)

Work:
- replace `Inter` with the new type system
- define richer color tokens and surface tokens
- add shared utility classes for shells, cards, headings, section labels, and data surfaces
- soften and refine the sidebar so it feels like product chrome, not admin chrome
- add background atmosphere: subtle texture, grid, or gradient layer

Deliverable:
- a reusable visual system that makes later page work much faster and more consistent

### Phase 2: Homepage Rewrite

Primary files:
- [app/page.tsx](/Users/anikeit/agentic-decisions/app/page.tsx)

Work:
- replace the current centered hero with a more editorial split or asymmetric layout
- add artifact-led preview of the recommendation output
- strengthen proof and differentiation sections
- make CTA hierarchy more confident

Deliverable:
- a homepage that immediately looks like a flagship portfolio project

### Phase 3: Results Page Redesign

Primary files:
- [app/assessment/results/page.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/page.tsx)
- [app/assessment/results/components/ResultsContent.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ResultsContent.tsx)
- [app/assessment/results/components/PlatformScores.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/PlatformScores.tsx)
- [app/assessment/results/components/DecisionMemo.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/DecisionMemo.tsx)
- [app/assessment/results/components/FilterPanel.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/FilterPanel.tsx)
- [app/assessment/results/components/ComparisonMatrix.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ComparisonMatrix.tsx)

Work:
- rebuild the top of the page as a recommendation dossier
- introduce stronger visual hierarchy between headline recommendation and supporting evidence
- improve spacing, panel styles, and typography
- reduce dashboard clutter

Deliverable:
- the strongest recruiter-facing page in the app

### Phase 4: Assessment Flow Polish

Primary files:
- [app/assessment/page.tsx](/Users/anikeit/agentic-decisions/app/assessment/page.tsx)
- [app/assessment/components/AssessmentForm.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/AssessmentForm.tsx)
- [app/assessment/components/QuestionStep.tsx](/Users/anikeit/agentic-decisions/app/assessment/components/QuestionStep.tsx)
- [app/assessment/steps/step-01-basics.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-01-basics.tsx)
- [app/assessment/steps/step-02-current-state.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-02-current-state.tsx)
- [app/assessment/steps/step-03-requirements.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-03-requirements.tsx)
- [app/assessment/steps/step-04-constraints.tsx](/Users/anikeit/agentic-decisions/app/assessment/steps/step-04-constraints.tsx)

Work:
- improve pacing and visual rhythm
- make each step feel consequential
- elevate form controls and progress cues

### Phase 5: Knowledge Pages

Primary files:
- [app/platforms/page.tsx](/Users/anikeit/agentic-decisions/app/platforms/page.tsx)
- [app/platforms/[slug]/page.tsx](/Users/anikeit/agentic-decisions/app/platforms/[slug]/page.tsx)
- [app/blueprints/page.tsx](/Users/anikeit/agentic-decisions/app/blueprints/page.tsx)
- [app/blueprints/[slug]/page.tsx](/Users/anikeit/agentic-decisions/app/blueprints/[slug]/page.tsx)

Work:
- align detail pages to the new visual system
- improve long-form readability
- make supporting content feel portfolio-grade, not secondary

## Concrete Design Rules

These should guide implementation decisions:

1. Lead with artifacts, not claims.
- Show the memo, matrix, pricing evidence, and recommendation logic.

2. Make seriousness visible.
- Typography, spacing, and restraint should communicate trust.

3. Keep the product light-first.
- This app wants clarity and paper-like legibility more than dark-theme drama.

4. Use contrast for emphasis, not everywhere.
- One or two strong panels per page is enough.

5. Avoid dashboard sameness.
- Vary composition, scale, and panel treatment across sections.

6. Reduce decorative UI unless it reinforces meaning.
- Every visual flourish should earn its keep.

## Recommended First Build Slice

If we start implementation now, do this first:

1. update [app/layout.tsx](/Users/anikeit/agentic-decisions/app/layout.tsx) with a new font system
2. redesign [app/globals.css](/Users/anikeit/agentic-decisions/app/globals.css) tokens and shared utilities
3. rewrite [app/page.tsx](/Users/anikeit/agentic-decisions/app/page.tsx)
4. redesign the top half of [ResultsContent.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/ResultsContent.tsx)
5. restyle [PlatformScores.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/PlatformScores.tsx) and [DecisionMemo.tsx](/Users/anikeit/agentic-decisions/app/assessment/results/components/DecisionMemo.tsx)

That sequence gives the biggest visible upgrade with the smallest risk of getting lost in lower-value polish work.

## Success Criteria

The redesign is successful if:

- the homepage looks distinct from a typical Tailwind SaaS starter
- the results page feels like a premium decision artifact
- the visual system supports trust instead of competing with it
- the product reads as both technically rigorous and design-aware
- a recruiter can understand the product and remember the presentation after one short session

## Recommendation

Proceed with a **homepage + results-first overhaul**, anchored in an editorial light-theme system.

That is the highest-leverage path if the goal is to make this project feel exceptional rather than simply complete.
