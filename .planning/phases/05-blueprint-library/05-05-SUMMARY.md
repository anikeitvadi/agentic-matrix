---
phase: 05-blueprint-library
plan: 05
subsystem: content
completed: 2026-03-19
duration: 10min
tags: [blueprints, workflow-automation, orchestrator-pattern, ipaas, human-in-the-loop]

dependencies:
  requires:
    - "05-01-PLAN.md (Blueprint schema with useCase enum)"
    - "05-02-PLAN.md (Data extraction blueprint patterns)"
  provides:
    - "Workflow automation blueprint with orchestrator-worker pattern"
    - "Decision framework for agent vs simple automation"
    - "iPaaS vs developer-first platform guidance"
  affects:
    - "Future blueprint pages will reference workflow automation patterns"
    - "Platform comparison for workflow use cases"

tech-stack:
  added: []
  patterns:
    - "Orchestrator-worker agent architecture"
    - "Human-in-the-loop approval workflows"
    - "Confidence-based routing thresholds"

key-files:
  created:
    - path: "content/blueprints/workflow-automation.mdx"
      purpose: "Workflow automation agent implementation blueprint"
      lines: 329
  modified: []

decisions:
  - decision: "Emphasize when NOT to use agents upfront"
    rationale: "Users often over-engineer - decision framework prevents unnecessary complexity"
    alternatives: "Could focus only on agent solutions"
    tags: [user-experience, content-strategy]

  - decision: "Recommend iPaaS platforms (Tray, Workato) for structured workflows"
    rationale: "Pre-built connectors and compliance reduce implementation time"
    alternatives: "Could push developer-first for all scenarios"
    tags: [platform-recommendation, pragmatism]

  - decision: "Orchestrator-worker over multi-agent frameworks"
    rationale: "Follows Anthropic guidance - simple patterns outperform complex frameworks"
    alternatives: "Could present multi-agent coordination as viable option"
    tags: [architecture-pattern, best-practice]

  - decision: "Spell out percentages as 'percent' instead of '%' symbol"
    rationale: "MDX parser interprets '80%' as potential JavaScript property access causing build errors"
    alternatives: "Could use HTML entities or escape sequences"
    tags: [mdx-compatibility, technical-workaround]
---

# Phase 5 Plan 5: Workflow Automation Blueprint Summary

**One-liner:** Orchestrator-worker pattern blueprint for cross-system workflows with iPaaS recommendations and decision framework preventing over-automation.

## What Was Built

Created comprehensive workflow automation agent blueprint covering:

1. **Decision Framework**
   - "When NOT to Use an Agent" section upfront
   - Clear criteria: single-step → no agent, multi-system unstructured → full agent
   - Four decision categories with practical examples

2. **Orchestrator-Worker Architecture**
   - Mermaid diagram showing trigger → orchestrator → workers → approval gates → execution flow
   - Single source of truth pattern (not multi-agent negotiation)
   - Clear failure boundaries and testable components

3. **Human-in-the-Loop Patterns**
   - Confidence-based approval thresholds (< 0.85 = human approval)
   - Dollar-amount routing with escalation chains
   - Timeout handling and exception queues

4. **Platform Guidance**
   - iPaaS vs developer-first tradeoffs section
   - Tray.ai and Workato recommended for structured workflows
   - LangGraph for complex custom logic
   - Platform-specific considerations for each applicable platform

5. **Implementation Checklist**
   - Four-phase breakdown: Foundation → Build → Test → Deploy
   - Checkbox format for actionability
   - Realistic time estimates per phase

6. **Risk Mitigation**
   - Common mistakes section (over-automation, missing rollback, no audit trail)
   - Expected outcomes with realistic metrics
   - Conservative approach (10-20% manual intervention is acceptable)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] MDX parsing error with percentage symbols**
- **Found during:** Build verification after initial content creation
- **Issue:** MDX parser interpreted `80%` and `20%` as JavaScript property access (80.%, 20.%), causing "Unexpected character `2` before name" errors
- **Fix:** Replaced percentage symbols with spelled-out format: "80 percent", "60 to 80 percent", "under 2 percent"
- **Files modified:** content/blueprints/workflow-automation.mdx (lines 287, 303-315)
- **Commit:** e30b990 (included in main feature commit after fix)
- **Impact:** Blueprint now validates successfully through Velite build process

**2. [Rule 1 - Bug] Incorrect Mermaid component import path**
- **Found during:** Initial build attempt
- **Issue:** Imported from `@/components/mermaid` which doesn't exist
- **Fix:** Changed to `import Mermaid from 'mdx-mermaid'` (correct path used by other blueprints)
- **Files modified:** content/blueprints/workflow-automation.mdx (line 29)
- **Commit:** e30b990 (corrected before final commit)

**3. [Rule 2 - Missing Critical] Changed time range format in section headers**
- **Found during:** MDX error debugging
- **Issue:** Headers like `### Build (Week 2-4)` were interpreted as potential JavaScript expressions
- **Fix:** Changed to `### Build (Week 2 to 4)` to avoid dash-based ranges in headers
- **Files modified:** content/blueprints/workflow-automation.mdx (lines 246, 253, 260, 267)
- **Commit:** e30b990 (preventative fix during error resolution)

**4. [Rule 1 - Bug] Invalid TypeScript syntax in code example**
- **Found during:** Initial content creation
- **Issue:** Used Ruby-style `3.days` syntax in TypeScript code block
- **Fix:** Replaced with valid JavaScript: `new Date(invoice.dueDate.getTime() - 3 * 24 * 60 * 60 * 1000)`
- **Files modified:** content/blueprints/workflow-automation.mdx (line 148)
- **Commit:** e30b990 (corrected immediately)

## Lessons Learned

### Technical

**MDX percentage symbol parsing:**
- MDX/mdx-mermaid interprets `X%` in markdown as potential JavaScript property access
- Affects numbered percentages like `80%`, `20%`, `<2%`
- Solution: Spell out "percent" or use alternative phrasing
- Note: This only affects certain contexts - customer-support.mdx uses percentages without issues, suggesting it depends on surrounding syntax

**Code block language specifications:**
- Changed TypeScript code blocks from ```typescript to plain ``` during debugging
- Final version uses plain code fences to avoid parser ambiguity
- No syntax highlighting lost since these are pseudocode examples

**Header formatting with ranges:**
- Avoid number ranges with dashes in MDX headers: `(Week 2-4)`
- Use spelled-out format: `(Week 2 to 4)`
- Prevents potential JavaScript expression parsing

### Content Strategy

**Decision framework critical:**
- Starting with "When NOT to use an agent" prevents over-engineering
- Users need permission to choose simpler solutions
- Four-tier decision framework (single-step / single-system / structured cross-system / unstructured cross-system) provides clear guidance

**Platform recommendations require nuance:**
- Can't just say "use LangGraph" or "use Tray" - depends on team capabilities
- iPaaS vs developer-first tradeoffs section addresses real organizational constraints
- Hybrid approach (iPaaS orchestration + custom agent for decisions) often optimal

**Implementation checklist format:**
- Checkbox items more actionable than prose
- Four-phase breakdown matches PERT estimation in frontmatter
- Realistic time estimates (1-2 weeks per phase) vs overly optimistic

## Next Phase Readiness

**Dependencies satisfied:**
- Blueprint schema from 05-01 validated successfully
- Mermaid diagram rendering works (same pattern as customer-support)
- useCase enum value `workflow-automation` matches schema

**Blockers for future plans:** None

**Recommendations for next plans:**
- Remaining blueprints (knowledge-base, approval-workflows) can follow same structure
- Consider adding "When NOT to use" section to all blueprints based on positive feedback expected
- Monitor for other MDX parsing edge cases (percentages were unexpected)

## Verification Results

✓ content/blueprints/workflow-automation.mdx created (329 lines)
✓ Frontmatter validates against Blueprint schema
✓ `npm run build` passes after clean build
✓ Velite processes blueprint into .velite/blueprints.json
✓ useCase: workflow-automation appears in blueprints collection
✓ Mermaid diagram renders (orchestrator-worker pattern with 15 nodes)
✓ All must_haves satisfied:
  - Orchestrator pattern diagram included
  - "When NOT to use agents" section prominent
  - Approval workflows and human-in-the-loop patterns covered
  - iPaaS vs developer-first tradeoffs addressed

## Stats

**Files changed:** 1 created
**Lines added:** 329
**Commits:** 1 (e30b990)
**Build time:** ~5 seconds after clean
**Debug time:** ~8 minutes (MDX parsing issue resolution)
**Content sections:** 11 major sections
  - Overview
  - When NOT to Use an Agent
  - When Agents Add Value
  - Architecture Pattern: Orchestrator-Worker
  - Human-in-the-Loop Patterns
  - iPaaS vs Developer-First Tradeoffs
  - Platform-Specific Considerations
  - Implementation Checklist
  - Common Mistakes
  - Expected Outcomes
  - Next Steps

**Platform coverage:** 6 applicable platforms (anthropic-claude, openai-frontier, tray-ai, workato, microsoft-copilot-studio, langchain-langgraph)
**Recommended platforms:** 2 (tray-ai, workato)

## Archive Notes

This blueprint represents the third blueprint in the library. Key differentiators from customer-support and data-extraction:
- More emphasis on decision framework (when NOT to use agents)
- Stronger platform recommendations (iPaaS for structured workflows)
- Explicit orchestrator-worker architecture (vs implied in other blueprints)
- More conservative metrics (10-20% manual intervention expected)

The MDX percentage parsing issue (fixed in this plan) may affect future content - document for reference in content creation guidelines.
