# UI Improvements Plan

> Comprehensive audit of every page in Agentic Decisions with specific, actionable fixes.
> Each issue is tagged **Critical**, **High**, or **Medium**.

---

## 1. Landing Page (`app/page.tsx`)

### 1.1 Hero Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1.1a | Hero subtitle still says "Compare **11** platforms" — stale copy since we now have 19 | **Critical** | Update metadata description AND the `<p>` to read "Compare 19 platforms across 4 tiers" (or make it dynamic from `platforms.length`) |
| 1.1b | Hero gradient (`from-brand-50 to-transparent`) is extremely subtle — feels like a plain white page with no visual punch | **High** | Increase gradient intensity: `from-brand-100/60 to-transparent` and extend height from `h-80` to `h-96`. Alternatively, add a subtle dot-grid or radial gradient pattern behind the hero for visual texture |
| 1.1c | The `text-neutral-500` subtitle is too washed out for the primary selling copy | **High** | Change to `text-neutral-600` for the subtitle `<p>` — maintains hierarchy but is legible |
| 1.1d | "Start Assessment" CTA button is the same visual weight as "Browse Platforms" — the primary action doesn't stand out enough | **High** | Make primary CTA larger: `px-8 py-3.5 text-lg` and add `shadow-lg shadow-brand-600/25`. Keep secondary as-is. The size contrast creates clear hierarchy |
| 1.1e | No social proof or credibility signal anywhere on the page (e.g., "19 platforms analyzed", "4 pricing models compared") | **Medium** | Add a small stats strip between hero and value props: `<div className="flex justify-center gap-8 text-sm text-neutral-500 mb-12">` with 3 stats like "19 Platforms", "4 Tiers", "Transparent Scoring" |

### 1.2 Value Props Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1.2a | Cards use `bg-white` on a `bg-neutral-50` body — almost no contrast, cards don't "lift" | **High** | Add `shadow-sm` to each card. Change to `bg-white/80 backdrop-blur-sm` or simply add `shadow-sm hover:shadow-md transition-shadow` |
| 1.2b | The icon container `w-10 h-10` is visually small — doesn't command attention | **Medium** | Increase to `w-12 h-12` and icon to `w-7 h-7` for better visual weight |
| 1.2c | Gap between hero and value props is too tight — `pb-20` on hero but no `pt` on value props creates visual crowding | **Medium** | Add `pt-4` to the value props section or increase hero `pb` to `pb-24` |

### 1.3 "How It Works" Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1.3a | The dark section (`bg-neutral-900`) is good for contrast but the step circles are isolated — no visual flow connects steps 1 → 2 → 3 | **High** | Add a horizontal connector line between steps. Between each step circle, render a `<div className="hidden md:block w-full h-0.5 bg-neutral-700 -mt-5 mx-4" />` similar to the StepIndicator pattern |
| 1.3b | No CTA at the bottom of this section — user reads "how it works" then has to scroll to find the button | **Medium** | Add a small CTA link below the grid: `<Link href="/assessment" className="mt-10 inline-flex items-center text-brand-400 hover:text-brand-300 font-medium text-sm">Start now →</Link>` centered |

### 1.4 Footer CTA Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1.4a | This section is fine structurally but identical in styling to the hero CTA — feels repetitive | **Medium** | Differentiate with a subtle background: `bg-brand-50/50 rounded-2xl` wrapper inside the section to create a "card CTA" feel, or add a thin top border `border-t border-neutral-200` |

---

## 2. Platforms Listing (`app/platforms/page.tsx`)

### 2.1 Layout & Scaling

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 2.1a | With 19 platforms across 4 tiers, the page is long but scannable — the tier groupings work well | -- | No fix needed — architecture is sound |
| 2.1b | Page header still says "Compare {platforms.length} platforms" which is good (dynamic), but `max-w-7xl` with sidebar means content is very wide on ultrawide monitors | **Medium** | Consider `max-w-6xl` for better line length, or keep `max-w-7xl` but ensure card grid stays at `xl:grid-cols-3` (currently correct) |
| 2.1c | No sticky header or jump-to-tier navigation — user must scroll through all sections | **Medium** | Add a small horizontal tier nav strip below the stats row: `<div className="flex gap-2 mb-6">` with anchor links styled as pills using each tier's `badge` classes from `tierMeta` |

### 2.2 Tier Sections

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 2.2a | Tier section headers are minimal — just a dot + label + count. They don't visually separate tiers strongly enough when scrolling 19 cards | **High** | Add a subtle background band behind each tier heading: wrap the section header `<div>` in a `<div className="bg-neutral-100/50 -mx-8 px-8 py-3 rounded-lg mb-4">` or add a left border accent using the tier color: `border-l-3 ${meta.dot.replace('bg-', 'border-')} pl-3` |
| 2.2b | The count badge `text-sm text-neutral-400` is too subtle | **Medium** | Change to `text-sm text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full` to make it a mini pill |

### 2.3 Platform Cards (`components/platform/PlatformCard.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 2.3a | Cards are scannable with tier badge, title, description, capabilities, and pricing — good structure | -- | No fix needed |
| 2.3b | The tier badge comes before the title on the same line, which means the title gets `truncate` and may clip on long names like "Microsoft Azure AI Agent Service" | **High** | Move the tier badge above the title as its own row: `<div className="mb-1.5">` for badge, then `<h3>` below. This gives the title the full card width |
| 2.3c | Capability tags use generic `bg-neutral-100 text-neutral-600` — no tier-color connection | **Medium** | Use `meta.capabilityBadge` from tierMeta instead of generic neutral: `className={meta.capabilityBadge + " px-2 py-0.5 text-xs rounded"}`. This ties card content to tier identity |
| 2.3d | The `+N more` overflow badge has no background — looks like loose text | **Medium** | Add `bg-neutral-50 border border-neutral-200` to the overflow span |

### 2.4 Assessment CTA Banner

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 2.4a | The banner is understated and easy to miss — it's the same visual weight as a notification | **Medium** | Make slightly more prominent: increase padding to `p-4`, make text `text-base`, and add `shadow-sm` |

---

## 3. Platform Detail (`app/platforms/[slug]/page.tsx`)

### 3.1 Layout

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 3.1a | `max-w-4xl` with no `mx-auto` — content hugs the left side on wide screens | **Critical** | Add `mx-auto` to the wrapper: `<div className="p-8 max-w-4xl mx-auto">` |
| 3.1b | Breadcrumb is fine but uses a bare chevron — could be more scannable | **Medium** | Add "All Platforms" text or make it a pill: `<span className="px-2 py-1 bg-neutral-100 rounded-md text-sm">` wrapping the link |

### 3.2 Pricing Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 3.2a | The "Pricing" header uses `text-sm font-medium` — too small for the most important section on a platform page | **High** | Change to `text-base font-semibold` or `text-lg font-semibold` and add a small dollar icon before it |
| 3.2b | The pricing model badge in the header row uses the tier badge colors (`meta.badge`), not pricing-specific colors — confusing since tier and pricing model are different concepts | **High** | Create pricing model badges with distinct colors: pay-per-use=emerald, subscription=sky, per-conversation=amber, hybrid=violet (same as `PricingModelBadge` in `PlatformCostCard.tsx`). Extract that component to a shared location and reuse it here |
| 3.2c | Token pricing table works well for multi-variant platforms | -- | No fix needed |
| 3.2d | Subscription tiers grid cards have no visual hierarchy between plans | **Medium** | Highlight the most common/recommended plan or add a subtle gradient to the most expensive plan. At minimum, add `hover:border-neutral-300 transition-colors` |

### 3.3 Capabilities

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 3.3a | Capabilities render as a flat list of pills — no grouping or categorization | **Medium** | Not a quick fix, but consider grouping into categories (Integration, Security, Features) if data supports it. Short-term: the current flat list is fine for up to ~10 capabilities |
| 3.3b | The "Capabilities" header is `text-sm` — same issue as Pricing header | **Medium** | Change to `text-base font-semibold` for consistency |

### 3.4 Overview Prose

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 3.4a | Uses `dangerouslySetInnerHTML` with Velite-compiled HTML — works but prose styling is good | -- | No fix needed |
| 3.4b | "Overview" header also `text-sm` — entire page has undersized section headers | **Medium** | Unify all section headers on this page to `text-base font-semibold text-neutral-900` |

### 3.5 Assessment CTA

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 3.5a | CTA at bottom is well-designed with personalized copy (`See how {platform.title} scores`) | -- | Works well |
| 3.5b | It appears after the overview — if the overview is long, users may never scroll to it | **Medium** | Consider duplicating as a sticky bottom bar on mobile: `<div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-neutral-200 p-3 z-30">` |

---

## 4. Blueprints Listing (`app/blueprints/page.tsx`)

### 4.1 Layout with 3 Blueprints

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 4.1a | 3 cards in an `xl:grid-cols-3` grid fills one row — looks fine on desktop but feels sparse | **High** | Two options: (A) Remove `xl:grid-cols-3` and use `lg:grid-cols-2` so cards are larger and more informative, or (B) add a "More blueprints coming soon" placeholder card as the 4th item with `border-dashed border-neutral-300 bg-neutral-50/50` |
| 4.1b | No hero illustration or visual interest — just header + cards | **Medium** | Add a subtle icon or illustration next to the header. At minimum, add a stats line: `<p className="text-sm text-neutral-400 mt-3">{blueprints.length} blueprints available</p>` |
| 4.1c | Cards have no icons — all three look identical at a glance until you read the title | **High** | Add a use-case icon to each card (e.g., headset for customer support, document for data extraction, gear for workflow automation). Use a `<div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">` pattern matching the landing page value props |

### 4.2 Blueprint Cards

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 4.2a | The complexity badge and platform count badge are informative | -- | Good |
| 4.2b | Build time is at the bottom in plain `text-xs text-neutral-500` — easy to miss | **Medium** | Put build time in a small badge or format as: `<span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">Build: {blueprint.estimatedDuration.build}</span>` |
| 4.2c | Cards have no hover lift effect to match platform cards | **Medium** | The `hover:shadow-md` is present via `hover:border-brand-500 hover:shadow-md` — good. Optionally add `hover:-translate-y-0.5 transition-all` for a subtle lift |

---

## 5. Blueprint Detail (`app/blueprints/[slug]/page.tsx`)

### 5.1 Layout

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 5.1a | Same issue as platform detail — `max-w-4xl` with no `mx-auto` | **Critical** | Add `mx-auto`: `<div className="p-8 max-w-4xl mx-auto">` |
| 5.1b | The metadata grid (Complexity, Foundation, Build Time, Test + Deploy) is well-structured | -- | Good |

### 5.2 MDX Content

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 5.2a | MDX rendering is currently broken (known issue in `BlueprintContent.tsx`) | **Critical** | This is tracked separately — the MDX runtime injection needs fixing |
| 5.2b | Prose styling is comprehensive and well-defined with proper h2/h3/h4 hierarchy | -- | Good when MDX works |
| 5.2c | Code blocks use `prose-pre:bg-neutral-900` which creates a very high-contrast dark block in an otherwise light page | **Medium** | This is actually good for code readability — keep as-is |

### 5.3 Applicable Platforms Section

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 5.3a | Recommended platforms get a brand highlight — good differentiation | -- | Good |
| 5.3b | The "(recommended)" text is plain — could be more visually distinct | **Medium** | Replace with a small star icon or use a separate pill: `<span className="ml-1 text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">Recommended</span>` |

---

## 6. Assessment Form (`app/assessment/`)

### 6.1 Step Indicator (`StepIndicator.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 6.1a | Step indicator is well-built with gradient badges, glow ring on current step, and connector lines | -- | Good |
| 6.1b | On mobile (< 640px), step labels may crowd — 4 labels across a narrow screen | **High** | Add `hidden sm:block` to the step labels and show only the step number on mobile. Or abbreviate labels on small screens |
| 6.1c | Connector line has `-mt-6` which is a magic number — fragile if step circle size changes | **Medium** | Consider using absolute positioning or flexbox alignment instead of negative margin |

### 6.2 Assessment Form (`AssessmentForm.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 6.2a | Form card uses `border-t-2 border-t-brand-500` — a nice accent but the `border border-neutral-200` base border creates a double-border illusion at the top | **Medium** | Remove the base `border-t` by using `border-x border-b border-neutral-200 border-t-2 border-t-brand-500` or apply `border-t-brand-500` as an override which it already does in Tailwind v4 |
| 6.2b | "Step X of Y" counter is at the bottom left — easy to miss since attention is on the "Next" button at the right | **Medium** | Move step counter to center: `<span className="text-sm text-neutral-400 absolute left-1/2 -translate-x-1/2">` or keep it but bump to `text-neutral-500` |
| 6.2c | The "Back" button and step counter share the left zone — can look cramped | **Medium** | Add `min-w-[100px]` to the left container so spacing is consistent whether Back is visible or not |

### 6.3 Question Fields (`QuestionStep.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 6.3a | Radio and checkbox options use `has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50` — excellent modern CSS, works in all modern browsers | -- | Good |
| 6.3b | The label `text-sm font-medium` has no explicit color — inherits body `text-neutral-900` which is fine | -- | Good |
| 6.3c | Error messages use `text-red-500` which is good, but no error icon | **Medium** | Add an inline error icon: `<span className="inline-flex items-center gap-1"><svg className="w-4 h-4">...</svg>{errorMessage}</span>` |
| 6.3d | Select dropdown styling doesn't include an explicit arrow — relies on browser default | **Medium** | Add `appearance-none` and a custom chevron via background-image or a trailing icon |
| 6.3e | Text input and select have slightly different visual weight — text input has `placeholder-neutral-400` while select has no placeholder styling | **Medium** | The default "Select an option" is `<option value="">` which renders in system font on some browsers. Add `className="text-neutral-400"` to the placeholder option using a `disabled` attribute pattern |

### 6.4 Validation & Submit

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 6.4a | Validation errors appear inline below each field — good pattern | -- | Good |
| 6.4b | The "Submit Assessment" button on the last step is larger (`px-8 py-3`) with a shadow — good differentiation from the "Next" button | -- | Good |
| 6.4c | No loading/disabled state on "Next" button during validation | **Medium** | Add `disabled:opacity-60 disabled:cursor-not-allowed` and consider briefly disabling during validation |

---

## 7. Results Page (`app/assessment/results/`)

### 7.1 Summary Dashboard (`ResultsContent.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.1a | 4-stat grid (Top Pick, Requirements Met, Platforms Compared, Score Spread) is clean and informative | -- | Good |
| 7.1b | "Your Results" heading is `text-2xl font-bold` — undersized for a page title given the wrapper has a `text-4xl` page header above it | **Medium** | Remove the redundant "Your Results" h1 inside ResultsContent since the page wrapper already has "Your Recommendations" as the h1. Or rename the inner one to "Summary" and make it `text-lg font-semibold uppercase tracking-wider text-neutral-500` as a section label |
| 7.1c | Section dividers use gradient lines with centered uppercase labels — elegant and consistent | -- | Good |

### 7.2 Platform Scores (`PlatformScores.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.2a | Hero card for #1 recommendation is well-designed with gradient background, badge, strengths/caveats grid | -- | Good |
| 7.2b | The hero score `text-4xl font-bold text-brand-600` competes with the platform name `text-xl font-semibold` — both demand attention | **Medium** | The score should be the visual anchor. Consider enclosing the score in a circular or rounded-square container: `<div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex flex-col items-center justify-center">` with score inside. This creates a clear visual hierarchy |
| 7.2c | Runner-up cards are `Link` wrappers going to `/platforms/{id}` — the entire card is clickable, which is good | -- | Good |
| 7.2d | Score bar on runner-ups is `hidden sm:block w-24` — on mobile only the number shows, which is fine | -- | Good |
| 7.2e | Checkmark "✓" and exclamation "!" are raw unicode characters — inconsistent with the SVG icon system used everywhere else | **Medium** | Replace with small SVG icons: `<svg className="w-4 h-4 text-emerald-600">` for check and `<svg className="w-4 h-4 text-amber-600">` for warning |

### 7.3 Decision Memo (`DecisionMemo.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.3a | The dark panel (`bg-neutral-950` for "What Would Change This Call") creates intentional high-contrast emphasis — this is a good design choice, not inconsistency | -- | Intentional — keep |
| 7.3b | The score badge `bg-neutral-950 px-4 py-3 text-white` inside the light card creates a strong focal point | -- | Good |
| 7.3c | "Why Not The Next Best Options" heading is `text-lg font-medium` while the main heading is `text-2xl font-semibold` — good hierarchy | -- | Good |
| 7.3d | The `lg:grid-cols-[1.4fr_1fr]` layout means the dark panel is narrower — on smaller lg screens this may feel cramped | **Medium** | Consider `lg:grid-cols-[1.3fr_1fr]` or `lg:grid-cols-2` for more breathing room in the dark panel |

### 7.4 AI Decision Brief (`AIDecisionBrief.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.4a | The "Generate Brief" button is on the right side of the header on desktop — discoverable, but could be missed if user scrolls quickly | **High** | Add a visual indicator that this is an interactive section: add a subtle pulsing dot or a gradient border to the card when brief hasn't been generated yet: `border-brand-200/50 hover:border-brand-300` and an animated `<span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse">` next to the button |
| 7.4b | Once generated, the two-column layout with Executive Summary, Recommendation, Tradeoffs on the left and Risk Checks, Questions, Next Step on the right is well-structured | -- | Good |
| 7.4c | The button text changes from "Generate Brief" to "Regenerate Brief" after first use — good UX | -- | Good |

### 7.5 Export Section (`DecisionPacketExport.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.5a | Three export buttons (Copy Markdown, Download Memo, Print/Save PDF) are clear | -- | Good |
| 7.5b | The three description cards at the bottom are informational but have no icons — they blend together | **Medium** | Add small icons to each card: clipboard for snapshot, scale for comparison, share for portability. Use `<div className="flex items-start gap-3">` pattern |
| 7.5c | Status message uses plain `text-neutral-500` — success and error states look the same | **High** | Color-code status: success = `text-emerald-600`, error = `text-red-600`, info = `text-neutral-500`. Parse the status text or use a status type enum |

### 7.6 Comparison Matrix (`ComparisonMatrix.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.6a | With 19 platforms, the table is long but sortable — the TanStack Table integration is well-done | -- | Good |
| 7.6b | On mobile, the table scrolls horizontally — `overflow-x-auto` is present | -- | Good |
| 7.6c | Column headers are small (`text-sm`) and the inline score bars are `w-16 h-1.5` — very thin and hard to read at a glance | **High** | Increase score bar width to `w-20 h-2` and add a background color on hover. Consider adding the numeric percentage as a tooltip or always showing it (currently shown via `tabular-nums` text which is good) |
| 7.6d | Platform name column has no minimum width — long names may wrap awkwardly | **Medium** | Add `min-w-[140px]` or `whitespace-nowrap` to the platform name cell |
| 7.6e | Alternating row colors (`bg-neutral-50/50`) are extremely subtle | **Medium** | Increase to `bg-neutral-100/50` for clearer zebra striping |

### 7.7 Cost Calculator (`CostCalculator.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.7a | Period selector (Monthly/Annual/3-Year TCO) is well-designed with active state gradient | -- | Good |
| 7.7b | The section header uses `border-l-4 border-brand-600 pl-4` — the only section on the page using this style, inconsistent with the centered divider pattern used for other sections | **High** | Remove the border-left accent and match other sections: use the same gradient divider + centered label pattern that the rest of ResultsContent uses |
| 7.7c | "Click any card to highlight its TCO projection" instruction is `text-xs text-neutral-500 mt-4 text-center` — easily missed | **Medium** | Move this hint to be an inline tooltip on the cards or make it more prominent: `text-sm text-neutral-600 bg-neutral-100 rounded-lg px-4 py-2 text-center` |

### 7.8 Platform Cost Cards (`PlatformCostCard.tsx`)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 7.8a | Cards are comprehensive with header, monthly cost, breakdown table, TCO, and engineering time | -- | Good |
| 7.8b | The recommended card ring (`ring-2 ring-brand-500/20`) is subtle — could be more visually distinct | **Medium** | Add a small "Recommended" ribbon or increase the ring: `ring-2 ring-brand-500/30` and add `shadow-brand-100` for a colored glow |
| 7.8c | The card is wrapped in a `<button>` for click-to-highlight interaction, but the entire card is a button — no visual affordance indicating it's clickable | **High** | Add `cursor-pointer hover:shadow-lg transition-shadow` to the card div. Consider adding a small "Click to compare" label or a subtle hover overlay |

---

## 8. Sidebar (`components/ui/Sidebar.tsx`)

### 8.1 Navigation

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 8.1a | Three nav items (Platforms, Blueprints, Assessment) with distinct icons — clear and scannable | -- | Good |
| 8.1b | Active state uses `bg-neutral-800 text-white` — sufficient contrast | -- | Good |
| 8.1c | The "Agentic" wordmark next to the logo uses `font-semibold text-white` — but the full product name is "Agentic Decisions". Consider showing the full name or just the icon | **Medium** | Either keep "Agentic" (fine for sidebar brevity) or add a subtitle: `<span className="text-xs text-neutral-400">Decisions</span>` below |
| 8.1d | No "Home" link in the nav items — the logo links home, but users may not discover this | **High** | Add a "Home" nav item at the top of `navItems` with a house icon, or make the active state on the logo more obvious when on the home page |
| 8.1e | The homepage (`/`) doesn't highlight any sidebar item — `pathname.startsWith(item.href)` won't match `/` since no nav item has `href="/"` | **High** | Related to 8.1d — add Home to nav items |

### 8.2 Mobile

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 8.2a | Mobile hamburger is `fixed top-3 left-3` — may overlap with page content on some pages (e.g., the assessment form) | **High** | Ensure all pages have enough top padding to clear the hamburger. Add `pt-14 md:pt-0` to the `<main>` element in `layout.tsx`, or use `mt-12 md:mt-0` on the main content area |
| 8.2b | Backdrop blur and slide animation work well | -- | Good |
| 8.2c | Close button is positioned `absolute top-3 right-3` — could be mistaken for another action | **Medium** | Make it a clear "X" with a label: add `sr-only` text "Close menu" (already has `aria-label` which is good) |

---

## 9. Cross-Cutting Issues

### 9.1 Typography

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 9.1a | The landing page uses `font-heading` for headings but other pages use plain `font-bold` — there is no `font-heading` definition in globals.css or Tailwind config visible. If `font-heading` maps to Inter (the only loaded font), this class is a no-op | **High** | Either define a `font-heading` in the theme (e.g., a display font like `Inter Tight` or `Plus Jakarta Sans`) or remove `font-heading` references for consistency. If keeping Inter for everything, remove the `font-heading` class to avoid confusion |
| 9.1b | Page titles vary: landing uses `text-4xl sm:text-5xl lg:text-6xl`, platform listing uses `text-3xl`, assessment uses `text-4xl sm:text-5xl`, results uses `text-4xl sm:text-5xl`. The listing pages feel smaller | **Medium** | Standardize: listing pages (Platforms, Blueprints) should use `text-3xl sm:text-4xl font-bold` and detail/assessment pages should use `text-3xl font-bold`. Only the landing hero should use `text-4xl+` |
| 9.1c | Section headings inside results components vary between `text-2xl font-semibold` and `text-2xl font-bold` | **Medium** | Standardize all section headings to `text-2xl font-semibold text-neutral-900` — currently inconsistent between DecisionMemo, PlatformScores, ComparisonMatrix, CostCalculator |

### 9.2 Color System

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 9.2a | Brand color (blue) is used consistently for CTAs, active states, and accents | -- | Good |
| 9.2b | Tier colors (blue, green, purple, orange) from `tierMeta` are used on the platforms listing and detail pages — well-implemented | -- | Good |
| 9.2c | The DecisionMemo dark panel (`bg-neutral-950`) is the only dark-on-light element outside the sidebar and "How It Works" section. This is intentional contrast and works well to emphasize "what would change the call" | -- | Intentional |
| 9.2d | Card backgrounds are inconsistent: some use `bg-white`, some use `bg-gradient-to-br from-white to-neutral-50`, some use `bg-white/80`. On the `bg-neutral-50` body, plain `bg-white` cards have minimal lift | **High** | Standardize: all content cards should use `bg-white` with `shadow-sm border border-neutral-200`. Interactive/highlighted cards should add `shadow-md` on hover. Hero/featured cards can use gradient backgrounds. Remove `bg-white/80` variants |

### 9.3 Spacing

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 9.3a | Listing pages use `p-8 max-w-7xl mx-auto` while detail pages use `p-8 max-w-4xl` (no `mx-auto`) — content shifts between pages | **Critical** | Add `mx-auto` to all detail page wrappers: `app/platforms/[slug]/page.tsx` and `app/blueprints/[slug]/page.tsx` |
| 9.3b | Assessment and results pages use `py-12 px-4` with `max-w-4xl mx-auto` (assessment) and `max-w-6xl mx-auto` (results) — different from listing pages' `p-8` | **Medium** | The assessment/results pages intentionally have a different feel (centered, more white space). This is acceptable but worth noting — if you want visual consistency, use `p-8` everywhere |
| 9.3c | Card padding varies: `p-4` (PlatformCard), `p-5` (detail page sections, blueprint cards), `p-6` (results components, DecisionMemo). No clear rule | **Medium** | Establish a convention: listing cards = `p-4`, section panels = `p-5`, feature cards/hero elements = `p-6`. Currently close to this but not explicit |

### 9.4 Interactive States

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 9.4a | Most buttons use `transition-colors` but some use `transition-[filter]` for the gradient hover brightness effect — this is fine, both approaches work | -- | Acceptable |
| 9.4b | No focus-visible ring styles defined globally — keyboard navigation may not show clear focus indicators on custom buttons | **High** | Add to all custom buttons: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2`. Consider a global style in CSS: `button:focus-visible, a:focus-visible { outline: 2px solid var(--color-brand-500); outline-offset: 2px; }` |
| 9.4c | Links inside the results page (platform names in ComparisonMatrix, DecisionMemo) use hover colors but no underline — could be unclear these are clickable | **Medium** | Add `hover:underline` or `underline-offset-2 decoration-brand-200 hover:decoration-brand-500` for subtle link indication |

### 9.5 Responsive Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 9.5a | Mobile hamburger button overlaps content on all pages — no padding offset on `<main>` | **High** | In `app/layout.tsx`, change `<main className="md:ml-56 min-h-screen">` to `<main className="md:ml-56 min-h-screen pt-14 md:pt-0">` to clear the fixed hamburger on mobile |
| 9.5b | Landing page hero works on mobile but the CTA buttons stack properly via `flex-col sm:flex-row` | -- | Good |
| 9.5c | ComparisonMatrix table on mobile: 7 columns in a horizontal scroll is functional but not ideal | **Medium** | Consider a card-based mobile view that shows each platform as a stacked card with all scores, toggled via a "Table / Cards" view switcher at the ComparisonMatrix level |
| 9.5d | PlatformCostCard grid uses `lg:grid-cols-2` — on tablet, cards are full-width which is fine | -- | Good |

---

## Priority Implementation Order

### Phase A: Critical Fixes (do first)
1. **9.3a** — Add `mx-auto` to platform and blueprint detail pages
2. **3.1a** — Same fix (platform detail `mx-auto`)
3. **5.1a** — Same fix (blueprint detail `mx-auto`)
4. **1.1a** — Update stale "11 platforms" copy to dynamic count
5. **9.5a** — Add `pt-14 md:pt-0` to main element for mobile hamburger clearance

### Phase B: High Impact Polish (do second)
1. **8.1d/8.1e** — Add Home nav item to sidebar
2. **1.1d** — Make primary CTA more prominent
3. **1.1b/1.1c** — Improve hero visual impact
4. **1.3a** — Add connector lines to "How It Works" steps
5. **2.2a** — Improve tier section headers
6. **2.3b** — Fix platform card title truncation
7. **4.1a/4.1c** — Improve blueprint listing (placeholder card + icons)
8. **6.1b** — Fix step indicator mobile crowding
9. **7.6c** — Improve comparison matrix score bars
10. **7.7b** — Fix cost calculator section header inconsistency
11. **7.8c** — Add click affordance to cost cards
12. **8.2a** — Fix mobile content overlap
13. **9.2d** — Standardize card background + shadow pattern
14. **9.4b** — Add focus-visible styles globally
15. **9.1a** — Resolve `font-heading` definition
16. **3.2a/3.2b** — Fix pricing section header size and badge colors
17. **7.4a** — Make AI Brief button more discoverable
18. **7.5c** — Color-code export status messages

### Phase C: Medium Polish (do last, time permitting)
- All remaining **Medium** items from each section
- These are nice-to-have improvements that won't hurt the experience if skipped

---

## Notes

- The overall design system is solid: consistent use of brand/neutral colors, good card patterns, proper responsive breakpoints.
- The biggest structural issues are the missing `mx-auto` on detail pages and the mobile hamburger overlap.
- The biggest visual issue is the landing page hero feeling too plain for a portfolio showcase piece.
- The DecisionMemo dark panel is an intentional design choice and should stay — it creates effective visual contrast for the "counterpoint" content.
- The assessment form UX is well-built with modern CSS features (`has-[:checked]`), form persistence, and clear validation patterns.
