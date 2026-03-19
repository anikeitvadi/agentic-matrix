---
phase: 05-blueprint-library
plan: 04
subsystem: content
tags: [mdx, velite, mermaid, blueprints, data-extraction, zod, validation]

# Dependency graph
requires:
  - phase: 05-01
    provides: Blueprint schema with Velite collection and mdx-mermaid integration
  - phase: 05-02
    provides: Customer support blueprint as reference pattern
provides:
  - Data extraction agent blueprint with validation-first architecture
  - Sequence diagram showing document flow with human review branch
  - OCR pipeline patterns for scanned documents
  - Multi-page document handling guidance
  - Confidence scoring patterns for extraction quality
affects: [05-05, 05-06, 05-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Validation-first extraction (Zod schemas before extraction logic)
    - Confidence scoring per field (0-1 scale with review thresholds)
    - Multi-stage validation (format → business rules → human review)
    - Batch processing architecture (queue-based for high volume)

key-files:
  created:
    - content/blueprints/data-extraction.mdx
  modified: []

key-decisions:
  - "Less than symbol causes MDX parse error (must write 'Less than 20%' not '<20%')"
  - "Validation-first approach emphasizes Zod schemas before extraction"
  - "Confidence thresholds: 0.9+ auto-approve, 0.7-0.9 flag for spot-check, <0.7 human review"
  - "Platform recommendations: Anthropic Claude and Amazon Bedrock for vision + document analysis"

patterns-established:
  - "Field-level confidence tracking with ExtractedField<T> type pattern"
  - "Business rule validation beyond format checks (totals match, dates logical)"
  - "Hierarchical schemas for multi-page documents (metadata + line items array)"
  - "OCR quality checks before extraction (confidence per word, preprocessing)"

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 5 Plan 4: Data Extraction Agent Blueprint Summary

**Validation-first data extraction blueprint with Mermaid sequence diagram, confidence scoring patterns, and OCR pipeline guidance for invoices, emails, forms, and contracts**

## Performance

- **Duration:** 5 minutes
- **Started:** 2026-03-19T17:55:05Z
- **Completed:** 2026-03-19T18:00:00Z (estimated)
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created comprehensive data extraction blueprint covering all document types (PDFs, emails, invoices, forms, contracts)
- Included Mermaid sequence diagram showing validation flow with human review branch
- Documented validation-first architecture with Zod schema patterns
- Provided platform-specific guidance for Claude vision, Bedrock Textract, OpenAI Frontier, Vertex Document AI
- Covered OCR pipeline patterns for scanned documents with quality checks
- Implementation checklist with PERT-style duration breakdown (Foundation/Build/Test/Deploy)
- Common mistakes section emphasizing validation, confidence scoring, and OCR quality

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data extraction blueprint MDX content** - `c6a36ff` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `content/blueprints/data-extraction.mdx` - Complete data extraction agent implementation blueprint with sequence diagram, validation patterns, OCR guidance, multi-page handling, confidence scoring, and document type-specific recommendations (394 lines)

## Decisions Made

**MDX angle bracket handling:** Discovered that `<20%` in MDX content causes parse error ("Unexpected character `2` before name"). MDX interprets `<` as start of JSX tag. Solution: Write "Less than 20%" instead of using angle brackets in prose.

**Validation-first emphasis:** Blueprint prioritizes schema definition (Zod) before extraction logic to prevent scope creep and enable automatic validation with confidence scoring.

**Confidence threshold recommendations:** Based on research, established three-tier system:
- 0.9+ = Auto-approve (high confidence)
- 0.7-0.9 = Automatic extraction, flag for spot-check review
- Below 0.7 = Queue for human review before database insert

**Platform recommendations:** Anthropic Claude and Amazon Bedrock highlighted as recommended platforms due to native PDF vision capabilities (Claude) and integrated Textract OCR (Bedrock), reducing preprocessing complexity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MDX parse error with angle bracket**
- **Found during:** Task 1 (Build verification)
- **Issue:** Line 276 contained `<20%` which MDX parser interpreted as JSX tag start, causing "Unexpected character `2` before name" error
- **Fix:** Changed `<20% human review rate` to `Less than 20% human review rate`
- **Files modified:** content/blueprints/data-extraction.mdx
- **Verification:** `npm run build` passed, blueprint included in `.velite/blueprints.json`
- **Committed in:** c6a36ff (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for build to pass. No scope change, just syntax correction for MDX compatibility.

## Issues Encountered

**MDX parse error diagnosis:** Initial build error message "Unexpected character `2` before name" was cryptic. Required systematic investigation to identify that angle bracket in prose text was being interpreted as JSX. Lesson: Always avoid `<` and `>` symbols in MDX content outside of actual JSX/HTML tags.

**Mermaid import syntax:** Initially added explicit import statement for Mermaid component, but mdx-mermaid plugin provides it globally via remark plugin configuration. Customer-support blueprint imports explicitly (`import Mermaid from 'mdx-mermaid'`) which works but isn't required by plugin. Both approaches functional.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for additional blueprints:** Data extraction blueprint establishes patterns that can be reused for remaining blueprints in Phase 5:
- Mermaid sequence diagrams for architecture visualization
- Platform-specific callout sections
- Implementation checklist structure (Foundation/Build/Test/Deploy)
- Common mistakes and expected outcomes sections

**Content quality patterns validated:** Blueprint demonstrates substantive technical guidance:
- Specific code examples (Zod schemas with business rules)
- Quantitative thresholds (confidence scores, accuracy targets)
- Edge case handling (multi-page, OCR quality, handwritten text)
- Platform capabilities comparison (vision APIs, document analysis, OCR)

**No blockers for phase continuation:** Velite build successfully validates blueprint frontmatter against schema. Content renders correctly with Mermaid diagrams.

---
*Phase: 05-blueprint-library*
*Completed: 2026-03-19*
