# Requirements: Agentic Decisions

**Defined:** 2026-02-05
**Core Value:** IT leaders can input their situation and get an honest, actionable recommendation — not a vendor pitch.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

**Status rule:** A requirement is only checked off here when the feature is both implemented and treated as current product behavior. Build-complete-but-unverified work stays open in the list and is called out in traceability.

### Assessment Engine

- [x] **ASSM-01**: User can complete multi-step questionnaire with conditional branching
- [x] **ASSM-02**: User can save progress and resume assessment later
- [x] **ASSM-03**: Assessment captures structured inputs that materially affect recommendations

### Recommendation Engine

- [x] **RECC-01**: System calculates weighted scores for each platform based on user inputs
- [x] **RECC-02**: User can view side-by-side comparison matrix of recommended platforms
- [x] **RECC-03**: User can filter platforms by budget, compliance requirements, and stack fit
- [x] **RECC-04**: User can see decision audit trail explaining why platform X was recommended over Y

### Platform Data

- [x] **PLAT-01**: System displays structured profiles for the current curated platform catalog (capabilities, pricing, pros/cons)
- [x] **PLAT-02**: Each platform profile links to official documentation and pricing pages

### Cost Calculator

- [x] **COST-01**: User can estimate token costs based on expected usage volume
- [x] **COST-02**: User can compare platform subscription/licensing fees side-by-side
- [x] **COST-03**: User can view total cost of ownership (TCO) projection over 12-36 months
- [x] **COST-04**: User can see engineering time estimates for implementing each platform

### Blueprint Library

- [ ] **BLPR-01**: User can view architecture diagrams for supported blueprint use cases and applicable platforms
- [ ] **BLPR-02**: User can access implementation checklist for supported blueprint use cases
- [ ] **BLPR-03**: User can see common pitfalls and warnings for supported blueprint use cases

### Export

- [ ] **EXPRT-01**: User can export a stakeholder-ready decision packet, including printable PDF workflow
- [ ] **EXPRT-02**: User can email results directly to stakeholders

## Requirement Notes

- **2026-03-24:** `ASSM-03` was redefined. The original AI follow-up question flow was removed because it did not influence scoring; AI now exists only as an optional results-side explanation layer.
- **2026-03-24:** `BLPR-01` to `BLPR-03` remain open because the blueprint build is complete through `05-06`, but `05-07-PLAN.md` human verification is still pending.
- **2026-03-24:** `EXPRT-01` is partially implemented via markdown export and print/save-PDF decision packet flow; direct email delivery (`EXPRT-02`) is still not implemented.
- **2026-03-28:** `PLAT-01` wording was updated from the original 10-12 platform target to reflect the current catalog without baking in a stale count.

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
| ASSM-01 | Phase 2 | Complete |
| ASSM-02 | Phase 2 | Complete |
| ASSM-03 | Phase 2 | Complete (redefined on 2026-03-24) |
| RECC-01 | Phase 3 | Complete |
| RECC-02 | Phase 3 | Complete |
| RECC-03 | Phase 3 | Complete |
| RECC-04 | Phase 3 | Complete |
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 1 | Complete |
| COST-01 | Phase 4 | Complete |
| COST-02 | Phase 4 | Complete |
| COST-03 | Phase 4 | Complete |
| COST-04 | Phase 4 | Complete |
| BLPR-01 | Phase 5 | Verification pending |
| BLPR-02 | Phase 5 | Verification pending |
| BLPR-03 | Phase 5 | Verification pending |
| EXPRT-01 | Phase 6 | Partial |
| EXPRT-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-03-28*
