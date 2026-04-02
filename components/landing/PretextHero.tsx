'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'

// ── Constants ────────────────────────────────────────────────────────────
const HEADLINE_TEXT =
  'Choose an AI agent platform with evidence, not vendor momentum.'
const BODY_TEXT =
  'Agentic Matrix helps enterprise teams compare AI agent platforms through transparent, ' +
  'deterministic scoring instead of vendor pitches. The assessment captures your constraints — ' +
  'budget, compliance, technical readiness, expected scale — then produces a weighted recommendation ' +
  'backed by an auditable methodology. Every score is explainable. Every tradeoff is surfaced. ' +
  'The result is a decision artifact your team can actually defend in an architecture review. ' +
  'Cost modeling uses PERT estimates grounded in real platform pricing, not aspirational vendor quotes. ' +
  'Implementation blueprints bridge the gap between evaluation and delivery, giving teams a concrete ' +
  'starting point rather than another slide deck. Whether you are evaluating OpenAI, Azure AI Foundry, ' +
  'Google Vertex AI, or AWS Bedrock, the comparison is structured around what matters to your organization — ' +
  'not what matters to the vendor. This is a decision support tool built for the people who have to live ' +
  'with the consequences of the platform choice.'

const HEADLINE_FONT_FAMILY = 'Newsreader, serif'
const BODY_FONT_FAMILY = 'Manrope, sans-serif'

const MOBILE_BREAKPOINT = 768
const COLUMN_GAP = 48

// Score card obstacle dimensions
const CARD_WIDTH = 164
const CARD_HEIGHT = 108
const CARD_PADDING = 24 // padding around card for text avoidance

type PositionedLine = {
  x: number
  y: number
  width: number
  text: string
  kind: 'headline' | 'body-left' | 'body-right'
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

type Interval = { left: number; right: number }

// ── Rectangular obstacle carving (simplified from wrap-geometry) ──────
function getRectIntervalForBand(
  rect: Rect,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number,
): Interval | null {
  if (bandBottom <= rect.y - vPad || bandTop >= rect.y + rect.height + vPad) {
    return null
  }
  return { left: rect.x - hPad, right: rect.x + rect.width + hPad }
}

function carveSlots(base: Interval, blocked: Interval[]): Interval[] {
  let slots: Interval[] = [base]
  for (const interval of blocked) {
    const next: Interval[] = []
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot)
        continue
      }
      if (interval.left > slot.left) next.push({ left: slot.left, right: interval.left })
      if (interval.right < slot.right) next.push({ left: interval.right, right: slot.right })
    }
    slots = next
  }
  return slots.filter((s) => s.right - s.left >= 30)
}

function layoutColumn(
  prepared: PreparedTextWithSegments,
  startCursor: LayoutCursor,
  regionX: number,
  regionY: number,
  regionWidth: number,
  regionHeight: number,
  lineHeight: number,
  obstacle: Rect | null,
  kind: 'body-left' | 'body-right',
): { lines: PositionedLine[]; cursor: LayoutCursor } {
  let cursor: LayoutCursor = startCursor
  let lineTop = regionY
  const lines: PositionedLine[] = []
  const bottom = regionY + regionHeight

  while (lineTop + lineHeight <= bottom) {
    const bandTop = lineTop
    const bandBottom = lineTop + lineHeight
    const blocked: Interval[] = []

    if (obstacle) {
      const interval = getRectIntervalForBand(
        obstacle,
        bandTop,
        bandBottom,
        CARD_PADDING,
        CARD_PADDING / 2,
      )
      if (interval) blocked.push(interval)
    }

    const slots = carveSlots({ left: regionX, right: regionX + regionWidth }, blocked)
    if (slots.length === 0) {
      lineTop += lineHeight
      continue
    }

    // Pick widest slot
    let slot = slots[0]!
    for (let i = 1; i < slots.length; i++) {
      const c = slots[i]!
      if (c.right - c.left > slot.right - slot.left) slot = c
    }

    const width = slot.right - slot.left
    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break

    lines.push({
      x: Math.round(slot.left),
      y: Math.round(lineTop),
      width: line.width,
      text: line.text,
      kind,
    })
    cursor = line.end
    lineTop += lineHeight
  }

  return { lines, cursor }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Component ────────────────────────────────────────────────────────────
export default function PretextHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const rafRef = useRef<number>(0)
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 })
  const [cardRotation, setCardRotation] = useState(0)
  const spinRef = useRef<{ from: number; to: number; start: number } | null>(null)

  // Mutable card rect used during layout computation (not read during render)
  const cardRectMut = useRef<Rect>({ x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT })

  // Dragging state
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const computeLayout = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerWidth = container.clientWidth
    const isMobile = containerWidth < MOBILE_BREAKPOINT

    const headlineFontSize = isMobile
      ? Math.max(28, Math.min(42, containerWidth * 0.065))
      : Math.max(36, Math.min(56, containerWidth * 0.05))
    const headlineLineHeight = Math.round(headlineFontSize * 1.08)
    const headlineFont = `700 ${headlineFontSize}px ${HEADLINE_FONT_FAMILY}`

    const bodyFontSize = isMobile ? 15 : 16.5
    const bodyLineHeight = Math.round(bodyFontSize * 1.7)
    const bodyFont = `400 ${bodyFontSize}px ${BODY_FONT_FAMILY}`

    const headlineWidth = isMobile
      ? containerWidth
      : Math.min(containerWidth, containerWidth * 0.75)

    // Lay out headline
    const preparedHeadline = prepareWithSegments(HEADLINE_TEXT, headlineFont)
    const headlineLines: PositionedLine[] = []
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = 0

    while (true) {
      const line = layoutNextLine(preparedHeadline, cursor, headlineWidth)
      if (line === null) break
      headlineLines.push({
        x: 0,
        y: Math.round(y),
        width: line.width,
        text: line.text,
        kind: 'headline',
      })
      cursor = line.end
      y += headlineLineHeight
    }

    const headlineBottom = y + 8

    // Position the score card obstacle
    const cardRect = cardRectMut.current
    if (!isDraggingRef.current) {
      if (isMobile) {
        cardRect.x = containerWidth - CARD_WIDTH - 8
        cardRect.y = headlineBottom + 16
      } else {
        cardRect.x = containerWidth - CARD_WIDTH - 24
        cardRect.y = headlineBottom + 40
      }
    }
    cardRect.width = CARD_WIDTH
    cardRect.height = CARD_HEIGHT

    // Body text layout
    const bodyTop = headlineBottom + (isMobile ? 24 : 40)
    const bodyHeight = isMobile ? 600 : 420
    const preparedBody = prepareWithSegments(BODY_TEXT, bodyFont)

    let bodyLines: PositionedLine[] = []

    if (isMobile) {
      const result = layoutColumn(
        preparedBody,
        { segmentIndex: 0, graphemeIndex: 0 },
        0,
        bodyTop,
        containerWidth,
        bodyHeight,
        bodyLineHeight,
        cardRect,
        'body-left',
      )
      bodyLines = result.lines
    } else {
      const colWidth = Math.floor((containerWidth - COLUMN_GAP) / 2)
      const leftResult = layoutColumn(
        preparedBody,
        { segmentIndex: 0, graphemeIndex: 0 },
        0,
        bodyTop,
        colWidth,
        bodyHeight,
        bodyLineHeight,
        cardRect,
        'body-left',
      )
      const rightResult = layoutColumn(
        preparedBody,
        leftResult.cursor,
        colWidth + COLUMN_GAP,
        bodyTop,
        colWidth,
        bodyHeight,
        bodyLineHeight,
        cardRect,
        'body-right',
      )
      bodyLines = [...leftResult.lines, ...rightResult.lines]
    }

    const allLines = [...headlineLines, ...bodyLines]

    // Calculate total height
    let maxY = 0
    for (const line of allLines) {
      const bottom = line.kind === 'headline' ? line.y + headlineLineHeight : line.y + bodyLineHeight
      if (bottom > maxY) maxY = bottom
    }
    const cardBottom = cardRect.y + cardRect.height + CARD_PADDING
    if (cardBottom > maxY) maxY = cardBottom

    container.style.height = `${maxY + 32}px`

    // Project lines to DOM
    const lineContainer = container.querySelector('[data-lines]') as HTMLDivElement
    if (!lineContainer) return

    let html = ''
    for (const line of allLines) {
      const isHeadline = line.kind === 'headline'
      const font = isHeadline ? headlineFont : bodyFont
      const lh = isHeadline ? headlineLineHeight : bodyLineHeight
      const color = isHeadline ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)'

      html += `<div style="position:absolute;left:${line.x}px;top:${line.y}px;font:${font};line-height:${lh}px;color:${color};white-space:nowrap;pointer-events:none">${escapeHtml(line.text)}</div>`
    }
    lineContainer.innerHTML = html

    // Sync card position state for rendering
    setCardPos({ x: cardRect.x, y: cardRect.y })
  }, [])

  // Handle card click for spin animation
  const handleCardClick = useCallback(() => {
    if (isDraggingRef.current) return
    const now = performance.now()
    spinRef.current = {
      from: 0,
      to: Math.PI * 2,
      start: now,
    }

    const animate = (time: number) => {
      const spin = spinRef.current
      if (!spin) return

      const progress = Math.min(1, (time - spin.start) / 800)
      const eased = 1 - Math.pow(1 - progress, 3)
      const angle = spin.from + (spin.to - spin.from) * eased
      setCardRotation(angle)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        spinRef.current = null
        setCardRotation(0)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  // Drag handlers for the score card
  const handleCardPointerDown = useCallback((e: React.PointerEvent) => {
    const card = e.currentTarget as HTMLElement
    card.setPointerCapture(e.pointerId)
    isDraggingRef.current = false
    const rect = cardRectMut.current
    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    dragOffsetRef.current = {
      x: e.clientX - bounds.left - rect.x,
      y: e.clientY - bounds.top - rect.y,
    }
  }, [])

  const handleCardPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const card = e.currentTarget as HTMLElement
      if (!card.hasPointerCapture(e.pointerId)) return

      isDraggingRef.current = true
      const container = containerRef.current
      if (!container) return

      const containerBounds = container.getBoundingClientRect()
      const newX = e.clientX - containerBounds.left - dragOffsetRef.current.x
      const newY = e.clientY - containerBounds.top - dragOffsetRef.current.y

      cardRectMut.current.x = Math.max(0, Math.min(newX, container.clientWidth - CARD_WIDTH))
      cardRectMut.current.y = Math.max(0, Math.min(newY, 600))

      computeLayout()
    },
    [computeLayout],
  )

  const handleCardPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const card = e.currentTarget as HTMLElement
      card.releasePointerCapture(e.pointerId)
      if (!isDraggingRef.current) {
        handleCardClick()
      }
      setTimeout(() => {
        isDraggingRef.current = false
      }, 0)
    },
    [handleCardClick],
  )

  // Initialize after fonts load
  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true
    document.fonts.ready.then(() => {
      if (!mounted) return
      setReady(true)
      computeLayout()
    })

    return () => {
      mounted = false
    }
  }, [computeLayout])

  // Resize handler
  useEffect(() => {
    if (!ready) return

    const onResize = () => {
      isDraggingRef.current = false
      computeLayout()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ready, computeLayout])

  // Re-layout when ready changes
  useEffect(() => {
    if (ready) {
      computeLayout()
    }
  }, [ready, computeLayout])

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: 480 }}
    >
      {/* SSR Fallback -- shown until Pretext initializes */}
      {!ready && (
        <div className="relative">
          <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-[56px]">
            {HEADLINE_TEXT}
          </h1>
          <div className="mt-10 columns-1 gap-12 text-base leading-7 text-neutral-600 md:columns-2">
            <p>{BODY_TEXT}</p>
          </div>
        </div>
      )}

      {/* Pretext-rendered lines */}
      <div
        data-lines=""
        className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Score card obstacle */}
      <div
        className={`absolute select-none transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: cardPos.x,
          top: cardPos.y,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `rotate(${cardRotation}rad)`,
          zIndex: 10,
          cursor: 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handleCardPointerDown}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerUp}
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center rounded-2xl"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(71,180,167,0.2), transparent 10rem), radial-gradient(circle at bottom left, rgba(59,130,246,0.14), transparent 8rem), linear-gradient(180deg, #18212f, #0f172a)',
            border: '1px solid rgba(128,208,197,0.18)',
            boxShadow: '0 28px 70px rgba(2,6,23,0.32)',
          }}
        >
          <div className="text-4xl font-bold text-white">89</div>
          <div
            className="mt-1 text-neutral-400"
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            weighted score
          </div>
          <div className="mt-2 text-xs font-semibold text-brand-300">
            OpenAI
          </div>
        </div>
      </div>

      {/* Drag hint */}
      {ready && (
        <div
          className="pointer-events-none absolute text-neutral-400 transition-opacity duration-1000"
          style={{
            left: cardPos.x + CARD_WIDTH / 2,
            top: cardPos.y + CARD_HEIGHT + 12,
            transform: 'translateX(-50%)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            zIndex: 11,
          }}
        >
          drag or click
        </div>
      )}
    </div>
  )
}
