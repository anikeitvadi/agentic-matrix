# Roadmap: Agentic Decisions

## Overview

Build a vendor-neutral AI agent platform decision toolkit that helps enterprise IT leaders select the right platform for their needs. Starting with foundational infrastructure and platform data, we'll progressively add interactive assessment, recommendation logic, cost analysis, implementation blueprints, and sharing capabilities. Each phase delivers complete, verifiable functionality that builds toward a comprehensive self-serve decision support system.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Platform Data** - Setup project infrastructure and initial platform coverage
- [x] **Phase 2: Assessment Engine** - Interactive questionnaire with save/resume capability
- [x] **Phase 3: Recommendation & Comparison** - Scoring system with filtering and decision audit trail
- [x] **Phase 4: Cost Analysis** - ROI calculator and total cost of ownership projections
- [ ] **Phase 5: Blueprint Library** - Implementation guidance with architecture diagrams
- [ ] **Phase 6: Export & Sharing** - PDF export and email functionality

## Phase Details

### Phase 1: Foundation & Platform Data
**Goal**: Establish maintainable technical foundation with structured platform data for 5 core platforms
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02
**Success Criteria** (what must be TRUE):
  1. User can view structured profiles for 5 agent platforms with capabilities, pricing, and official documentation links
  2. Each platform profile displays last-verified timestamp indicating data freshness
  3. Project runs locally with TypeScript compilation, linting, and hot reload working
  4. Editorial Independence Policy is published and accessible to users
**Plans**: 4 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md — Initialize Next.js 16 project with TypeScript, Tailwind v4, and Velite
- [x] 01-02-PLAN.md — Create 5 platform MDX content files and platform pages
- [x] 01-03-PLAN.md — Create Editorial Policy page and site navigation
- [x] 01-04-PLAN.md — Human verification of Phase 1 success criteria

### Phase 2: Assessment Engine
**Goal**: Users can complete interactive questionnaire with progress saving
**Depends on**: Phase 1
**Requirements**: ASSM-01, ASSM-02, ASSM-03
**Success Criteria** (what must be TRUE):
  1. User can complete multi-step questionnaire answering 10-15 questions about their situation
  2. User can save their assessment progress at any point and resume later from the same browser
  3. User receives AI-powered follow-up questions that adapt based on their previous answers
  4. User sees conditional branching where irrelevant questions are skipped based on context
**Plans**: 6 plans in 5 waves

Plans:
- [x] 02-01-PLAN.md — Install dependencies and create assessment schemas
- [x] 02-02-PLAN.md — Build multi-step form UI with step navigation
- [x] 02-03-PLAN.md — Implement conditional branching logic
- [x] 02-04-PLAN.md — Add progress persistence via localStorage
- [x] 02-05-PLAN.md — Add AI-powered follow-up questions
- [x] 02-06-PLAN.md — Human verification of Phase 2 success criteria

### Phase 3: Recommendation & Comparison
**Goal**: Users receive scored platform recommendations with transparent reasoning
**Depends on**: Phase 2
**Requirements**: RECC-01, RECC-02, RECC-03, RECC-04
**Success Criteria** (what must be TRUE):
  1. User receives weighted platform scores (0-100) based on their questionnaire responses
  2. User can view side-by-side comparison matrix showing how platforms stack up across key criteria
  3. User can filter platforms by budget constraints, compliance requirements, and existing stack compatibility
  4. User can read decision audit trail explaining exactly why platform X scored higher than platform Y for their situation
  5. Scoring methodology is transparent and explainable (no black-box algorithms)
**Plans**: 5 plans in 4 waves

Plans:
- [x] 03-01-PLAN.md — Create scoring types and normalization utilities
- [x] 03-02-PLAN.md — Implement SAW scoring engine with TDD
- [x] 03-03-PLAN.md — Build results UI with comparison matrix and filtering
- [x] 03-04-PLAN.md — Add decision audit trail and wire form submission
- [x] 03-05-PLAN.md — Human verification of Phase 3 success criteria

### Phase 4: Cost Analysis
**Goal**: Users understand total cost implications of each platform recommendation
**Depends on**: Phase 3
**Requirements**: COST-01, COST-02, COST-03, COST-04
**Success Criteria** (what must be TRUE):
  1. User can input expected usage volume and see estimated token costs for each recommended platform
  2. User can compare platform subscription and licensing fees side-by-side with pricing tier details
  3. User can view total cost of ownership projections over 12, 24, and 36 month timeframes
  4. User can see engineering time estimates for implementing each platform option
  5. Cost calculator shows complete picture including infrastructure, platform fees, and personnel costs
**Plans**: 6 plans in 3 waves

Plans:
- [x] 04-01-PLAN.md — Install dependencies, create cost types, extend pricing schema
- [x] 04-02-PLAN.md — Implement cost calculators with TDD (token, subscription, TCO, engineering)
- [x] 04-03-PLAN.md — Create usage input panel and cost comparison chart
- [x] 04-04-PLAN.md — Create TCO projection chart and platform cost cards
- [x] 04-05-PLAN.md — Create CostCalculator container and integrate into results page
- [x] 04-06-PLAN.md — Human verification of Phase 4 success criteria

### Phase 5: Blueprint Library
**Goal**: Users access implementation-ready guidance for their selected platform and use case
**Depends on**: Phase 4
**Requirements**: BLPR-01, BLPR-02, BLPR-03
**Success Criteria** (what must be TRUE):
  1. User can view architecture diagrams for their specific use case with their recommended platform
  2. User can access implementation checklist breaking down the deployment into actionable steps
  3. User can read common pitfalls and warnings specific to their use case and platform combination
  4. Blueprint library covers 3-5 common enterprise use cases (customer support, data extraction, workflow automation, etc.)
**Plans**: 7 plans in 4 waves

Plans:
- [ ] 05-01-PLAN.md — Configure mdx-mermaid and blueprint Velite schema
- [ ] 05-02-PLAN.md — Create Admonition and blueprint MDX components
- [ ] 05-03-PLAN.md — Create Customer Support blueprint content
- [ ] 05-04-PLAN.md — Create Data Extraction blueprint content
- [ ] 05-05-PLAN.md — Create Workflow Automation blueprint content
- [ ] 05-06-PLAN.md — Create blueprint pages and navigation
- [ ] 05-07-PLAN.md — Human verification of Phase 5 success criteria

### Phase 6: Export & Sharing
**Goal**: Users can export and share their recommendations with stakeholders
**Depends on**: Phase 5
**Requirements**: EXPRT-01, EXPRT-02
**Success Criteria** (what must be TRUE):
  1. User can export their complete recommendation report (comparison, costs, blueprints) as a formatted PDF
  2. User can email results directly to stakeholders with customizable message
  3. Exported PDF is presentation-ready with branding and professional formatting
  4. Email delivery works reliably without landing in spam
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during planning
- [ ] 06-02: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Platform Data | 4/4 | Complete | 2026-02-05 |
| 2. Assessment Engine | 6/6 | Complete | 2026-02-06 |
| 3. Recommendation & Comparison | 5/5 | Complete | 2026-02-09 |
| 4. Cost Analysis | 6/6 | Complete | 2026-02-16 |
| 5. Blueprint Library | 0/7 | Planned | - |
| 6. Export & Sharing | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-05*
*Last updated: 2026-03-19*
