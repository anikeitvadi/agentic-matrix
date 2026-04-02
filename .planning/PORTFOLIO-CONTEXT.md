# Portfolio Project Context

## Goal
Make this Anikeit's **premier portfolio project** — the one that makes a hiring manager stop scrolling. Not a toy demo. A production-grade tool that demonstrates mastery across the full stack while showing deep understanding of the agentic AI space.

**The bar:** An engineering manager should look at this and think "this person understands AI agents at a systems level, builds polished products, and ships."

## What This Is
"Wirecutter for enterprise AI agent deployment." A vendor-neutral web app where IT leaders input their situation (cloud stack, compliance needs, budget, use cases, team skill level) and get honest, concrete platform recommendations with cost projections and implementation blueprints.

## What This Should Demonstrate to Employers

### 1. Deep Understanding of Agentic AI (not just API wrappers)
- **Decision framework** that captures the real complexity: when to use agents vs simple automation, which architectures fit which problems, how tool design affects agent reliability
- **Platform analysis** that shows genuine understanding of the landscape: MCP vs function calling, orchestrator-worker patterns, human-in-the-loop design, guardrails/safety
- **Blueprints** that demonstrate practitioner knowledge: architecture diagrams, implementation checklists, platform-specific gotchas, confidence thresholds, escalation patterns
- **The assessment itself** should show understanding of what actually matters in platform selection (not just feature checkboxes — compliance, integration topology, team capability, total cost)

### 2. UI/UX Design
- Clean, professional design system (not a Bootstrap template)
- Interactive assessment with smart form UX (multi-step, validation, persistence, conditional fields)
- Data visualization that tells a story (cost charts, scoring breakdowns, comparison matrices)
- Responsive design that works on mobile
- Thoughtful information architecture (landing → assessment → results → blueprints flow)
- Accessibility and error states

### 3. Backend / Business Logic Design
- Scoring algorithm with transparent methodology (not a black box)
- Cost modeling with real pricing data, PERT engineering estimates, TCO projections
- Content system that separates data from presentation (Velite MDX with structured frontmatter)
- Zod schema validation at every boundary
- Server Actions for AI integration

### 4. API / Integration Design
- AI SDK integration with structured outputs (Zod schema → OpenAI generateObject)
- Graceful degradation when AI is unavailable
- Content pipeline: MDX → Velite → TypeScript types → React components
- Clean separation of concerns: scoring engine, cost calculator, weight derivation, normalization — all independently testable

### 5. Engineering Quality
- 72+ tests with TDD approach on critical business logic
- TypeScript strict mode throughout
- Clean git history with atomic commits
- No hardcoded magic — everything is configurable/extensible
- Performance: static generation where possible, client components only where needed

### 6. Product Thinking
- Solves a real problem (vendor-neutral AI platform guidance doesn't exist)
- Positions Anikeit's domain expertise (integration consulting, hands-on AI building)
- Has a point of view: vendor neutrality as core differentiator
- Editorial policy page shows integrity

## Why It Matters (Portfolio Positioning)
- Demonstrates full-stack engineering: Next.js 15, TypeScript, Tailwind v4, Zod, Velite MDX, Recharts, AI SDK
- Demonstrates product thinking: not just code, but a real decision framework with business logic
- Demonstrates domain expertise: Anikeit's integration consulting background (Boomi, Celigo) gives practitioner credibility
- Fills a real market gap: no vendor-neutral, practitioner-grade decision toolkit exists

## Tech Stack
- Next.js 15 (App Router, Server Components, Server Actions)
- TypeScript with strict mode
- Tailwind CSS v4 with @tailwindcss/typography
- Velite for MDX content compilation
- Zod schema validation throughout
- React Hook Form with per-step validation
- Recharts for cost visualization
- Vercel AI SDK + OpenAI for optional results-side AI decision brief
- Vitest for testing (88 tests passing)

---

## Current State (2026-03-24)

### What's Done & Working
- **19 platforms** with structured pricing, capabilities, and source links
- **3 implementation blueprints** (customer support, data extraction, workflow automation) with MDX rendering
- **4-step assessment** with Zod validation, localStorage persistence, and structured inputs that feed scoring
- **Results page** with recommendations, comparison matrix, audit trail, decision memo, optional AI brief, and export packet
- **TCO cost calculator** with PERT engineering estimates and Recharts visualizations
- **Landing page** with hero, value props, how-it-works
- **Mobile responsive** sidebar with hamburger menu
- **Error/loading/404 pages**, OG meta tags for LinkedIn
- **Light theme consistency** across all pages
- **Editorial policy** page (vendor-neutral positioning)

### What's Broken (Critical)

#### The Scoring Engine Produces Meaningless Numbers
This is the #1 problem. The SAW scoring algorithm looks sophisticated but the results don't hold up:

**Symptoms:**
- All platforms score between 38-58 out of 100 (no differentiation)
- Integration and Features show 50% for every platform when no specific needs are given
- IBM/Microsoft always win regardless of user input because they have the most capability tags
- Budget scoring uses tier-based guesses ($50K for enterprise) instead of actual pricing data
- Compliance scoring is based on tier label, not actual certifications (partially fixed)

**Root causes:**
1. When the user hasn't specified integrations or use cases (which is most of the time), 40% of the score (Integration + Features) is flat neutral for everyone
2. Min-max normalization means the best platform always gets 100% and worst gets 0% — adding/removing one platform changes all scores
3. String matching "customer-support" against capabilities like "Native CRM data access" produces near-zero matches
4. The scoring engine and cost calculator use completely different data sources for budget (tier proxies vs real pricing)
5. `teamTechnicalLevel` is collected but never used in scoring

**Impact:** A recruiter/engineer trying the tool sees clustered scores with abstract percentages and no clear rationale. It undermines the entire "transparent scoring" narrative.

#### Platform Coverage Gap
- **0 developer-first platforms** (LangChain, n8n, CrewAI are referenced in the scoring logic and test mocks but no actual content exists)
- This means the scoring engine's developer-first tier handling is untested in production
- Anyone evaluating open-source options gets zero recommendations

#### Pricing Data Issues (partially fixed)
- Salesforce at $2/conversation scales to $240K+/year at 20K conversations (reduced to $1, still expensive)
- SAP Joule shows $0/year because the free tier is selected but requires $200-500/user/month SAP Cloud subscription
- User-based platforms (ServiceNow, IBM) had per-user pricing with 1 user assumed (fixed to realistic enterprise user counts)

### What's Missing for Portfolio Readiness
- [ ] **README** — doesn't exist, first thing anyone sees on GitHub
- [ ] **Live demo** — not deployed to Vercel yet
- [ ] **Screenshots** — no visual documentation
- [ ] **Developer-first platforms** — empty tier is a credibility gap

---

## Proposed Redesign: Scoring & Results

### The Core Insight
The problem isn't the algorithm — it's that abstract scores don't help anyone decide. The results should show **concrete matches and mismatches**, not opaque percentages.

### Three Approaches

**Approach 1: Concrete Attribute Matching (simplest, most honest)**
- For each platform, check: Does it meet this user's compliance needs? Is it within budget? Does it integrate with their cloud? Does it fit their team's skill level?
- Show results as match reports: "4 of 5 requirements met" with green/red per requirement
- Estimated annual cost from real pricing data
- One-line rationale: "Strong compliance match but requires engineering team"

Example card:
```
#1 Amazon Bedrock Agents — 4/5 matches
✅ HIPAA eligible    ✅ SOC2 compliant
✅ AWS-native        ✅ ~$3,200/yr at your usage
❌ Requires engineering team (you said: non-technical)
```

**Approach 2: Improved SAW (keep current architecture, fix inputs)**
- Replace tier proxies with real pricing data in budget scoring
- Build explicit mappings from assessment fields to platform capabilities
- Show concrete data alongside percentages: "Budget Fit: 75% ($3,200/yr)"
- Add recommendation narrative

**Approach 3: Hybrid (recommended for portfolio)**
- Primary view: match report with concrete facts (Approach 1)
- Secondary view: weighted comparison matrix with improved data (Approach 2)
- Best of both: intuitive for casual users, detailed for analysts

### Assessment Improvements Needed
1. Add usage volume question (needed for real cost calculation)
2. Wire `teamTechnicalLevel` into recommendations (non-technical → low-code platforms)
3. Convert `industry` from freetext to dropdown (enables compliance inference)
4. Keep AI as an explanation layer, not a ranking input
5. Build explicit field-to-capability mappings instead of string matching

---

## What Would Make This Exceptional

### Things that would make an employer say "wow"

1. **The recommendation actually works.** Someone fills out the assessment, gets a recommendation, and it makes sense. The rationale is clear. The cost projection is realistic. The blueprint shows them how to implement it. End-to-end value.

2. **The AI integration is thoughtful, not gimmicky.** The AI brief is explicitly bounded to explaining deterministic results, not overriding them. The AI adds value by turning the recommendation into a stakeholder-ready artifact rather than pretending to be the ranking engine.

3. **The scoring is explainable.** Every recommendation can be traced back to specific user inputs and platform attributes. No black box. Click on any score and see exactly why.

4. **The data is credible.** Real pricing (with sources), real compliance certifications, real capability descriptions. Not marketing copy. The editorial policy page and "last verified" dates show commitment to accuracy.

5. **The code is clean enough to hire from.** Someone could read `score-platform.ts` and understand the algorithm. The test suite covers edge cases. The types are strict. The components are composable.

6. **It works on mobile.** A hiring manager opens it on their phone from LinkedIn. It works.

### Gaps that would make an employer hesitate

1. **No developer-first platforms** — shows incomplete domain coverage
2. **Scoring feels random** — undermines the "transparent methodology" narrative
3. **No README** — first thing seen on GitHub, currently missing
4. **No live demo** — requires cloning to evaluate
5. **Platform matching still leans on capability text** — some recommendation logic is more heuristic than it should be
6. **No API layer** — everything is client-side; no demonstration of API design
7. **No export/sharing** — users can't take results with them

---

## Open Questions (Need Input)

1. **Which scoring approach?** Concrete matching (simple, honest) vs improved SAW (more sophisticated) vs hybrid (both)?
2. **Should we add an API layer?** Even a simple `/api/score` endpoint would demonstrate API design. Could enable sharing results via URL.
3. **Developer-first platforms — which ones?** LangChain/LangGraph, n8n, CrewAI are candidates. Need 2-3 minimum.
4. **How to make the AI integration more impressive?** Options: use AI to generate the recommendation narrative, use AI to explain scoring rationale, use AI to suggest follow-up actions.
5. **Export features — worth the effort?** PDF export of results would demonstrate server-side rendering. URL-based sharing would demonstrate API design.
6. **What's the deployment timeline?** What's the minimum viable version to publish?

---

## Key Files
| File | Purpose |
|------|---------|
| `lib/scoring/score-platform.ts` | Main scoring algorithm (SAW) |
| `lib/scoring/weights.ts` | Weight derivation from assessment |
| `lib/cost/tco-calculator.ts` | TCO cost calculation |
| `app/assessment/results/components/ResultsContent.tsx` | Results page orchestrator |
| `app/assessment/results/components/PlatformScores.tsx` | Recommendation cards |
| `app/assessment/results/components/ComparisonMatrix.tsx` | Comparison table |
| `app/assessment/schemas/step-schemas.ts` | Assessment field definitions |
| `content/platforms/*.mdx` | Platform data (pricing, capabilities) |
| `.planning/REDESIGN-SCORING-RESULTS.md` | Detailed technical redesign proposal |

---

*Last updated: 2026-03-24*
