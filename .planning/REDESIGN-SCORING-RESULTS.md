# Scoring Engine & Results Page Redesign

**Status:** Partially implemented — hybrid model selected, remaining gaps tracked here
**Created:** 2026-03-24
**Last updated:** 2026-03-24
**Purpose:** This document started as a redesign proposal. It now serves as the implementation ledger and gap tracker for scoring and results-page credibility work.

---

## Executive Summary

The original concerns in this area were valid. The highest-risk ones have now been addressed:

- Budget scoring and budget filtering now use the same pricing-backed annual cost model as the cost calculator.
- The assessment now feeds more of its structured context into ranking, including `teamTechnicalLevel`, `timeline`, `organizationSize`, `decisionMakers`, and expected usage volume.
- The results page now leads with requirement matches, rationale, annual cost, runner-up tradeoffs, and recommendation-change scenarios instead of only showing abstract percentages.
- AI no longer collects unused follow-up questions during the assessment. It now exists only as an optional results-side explanation layer.
- Users can now export a stakeholder-ready decision packet in markdown or print-friendly form.

The redesign direction is now explicit: **Approach 3 (hybrid)**. Keep the deterministic weighted engine, but make the primary user experience concrete, explainable, and decision-oriented.

## Selected Direction

The product now follows these rules:

- Keep deterministic scoring as the ranking engine.
- Use AI only to explain the recommendation, not to determine it.
- Lead the results page with match-based summaries and narrative explanation, not the comparison matrix.
- Treat the comparison matrix as a secondary detail view for users who want deeper inspection.
- Reuse the pricing and cost-estimation engine as the source of truth for budget logic.

## Original Problems: Status Review

### Resolved

1. **Tier-based budget proxies instead of real data**
   Budget fit now uses actual annual cost estimates derived from shared pricing logic.

2. **No connection between assessment answers and results**
   The engine now uses more of the structured assessment context, and the results view now surfaces concrete requirement matches, strengths, caveats, and annual cost.

3. **Cost calculator disconnected from scoring**
   Cost estimation is now shared across scoring, recommendation summaries, and budget filtering.

4. **No "why this platform" narrative**
   The results page now includes a deterministic decision memo, runner-up explanations, and recommendation-change scenarios.

5. **AI follow-up answers were stored but unused**
   That path has been removed. AI is now optional and explicitly framed as an explanation layer.

### Improved But Not Fully Solved

1. **Abstract percentages instead of concrete facts**
   The top-of-page recommendation experience is now much more concrete. The comparison matrix still relies heavily on normalized percentages.

2. **String matching where there is no pattern**
   Common stacks and use cases now use explicit keyword maps instead of generic freeform matching. This is better, but the system still depends on capability text rather than a first-class structured taxonomy.

3. **Scores cluster and feel arbitrary**
   This is less visible because the primary experience no longer leads with a flat score table. The underlying SAW model and normalization are still present.

4. **Min-max normalization is misleading**
   This is still true in the weighted comparison layer. It is acceptable as an internal ranking mechanism, but it should not be the main trust signal.

## What Shipped

### Assessment And Scoring

- Added usage-volume input to the assessment so recommendations can use pricing-backed estimates immediately.
- Wired `teamTechnicalLevel` into weighting and implementation-fit scoring.
- Used `timeline`, `organizationSize`, and `decisionMakers` to shape weight derivation.
- Replaced budget-tier heuristics with pricing-backed annual estimates.
- Added explicit keyword maps for stack and use-case matching.
- Added recommendation summary metadata: headline, rationale, strengths, caveats, match count, and annual cost.

### Results Experience

- Reworked the top recommendation into a concrete match summary.
- Added deterministic "why this platform / why not the runner-ups / what would change the recommendation" memo.
- Added an optional AI decision brief that explains deterministic results instead of pretending to influence ranking.
- Added an exportable decision packet for copy, markdown download, and print/save-PDF workflow.

### Filtering And Comparison

- Aligned budget filtering with the same annual pricing logic used by scoring.
- Aligned stack filtering with the same assessment vocabulary used by scoring.
- Kept the comparison matrix as a secondary detail view rather than the primary recommendation artifact.

## Remaining Gaps

1. **The comparison matrix is still too abstract.**
   It still shows normalized percentages for each criterion without enough concrete evidence in the cells. This is the clearest remaining UX mismatch with the redesign goal.

2. **Platform matching still leans on capability text.**
   Keyword maps improved relevance, but long-term credibility would be stronger with explicit structured tags for integrations, compliance, implementation model, and use-case coverage.

3. **`industry` still does not influence scoring.**
   That is acceptable for now because it is optional, but if it stays in the assessment it should either influence the recommendation transparently or be removed.

4. **The weighted score still exists as a prominent number.**
   That is fine for ranking, but it should continue to be framed as secondary evidence behind the match report and memo.

5. **Developer-first platform coverage is still thin.**
   The scoring and results experience is much stronger now, but the market map still needs better representation of LangChain, n8n, CrewAI, and similar options if this is meant to read as a definitive comparison project.

6. **Human verification is still required.**
   Presentation and logic improved materially, but credibility still depends on checking real recommendation outputs against realistic scenarios and recording the outcome.

## Re-Baselined Priority

### Completed

- [x] Wire `teamTechnicalLevel` into scoring
- [x] Add usage volume input to support pricing-backed recommendations
- [x] Use real cost data in budget scoring and budget filtering
- [x] Add recommendation narrative and concrete match summaries
- [x] Add "why not" and recommendation-change explanation
- [x] Remove unused assessment-side AI follow-up flow
- [x] Add decision packet export

### Next

- [ ] Make the comparison matrix show more concrete evidence, not just percentages
- [ ] Strengthen platform metadata so matching depends less on freeform capability text
- [ ] Add more developer-first platforms
- [ ] Perform and record human verification against realistic assessment scenarios

### Later

- [ ] Decide whether `industry` should drive explicit compliance inference or be kept informational only
- [ ] Add direct sharing or email only if it improves the decision workflow rather than bloating the product

## Current Recommendation

This should no longer be treated as a redesign proposal. It is now a near-complete credibility hardening track with a smaller remaining scope:

1. Finish the matrix redesign so the detailed comparison layer matches the quality of the top-level recommendation experience.
2. Strengthen structured platform metadata to reduce remaining heuristic matching.
3. Expand developer-first platform coverage.
4. Validate the system with realistic scenarios and record the results.

That sequence keeps the project defensible to recruiters, hiring managers, and technically skeptical reviewers.

---

*Originally drafted as a proposal on 2026-03-24. Re-baselined as an implementation tracker on 2026-03-24.*
