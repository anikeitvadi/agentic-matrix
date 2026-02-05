# Requirements: Agentic Decisions

**Defined:** 2026-02-05
**Core Value:** IT leaders can input their situation and get an honest, actionable recommendation — not a vendor pitch.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Assessment Engine

- [ ] **ASSM-01**: User can complete multi-step questionnaire with conditional branching
- [ ] **ASSM-02**: User can save progress and resume assessment later
- [ ] **ASSM-03**: System generates AI-powered follow-up questions based on user answers

### Recommendation Engine

- [ ] **RECC-01**: System calculates weighted scores for each platform based on user inputs
- [ ] **RECC-02**: User can view side-by-side comparison matrix of recommended platforms
- [ ] **RECC-03**: User can filter platforms by budget, compliance requirements, and stack fit
- [ ] **RECC-04**: User can see decision audit trail explaining why platform X was recommended over Y

### Platform Data

- [ ] **PLAT-01**: System displays structured profiles for 10-12 agent platforms (capabilities, pricing, pros/cons)
- [ ] **PLAT-02**: Each platform profile links to official documentation and pricing pages

### Cost Calculator

- [ ] **COST-01**: User can estimate token costs based on expected usage volume
- [ ] **COST-02**: User can compare platform subscription/licensing fees side-by-side
- [ ] **COST-03**: User can view total cost of ownership (TCO) projection over 12-36 months
- [ ] **COST-04**: User can see engineering time estimates for implementing each platform

### Blueprint Library

- [ ] **BLPR-01**: User can view architecture diagrams for each use case + platform combination
- [ ] **BLPR-02**: User can access implementation checklist for their selected platform/use case
- [ ] **BLPR-03**: User can see common pitfalls and warnings for their use case

### Export

- [ ] **EXPRT-01**: User can export recommendation and comparison as PDF
- [ ] **EXPRT-02**: User can email results directly to stakeholders

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Data Quality

- **DATA-01**: Platform profiles show last-updated timestamps and confidence levels
- **DATA-02**: System tracks and displays changelog (what changed since user's last visit)
- **DATA-03**: Users can submit corrections/updates to platform data

### Enhanced Sharing

- **SHARE-01**: User can generate shareable link to their results
- **SHARE-02**: User can save multiple assessments to their account

### Enhanced Analysis

- **ANLYS-01**: User can compare scenarios (what if I changed budget/requirements)
- **ANLYS-02**: Blueprint library includes code snippets and starter templates

### Mobile Experience

- **MOBL-01**: Full mobile-responsive experience for all features

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Consulting services | Self-serve product for v1, not services business |
| Platform partnerships/referrals | Focus on building tool first, monetization later |
| White-labeling for SIs | Future consideration after product-market fit |
| Native mobile app | Web-first approach |
| User accounts/authentication | Defer until sharing features needed |
| Real-time collaboration | Adds significant complexity, not core value |
| Vendor-sponsored content | Compromises neutrality — core differentiator |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ASSM-01 | Phase 2 | Pending |
| ASSM-02 | Phase 2 | Pending |
| ASSM-03 | Phase 2 | Pending |
| RECC-01 | Phase 3 | Pending |
| RECC-02 | Phase 3 | Pending |
| RECC-03 | Phase 3 | Pending |
| RECC-04 | Phase 3 | Pending |
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| COST-01 | Phase 4 | Pending |
| COST-02 | Phase 4 | Pending |
| COST-03 | Phase 4 | Pending |
| COST-04 | Phase 4 | Pending |
| BLPR-01 | Phase 5 | Pending |
| BLPR-02 | Phase 5 | Pending |
| BLPR-03 | Phase 5 | Pending |
| EXPRT-01 | Phase 6 | Pending |
| EXPRT-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after roadmap creation*
