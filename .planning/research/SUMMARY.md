# Project Research Summary

**Project:** Enterprise Agent Decision Toolkit
**Domain:** Vendor Comparison & Decision Support Tool
**Researched:** 2026-02-05
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a vendor-neutral "Wirecutter for enterprise AI agent deployment"—an interactive web assessment tool helping enterprise buyers evaluate 10-12 rapidly evolving agent platforms. Based on research across four dimensions (stack, features, architecture, pitfalls), the recommended approach is to build a lightweight, maintainable decision support system optimized for solo developer sustainability in a fast-moving domain.

The winning strategy prioritizes **content accuracy over feature sophistication** and **transparency over algorithmic complexity**. Use Next.js 16 + TypeScript + Tailwind for rapid deployment, start with 5 platforms (not 12) to establish sustainable maintenance cadence, and build with structured data from day one to enable surgical updates. The core value proposition is vendor neutrality—this must be protected religiously through an explicit editorial independence policy, as bias erosion is the fastest path to failure.

Critical risks center on **data staleness** (platforms change weekly, outdated content kills credibility), **maintenance burden** (solo developers underestimate ongoing effort by 3-5x), and **bias erosion** (revenue pressure compromises neutrality). Mitigation requires building timestamps and update workflows into the foundation, starting small and expanding only when maintenance is proven sustainable, and establishing monetization models that preserve editorial independence.

## Key Findings

### Recommended Stack

Next.js 16 with TypeScript provides the optimal foundation for rapid deployment and long-term maintainability. The stack prioritizes solo developer velocity through minimal complexity (Zustand over Redux, shadcn/ui components over building from scratch) and cost efficiency (Vercel Hobby tier + Neon free tier support MVP through early production).

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework with built-in routing, SSR/SSG, and API routes—deploy to Vercel with git push
- **TypeScript 5.9+**: Type safety throughout catches bugs at compile time, critical for solo developers without code review
- **Tailwind CSS v4 + shadcn/ui**: Utility-first styling with copy/paste component library—you own the code, rapid customization
- **Zustand**: Lightweight state management (2KB) with zero boilerplate for assessment form state
- **Prisma + PostgreSQL (Neon)**: Type-safe ORM with serverless Postgres when user accounts/saved assessments are needed
- **React Hook Form + Zod**: Form state and validation for multi-step questionnaire with TypeScript integration
- **MDX + Contentlayer**: Content-as-code for platform profiles—version controlled, no CMS to maintain initially
- **Recharts**: Declarative React charting for cost comparisons and capability visualizations
- **Vitest + Playwright**: Fast testing for calculation logic and critical user flows

**Critical version requirements:**
- Next.js 16.x is LTS through 2027, providing stability
- Tailwind v4's Oxide engine provides 100x faster builds (instant feedback during development)
- Neon acquisition by Databricks (May 2025) introduces some roadmap uncertainty, but Postgres compatibility enables easy migration

**Cost projection:** $1/month (MVP) → $21/month (100-1K users) → $69/month (1K-10K users). Stack supports growth without re-architecture.

### Expected Features

Research across decision support tools, vendor comparison platforms, and assessment frameworks reveals clear table stakes versus differentiators.

**Must have (table stakes):**
- **Interactive questionnaire** (10-15 questions max) — every decision tool starts with guided intake, users expect save/resume capability
- **Weighted scoring system** — objective comparison beyond feature lists, users need to understand methodology
- **Comparison matrix** — side-by-side vendor view is standard format since 2020s, visual indicators essential
- **Basic ROI calculator** — enterprise tools require business case justification, payback period calculation non-negotiable
- **Export to PDF** — stakeholder buy-in requires sharing, reports must leave the tool
- **Mobile responsive** — 2026 expectation for any web app, decision-makers use tablets

**Should have (competitive differentiators):**
- **Pre-populated platform data** — eliminates research burden, users trust curated current data (but HIGH maintenance)
- **Implementation blueprint library** — bridges "which platform" to "how to build", accelerates post-selection value
- **Dynamic decision tree with branching** — personalizes journey based on responses, feels consultative vs transactional
- **Contextual help & guidance** — reduces learning curve through in-app expertise vs separate documentation
- **Audit trail & decision history** — critical for enterprise governance ("Why did we choose this 6 months ago?")

**Defer (v2+):**
- **Scenario planning** — "what-if analysis" requires mature platform data, can manually explore alternatives in v1
- **Architecture diagram generator** — high complexity, lower initial adoption, static blueprints sufficient for MVP
- **Collaborative assessment** — multi-user adds significant complexity, can share exports initially
- **Procurement integration** — enterprise sales feature, not required for product validation
- **Benchmark data** — requires partnerships and significant data collection, start with qualitative guidance

### Architecture Approach

The recommended architecture follows **modular, separation-of-concerns** principles combining frontend SPA, RESTful API layer, structured content model, and isolated calculation engines.

**Major components:**

1. **Questionnaire Flow Engine** — manages multi-step form with conditional branching using state machine pattern, validates user input, determines next step based on responses

2. **Recommendation Engine** — applies transparent rule-based scoring (not black-box ML) to match platforms against requirements, returns ranked results with explainable score breakdowns

3. **Cost Calculator** — computes pricing estimates from platform tiers and usage parameters, calculates TCO projections, critical to run server-side to protect pricing logic

4. **Platform Data Model** — structured JSON/TypeScript schemas storing platform capabilities, pricing, pros/cons with Zod validation ensuring data quality

5. **Blueprint Content Model** — MDX-based use case templates and architecture patterns, enables version control and surgical updates

6. **API Gateway (BFF)** — backend-for-frontend layer that orchestrates engines, formats responses for UI needs, validates requests at boundaries

**Key architectural patterns:**
- **State machine for questionnaire** — prevents spaghetti conditional logic, enables visualization of user paths
- **Rule-based transparent scoring** — explainable recommendations build trust vs black-box algorithms
- **Template + customization for diagrams** — SVG templates with variable substitution, fast rendering without AI inference
- **Single source of truth** — each fact in ONE place, referenced elsewhere, enables surgical updates
- **Structured data with schema validation** — Zod schemas catch invalid data at entry points, self-documenting

**Anti-patterns to avoid:**
- Tight coupling between recommendation logic and UI (isolate as pure functions/services)
- Storing platform data in component code (requires deployment to update pricing)
- Monolithic "calculate everything" function (separate concerns for testability)
- Client-side cost calculation with exposed pricing (security and competitive risk)
- No validation between layers (causes runtime errors far from source)

### Critical Pitfalls

Research across comparison platforms and decision support tools reveals domain-specific failure modes.

1. **Data Staleness in Rapidly Evolving Markets** — Platform capabilities change faster than content updates. OpenAI launched Frontier on Feb 5, 2026—if comparison content still reflects pre-Frontier capabilities, readers immediately lose trust. 92% of SaaS companies have AI features in product/roadmap, meaning monthly capability shifts. **Prevention:** Build "Last verified: [date]" timestamps into every platform claim from day one, establish weekly changelog monitoring ritual, start with 5 platforms updated frequently vs 12 updated quarterly.

2. **Bias Erosion (The Affiliate Revenue Trap)** — You start vendor-neutral but revenue pressure gradually compromises it. Affiliate links create subconscious bias, vendors offer "partnerships," you notice one converts better so unconsciously favor it. Within 6 months you're G2/Capterra—pay-to-play with credibility theater. **Prevention:** Publish explicit "Editorial Independence Policy" upfront (commit: no vendor payment for placement/ratings, no sponsored content), choose monetization models that preserve neutrality (subscriptions/memberships vs vendor sponsorships), establish separation between editorial and business decisions even as solo developer.

3. **Underestimating Content Maintenance Burden** — You launch with comprehensive coverage of 12 platforms, beautiful comparison matrices, detailed guides. Reality: each platform needs 1-2 hours/week monitoring + quarterly deep review (2-4 hours). 12 platforms = 12-24 hours/week maintenance minimum before creating anything new. Within 3 months, 40% of content is stale and you're drowning in maintenance debt. **Prevention:** Start with 5 platforms maximum, design for maintainability with structured data and component-based content, implement confidence levels (HIGH/MEDIUM/LOW based on verification recency), track actual maintenance hours to validate sustainability before expanding.

4. **Over-Engineering the Recommendation Algorithm** — You build sophisticated ML-powered recommendation engine. Users find it confusing, don't trust the "black box," abandon the tool. Meanwhile simple decision tree would work better. You spent 3 months building complexity that reduces rather than increases user confidence. **Prevention:** Start with transparent comparison matrices and simple decision trees, optimize for explainability over sophistication ("We recommend X because: [clear reason]"), recognize enterprise decisions are committee-based—users need to defend choices to stakeholders, add algorithmic recommendations only if users explicitly request them.

5. **Wrong Mental Model for User Needs** — You build for individual developers evaluating platforms, but actual users are enterprise architects needing to justify decisions to procurement. Content doesn't address real decision factors (security compliance, vendor stability, support SLAs, TCO). Buyers can't use your content in their buying process. **Prevention:** Define actual user personas before building (solo developer vs enterprise architect vs procurement officer have different needs), interview real enterprise buyers about their evaluation process, provide decision support materials that can be shared in slide decks, address that 60% of enterprise software projects fail to meet objectives due to poor initial selection.

## Implications for Roadmap

Based on combined research, the optimal phase structure balances rapid value delivery with sustainable foundation-building. The sequencing avoids the critical pitfalls while establishing data architecture and maintenance workflows from day one.

### Phase 1: Foundation & Core Decision Flow (Weeks 1-4)

**Rationale:** Establish maintainable data foundation and basic decision support before adding sophistication. Start with 5 platforms (not 12) to prove sustainable update cadence. This phase delivers complete end-to-end workflow while building anti-staleness infrastructure.

**Delivers:**
- TypeScript schemas for Platform and Blueprint data models
- Platform data library for 5 core platforms (OpenAI, Anthropic, AWS Bedrock, Azure AI, Google Vertex)
- Basic questionnaire (10-12 essential questions: use case, scale, constraints, budget)
- Simple comparison matrix with filtering
- Transparent scoring system (5-7 weighted criteria)
- Timestamp and confidence level system ("Last verified" dates on all platform claims)
- Editorial Independence Policy published
- Changelog monitoring workflow established

**Addresses features:**
- Interactive questionnaire (table stakes)
- Comparison matrix (table stakes)
- Weighted scoring (table stakes)
- Pre-populated platform data (differentiator, but only 5 platforms)

**Avoids pitfalls:**
- Data staleness: Timestamps and monitoring workflow built from day one
- Maintenance burden: Starting with 5 platforms, tracking actual maintenance hours
- Bias erosion: Editorial policy published before monetization pressure exists
- Over-engineering: Simple comparison matrix and transparent scoring, no ML

**Stack elements:** Next.js 16 + TypeScript, Zustand for state, Tailwind + shadcn/ui for UI, MDX for platform content

### Phase 2: Calculations & Export (Weeks 5-6)

**Rationale:** Add business justification tools (ROI calculator) and sharing capability (PDF export) to make the tool useful for enterprise buying committees. These enhance existing flow without changing core workflow.

**Delivers:**
- Basic ROI calculator (cost inputs, benefit inputs, payback period)
- Cost comparison across recommended platforms
- Export to PDF functionality
- Results dashboard displaying recommendations with justification

**Addresses features:**
- Basic ROI calculator (table stakes)
- Export to PDF (table stakes)

**Implements architecture:**
- Cost Calculator component (server-side to protect pricing logic)
- API Gateway layer orchestrating recommendation + cost calculation
- Results Dashboard UI

**Stack elements:** React Hook Form + Zod for calculator inputs, server-side API routes for calculations

### Phase 3: Blueprint Library & Guidance (Weeks 7-10)

**Rationale:** Differentiate beyond basic comparison by bridging from "which platform" to "how to implement." Implementation blueprints for top 3 use cases provide concrete post-decision value.

**Delivers:**
- Use case templates (3-5 common scenarios: customer support, data extraction, workflow automation)
- Implementation blueprint library (architecture templates for top 3 use cases x 5 platforms = 15 blueprints)
- Contextual help and guidance throughout questionnaire
- Decision history and audit trail

**Addresses features:**
- Implementation blueprint library (differentiator)
- Contextual help & guidance (differentiator)
- Audit trail & decision history (differentiator)

**Implements architecture:**
- Blueprint Content Model
- Template-based diagram generation (SVG with variable substitution)

**Stack elements:** MDX for blueprint content, Contentlayer for type-safe content

### Phase 4: Intelligence & Refinement (Weeks 11-14)

**Rationale:** Add dynamic decision tree with branching logic to personalize the assessment journey. Only after core value is proven and maintenance cadence is sustainable do we expand platform coverage (5 → 8-10 platforms) and add sophistication.

**Delivers:**
- Dynamic decision tree with conditional branching
- Recommendation engine with explainable scoring
- Expansion to 8-10 platforms (only if Phase 1-3 maintenance is sustainable)
- Mobile experience optimization
- Accessibility improvements

**Addresses features:**
- Dynamic decision tree with branching (differentiator)
- Mobile responsive (table stakes, enhanced)

**Implements architecture:**
- Questionnaire Flow Engine with state machine pattern
- Recommendation Engine as isolated service

**Stack elements:** State machine library for flow logic, Vitest for recommendation engine testing

### Phase Ordering Rationale

**Dependencies drive sequencing:**
- Platform Data Model must exist before Recommendation Engine (Phase 1 → 2)
- Cost Calculator requires pricing data from Platform Model (Phase 1 → 2)
- Blueprint Library needs Platform coverage and Use Case taxonomy (Phase 1-2 → 3)
- Decision tree branching builds on basic questionnaire (Phase 1 → 4)

**Risk mitigation drives sequencing:**
- Timestamp and monitoring systems in Phase 1 prevent data staleness from becoming endemic
- Editorial policy in Phase 1 prevents bias erosion before revenue pressure exists
- Starting with 5 platforms in Phase 1 prevents maintenance burden from becoming overwhelming
- Simple comparison in Phase 1-2 prevents over-engineering recommendation algorithm

**Value delivery drives sequencing:**
- Phase 1 delivers complete decision workflow (questionnaire → comparison → recommendation)
- Phase 2 adds stakeholder sharing (PDF) and business justification (ROI)
- Phase 3 adds post-decision value (implementation guidance)
- Phase 4 adds sophistication only after core value is proven

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 3 (Blueprint Library):** Implementation blueprints for enterprise AI agent deployment are not well-documented in standardized format. Will need `/gsd:research-phase` to investigate architecture patterns for each use case type (customer support agents, data extraction workflows, autonomous decision agents). Sparse documentation on agent-specific patterns vs general application architecture.

- **Phase 4 (Recommendation Engine):** While rule-based scoring is well-understood, the specific evaluation criteria for AI agent platforms are still emerging. May need research into how enterprises actually evaluate agentic systems (beyond traditional software selection criteria). Non-deterministic nature of AI agents complicates benchmarking and comparison.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Multi-step forms with conditional logic are well-documented. Next.js + TypeScript + Zustand patterns are established. Comparison matrix UI is standard pattern with abundant examples.

- **Phase 2 (Calculations & Export):** ROI calculators and PDF generation are solved problems with clear implementation paths. Server-side calculation patterns in Next.js API routes are well-documented.

### Feature Prioritization for Each Phase

**Defer to post-MVP (after Phase 4):**
- Scenario planning / what-if analysis (requires mature platform data and usage patterns)
- Architecture diagram generator with AI (high complexity, static blueprints sufficient initially)
- Collaborative assessment with multi-user (adds significant complexity, single-user + sharing covers 80% of use cases)
- Procurement system integration (enterprise sales feature, not needed for validation)
- Benchmark data & industry standards (requires external partnerships, start with qualitative guidance)

**Parallel workstreams:**
- Platform content research can proceed in parallel with Phase 1-2 development (content vs code)
- Use case blueprint research can proceed in parallel with Phase 2 development
- Additional platform expansion research can proceed in parallel with Phase 3-4 (preparing for Phase 5+)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 16 + TypeScript + Tailwind is well-documented 2026 standard for solo developers. Vercel pricing verified from official 2026 pricing page. Neon acquisition introduces MEDIUM uncertainty on database roadmap, but Postgres compatibility provides exit. |
| Features | MEDIUM | Strong signal on table stakes (comparison matrices, ROI calculators, export are standard). Differentiator features (blueprints, contextual guidance) based on adjacent markets (decision support tools, vendor comparison platforms) with reasonable extrapolation to AI agent domain. |
| Architecture | MEDIUM-HIGH | Modular architecture with separation of concerns is established pattern for decision support systems. Rule-based recommendation engines well-documented. Specific implementation of blueprint generation less documented but manageable with template approach. |
| Pitfalls | HIGH | Data staleness and bias erosion are well-documented failure modes in comparison/review platforms. Maintenance burden validated through content platform research. Over-engineering and wrong persona risks common in B2B SaaS. AI agent market velocity (92% of SaaS adding AI features) is verified. |

**Overall confidence:** MEDIUM-HIGH

Research provides strong foundation for technology choices and architectural approach. Feature prioritization is well-informed by adjacent markets. Pitfall prevention strategies are evidence-based. Primary uncertainty is in the evolving AI agent ecosystem itself—platform capabilities and evaluation criteria are still being established.

### Gaps to Address

**Gap: AI agent-specific evaluation criteria**
Research covers general enterprise software evaluation, but AI agents introduce unique considerations (non-determinism, prompt engineering requirements, hallucination rates, context window management). These criteria are emerging, not standardized.

**How to handle:** Phase 1 should establish framework for evaluation criteria that can evolve. Include "Confidence Level" system not just for timestamps but for evaluation criteria maturity. Plan for Phase 3 research into agent-specific architecture patterns.

**Gap: Sustainable platform coverage expansion strategy**
Research emphasizes starting with 5 platforms, but pathway from 5 → 10 → 12+ is not fully specified. When is maintenance proven sustainable? What metrics indicate readiness to expand?

**How to handle:** Phase 1-2 should establish maintenance hour tracking. Set explicit gate: "Expand platform coverage only when average maintenance hours/platform/week are < 1.5 hours for 8 consecutive weeks." Consider tiered coverage model (Tier 1: full analysis, Tier 2: basic listing).

**Gap: Monetization model selection and implementation**
Research identifies safe vs risky monetization models (subscriptions safe, vendor sponsorships dangerous) but doesn't specify which to implement or when.

**How to handle:** Address in requirements definition phase, not roadmap. Options: (1) Free + sponsorless ads, (2) Freemium with premium features, (3) Consulting/advisory separate from tool. Decision depends on business model goals not captured in technical research.

**Gap: Content update automation opportunities**
Research emphasizes maintenance burden but doesn't deeply explore automation possibilities (vendor API integrations, changelog scrapers, automated verification).

**How to handle:** Phase 2-3 could include research spike on vendor API availability. Some platforms (OpenAI, Anthropic, AWS) have APIs exposing capabilities and pricing. Phase 4+ might benefit from automated data ingestion where available.

**Gap: Competitive landscape analysis**
Research focuses on domain patterns and pitfalls but doesn't analyze existing competitors in "AI agent platform comparison" space specifically.

**How to handle:** Requirements phase should include competitive analysis. Who else is comparing agent platforms? What's their approach? Where are gaps? This informs positioning and feature prioritization beyond generic decision support tool research.

## Sources

### Primary (HIGH confidence)

**Technology Stack:**
- [Next.js 16 Official Docs](https://nextjs.org/blog/next-15-5) — Next.js releases and capabilities
- [Vercel Pricing 2026](https://vercel.com/pricing) — Official pricing verification
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) — v4 performance improvements
- [TypeScript 5.9 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — TypeScript capabilities
- [Prisma Next.js Guide](https://www.prisma.io/docs/guides/nextjs) — Official integration patterns

**Architecture Patterns:**
- [Decision Support Systems: Technical Architecture](https://www.oreateai.com/blog/decision-support-systems-technical-architecture-and-application-practices-for-datadriven-decision-making/009862aea8296296224187fa9210bf64ec7) — DSS architecture patterns
- [Modern Web Application Architecture 2026](https://quokkalabs.com/blog/modern-web-application-architecture/) — Current architecture trends
- [Backend-for-Frontend Pattern - Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends) — BFF pattern documentation
- [Common Web Application Architectures - Microsoft](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures) — Separation of concerns

### Secondary (MEDIUM confidence)

**Feature Research:**
- [24 Best Decision Support Software for 2026 | Appvizer](https://www.appvizer.com/analytics/decision-support) — Decision support tool survey
- [Best Decision Intelligence Platforms Reviews 2026 | Gartner Peer Insights](https://www.gartner.com/reviews/market/decision-intelligence-platforms) — Enterprise DI platform features
- [Best Vendor Management Software 2026](https://www.gatekeeperhq.com/blog/best-vendor-management-software) — Vendor comparison platform patterns
- [How to Create a Vendor Selection Matrix](https://www.cognism.com/blog/vendor-selection-matrix) — Evaluation framework patterns
- [ROI Calculator 2026: Proving AI Video Tool Investment to Your CFO](https://joyspace.ai/roi-calculator-ai-video-tools-cfo-2026/) — ROI calculator patterns

**Pitfalls Research:**
- [SaaS Trends Shaping Business Software in 2026](https://comparecamp.com/saas-trends-shaping-business-software-in-2026-what-teams-should-prepare-for/) — 92% of SaaS adding AI features
- [Black Book Market Research Vendor Neutrality Policy](https://blackbookmarketresearch.com/mission-statement-and-policy-on-vendor-neutrality) — Editorial independence model
- [G2 acquiring Capterra gatekeeping concerns](https://thenextweb.com/news/is-g2-becoming-too-powerful-for-the-software-market) — Review platform consolidation
- [Google's December 2024 Core Update](https://dev.to/synergistdigitalmedia/googles-december-2024-core-update-hit-e-commerce-hard-heres-what-actually-changed-533b) — Content freshness importance
- [Feature bloat statistics](https://hellopm.co/what-is-feature-bloat/) — 45-80% features rarely/never used
- [Enterprise software evaluation mistakes](https://fileproinfo.com/blog/top-5-mistakes-companies-make-with-enterprise-software/2026/) — 60% project failure rate

**Ecosystem Data:**
- React usage: 91% among frontend frameworks (State of JS survey)
- shadcn/ui: 104K GitHub stars (as of Jan 2026)
- Recharts: 1M+ weekly downloads (npm)
- TypeScript adoption: 83% of new projects (GitHub data)
- Consumer expectations: 83% believe reviews only valuable if recent (DemandSage)

### Tertiary (LOW confidence, needs validation)

**AI Agent Platforms:**
- [OpenAI Frontier launch](https://openai.com/index/introducing-openai-frontier/) — Announced Feb 5, 2026, full capabilities still emerging
- [The Best AI Agents in 2026: Tools, Frameworks, and Platforms Compared](https://www.datacamp.com/blog/best-ai-agents) — Platform survey, rapidly outdating
- [Compare 50+ AI Agent Tools in 2026](https://research.aimultiple.com/ai-agent-tools/) — Broad survey but depth varies

**Implementation Patterns:**
- [AI Architecture Diagram Generator](https://www.eraser.io/ai/architecture-diagram-generator) — Emerging tool category, patterns not standardized
- [Top 13 Enterprise Agent Builder Platforms for 2026](https://www.vellum.ai/blog/top-13-ai-agent-builder-platforms-for-enterprises) — Vendor-provided analysis, potential bias

---
*Research completed: 2026-02-05*
*Ready for roadmap: yes*
*Ready for requirements: yes*
