'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'

// ── Config ──────────────────────────────────────────────────────────────
const HEADLINE_TEXT =
  'Choose an AI agent platform with evidence, not vendor momentum.'
const BODY_TEXT =
  'Agentic Matrix helps enterprise teams compare AI agent platforms through transparent, ' +
  'deterministic scoring instead of vendor pitches. The assessment captures your constraints — ' +
  'budget, compliance, technical readiness, expected scale — then produces a weighted recommendation ' +
  'backed by an auditable methodology. Every score is explainable. Every tradeoff is surfaced. ' +
  'Cost modeling uses PERT estimates grounded in real platform pricing. ' +
  'Implementation blueprints bridge the gap between evaluation and delivery.'

const HEADLINE_FONT_FAMILY = '"Space Grotesk", system-ui, sans-serif'
const BODY_FONT_FAMILY = '"DM Sans", system-ui, sans-serif'

const MOBILE_BREAKPOINT = 768
const COLUMN_GAP = 48

// Score card obstacle
const CARD_WIDTH = 164
const CARD_HEIGHT = 108
const CARD_PADDING = 24

// Matrix rain config
const CHAR_SET = '01アイウエオカキクケコサシスセソ'
const RAIN_FONT_SIZE = 13
const RAIN_FONT = `${RAIN_FONT_SIZE}px "JetBrains Mono", "SF Mono", monospace`
const COL_WIDTH = 18
const DROP_SPEED_MIN = 1
const DROP_SPEED_MAX = 3
const SPAWN_CHANCE = 0.008
const MAX_DROPS = 140
const TRAIL_LENGTH = 10
const GRAVITY = 0.08

type PositionedLine = {
  x: number
  y: number
  width: number
  text: string
  kind: 'headline' | 'body-left' | 'body-right'
}

type Rect = { x: number; y: number; width: number; height: number }
type Interval = { left: number; right: number }

type Drop = {
  x: number
  y: number
  vy: number
  vx: number
  char: string
  alpha: number
  bounced: boolean
  trail: { x: number; y: number; char: string; alpha: number }[]
}

// ── Rectangular obstacle carving ────────────────────────────────────────
function getRectIntervalForBand(
  rect: Rect,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number,
): Interval | null {
  if (bandBottom <= rect.y - vPad || bandTop >= rect.y + rect.height + vPad) return null
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
      const interval = getRectIntervalForBand(obstacle, bandTop, bandBottom, CARD_PADDING, CARD_PADDING / 2)
      if (interval) blocked.push(interval)
    }

    const slots = carveSlots({ left: regionX, right: regionX + regionWidth }, blocked)
    if (slots.length === 0) {
      lineTop += lineHeight
      continue
    }

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
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Component ───────────────────────────────────────────────────────────
export default function HybridHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 })
  const [cardRotation, setCardRotation] = useState(0)
  const spinRef = useRef<{ from: number; to: number; start: number } | null>(null)
  const rafRef = useRef<number>(0)

  // Mutable card rect for layout computation
  const cardRectMut = useRef<Rect>({ x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT })

  // Drag state
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  // Matrix rain state
  const dropsRef = useRef<Drop[]>([])
  const dimsRef = useRef({ w: 0, h: 0 })
  const mouseRef = useRef({ x: -1, y: -1 })

  // ── Pretext layout ────────────────────────────────────────────────────
  const computeLayout = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerWidth = container.clientWidth
    const isMobile = containerWidth < MOBILE_BREAKPOINT

    const headlineFontSize = isMobile
      ? Math.max(28, Math.min(42, containerWidth * 0.065))
      : Math.max(36, Math.min(56, containerWidth * 0.05))
    const headlineLineHeight = Math.round(headlineFontSize * 1.1)
    const headlineFont = `700 ${headlineFontSize}px ${HEADLINE_FONT_FAMILY}`

    const bodyFontSize = isMobile ? 15 : 16.5
    const bodyLineHeight = Math.round(bodyFontSize * 1.7)
    const bodyFont = `400 ${bodyFontSize}px ${BODY_FONT_FAMILY}`

    const headlineWidth = isMobile ? containerWidth : Math.min(containerWidth, containerWidth * 0.75)

    // Headline
    const preparedHeadline = prepareWithSegments(HEADLINE_TEXT, headlineFont)
    const headlineLines: PositionedLine[] = []
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = 0

    while (true) {
      const line = layoutNextLine(preparedHeadline, cursor, headlineWidth)
      if (line === null) break
      headlineLines.push({ x: 0, y: Math.round(y), width: line.width, text: line.text, kind: 'headline' })
      cursor = line.end
      y += headlineLineHeight
    }

    const headlineBottom = y + 8

    // Position score card
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

    // Body
    const bodyTop = headlineBottom + (isMobile ? 24 : 40)
    const bodyHeight = isMobile ? 500 : 380
    const preparedBody = prepareWithSegments(BODY_TEXT, bodyFont)

    let bodyLines: PositionedLine[]

    if (isMobile) {
      const result = layoutColumn(
        preparedBody, { segmentIndex: 0, graphemeIndex: 0 },
        0, bodyTop, containerWidth, bodyHeight, bodyLineHeight, cardRect, 'body-left',
      )
      bodyLines = result.lines
    } else {
      const colWidth = Math.floor((containerWidth - COLUMN_GAP) / 2)
      const leftResult = layoutColumn(
        preparedBody, { segmentIndex: 0, graphemeIndex: 0 },
        0, bodyTop, colWidth, bodyHeight, bodyLineHeight, cardRect, 'body-left',
      )
      const rightResult = layoutColumn(
        preparedBody, leftResult.cursor,
        colWidth + COLUMN_GAP, bodyTop, colWidth, bodyHeight, bodyLineHeight, cardRect, 'body-right',
      )
      bodyLines = [...leftResult.lines, ...rightResult.lines]
    }

    const allLines = [...headlineLines, ...bodyLines]

    // Calculate height
    let maxY = 0
    for (const line of allLines) {
      const bottom = line.kind === 'headline' ? line.y + headlineLineHeight : line.y + bodyLineHeight
      if (bottom > maxY) maxY = bottom
    }
    const cardBottom = cardRect.y + cardRect.height + CARD_PADDING
    if (cardBottom > maxY) maxY = cardBottom

    container.style.height = `${maxY + 100}px`

    // Render to DOM
    const lineContainer = container.querySelector('[data-lines]') as HTMLDivElement
    if (!lineContainer) return

    let html = ''
    for (const line of allLines) {
      const isHeadline = line.kind === 'headline'
      const font = isHeadline ? headlineFont : bodyFont
      const lh = isHeadline ? headlineLineHeight : bodyLineHeight
      const color = isHeadline ? 'rgba(220, 240, 235, 0.95)' : 'rgba(148, 163, 184, 0.7)'
      const textShadow = isHeadline ? 'text-shadow:0 0 30px rgba(71,180,167,0.1)' : ''

      html += `<div style="position:absolute;left:${line.x}px;top:${line.y}px;font:${font};line-height:${lh}px;color:${color};white-space:nowrap;pointer-events:none;${textShadow}">${escapeHtml(line.text)}</div>`
    }
    lineContainer.innerHTML = html

    setCardPos({ x: cardRect.x, y: cardRect.y })
  }, [])

  // ── Matrix rain animation ─────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    let initTimeout: ReturnType<typeof setTimeout>

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1
      const w = container!.clientWidth
      const h = container!.clientHeight
      if (w === 0 || h === 0) return // Not laid out yet
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      dimsRef.current = { w, h }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() {
      mouseRef.current = { x: -1, y: -1 }
    }

    // Wait for Pretext layout to set the container height, then size the canvas
    function tryInit() {
      const h = container!.clientHeight
      if (h > 100) {
        resizeCanvas()
      } else {
        // Container not tall enough yet — retry
        initTimeout = setTimeout(tryInit, 30)
      }
    }
    tryInit()

    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(container)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    function animate() {
      if (!running) return
      const { w, h } = dimsRef.current
      const drops = dropsRef.current
      const mouse = mouseRef.current
      const cardRect = cardRectMut.current

      ctx!.clearRect(0, 0, w, h)

      // Spawn
      const cols = Math.floor(w / COL_WIDTH)
      if (drops.length < MAX_DROPS) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < SPAWN_CHANCE) {
            drops.push({
              x: c * COL_WIDTH + Math.random() * 4,
              y: -10 - Math.random() * 60,
              vy: DROP_SPEED_MIN + Math.random() * (DROP_SPEED_MAX - DROP_SPEED_MIN),
              vx: 0,
              char: CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)],
              alpha: 0.3 + Math.random() * 0.5,
              bounced: false,
              trail: [],
            })
          }
        }
      }

      ctx!.font = RAIN_FONT
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]

        // Trail
        d.trail.unshift({ x: d.x, y: d.y, char: d.char, alpha: d.alpha * 0.4 })
        if (d.trail.length > TRAIL_LENGTH) d.trail.pop()

        // Physics
        d.vy += GRAVITY
        d.y += d.vy
        d.x += d.vx
        d.vx *= 0.97

        if (Math.random() < 0.02) {
          d.char = CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)]
        }

        // Card collision
        if (!d.bounced && d.y >= cardRect.y - 4 && d.y <= cardRect.y + cardRect.height + 4 &&
            d.x >= cardRect.x - 8 && d.x <= cardRect.x + cardRect.width + 8) {
          d.bounced = true
          d.vy = -Math.abs(d.vy) * 0.3
          const center = cardRect.x + cardRect.width / 2
          d.vx = (d.x < center ? -1 : 1) * (2 + Math.random() * 2)
          d.alpha *= 0.8
        }

        if (d.bounced) d.alpha *= 0.985

        // Mouse glow
        let glow = 0
        if (mouse.x > 0) {
          const dx = d.x - mouse.x
          const dy = d.y - mouse.y
          glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 120)
        }

        // Draw trail
        for (let t = 0; t < d.trail.length; t++) {
          const tr = d.trail[t]
          const ta = tr.alpha * (1 - t / d.trail.length) * 0.3
          if (ta < 0.01) continue
          const g = Math.floor(60 + ta * 80)
          ctx!.fillStyle = `rgba(20, ${g}, 40, ${ta})`
          ctx!.fillText(tr.char, tr.x, tr.y)
        }

        // Draw head
        if (d.alpha < 0.01 || d.y > h + 20 || d.x < -20 || d.x > w + 20) {
          drops.splice(i, 1)
          continue
        }

        const a = Math.min(1, d.alpha + glow * 0.4)
        if (d.bounced) {
          ctx!.fillStyle = `rgba(100, 220, 200, ${a * 0.8})`
        } else if (glow > 0.2) {
          ctx!.fillStyle = `rgba(71, 180, 167, ${a * 0.9})`
        } else {
          ctx!.fillStyle = `rgba(50, ${Math.floor(140 + d.alpha * 60)}, 80, ${a * 0.7})`
        }
        ctx!.fillText(d.char, d.x, d.y)
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    return () => {
      running = false
      clearTimeout(initTimeout)
      observer.disconnect()
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [ready])

  // ── Card interactions ─────────────────────────────────────────────────
  const handleCardClick = useCallback(() => {
    if (isDraggingRef.current) return
    const now = performance.now()
    spinRef.current = { from: 0, to: Math.PI * 2, start: now }

    const animateSpin = (time: number) => {
      const spin = spinRef.current
      if (!spin) return
      const progress = Math.min(1, (time - spin.start) / 800)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCardRotation(spin.from + (spin.to - spin.from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animateSpin)
      } else {
        spinRef.current = null
        setCardRotation(0)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animateSpin)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const card = e.currentTarget as HTMLElement
      if (!card.hasPointerCapture(e.pointerId)) return

      isDraggingRef.current = true
      const container = containerRef.current
      if (!container) return

      const bounds = container.getBoundingClientRect()
      const newX = e.clientX - bounds.left - dragOffsetRef.current.x
      const newY = e.clientY - bounds.top - dragOffsetRef.current.y

      cardRectMut.current.x = Math.max(0, Math.min(newX, container.clientWidth - CARD_WIDTH))
      cardRectMut.current.y = Math.max(0, Math.min(newY, 600))

      computeLayout()
    },
    [computeLayout],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const card = e.currentTarget as HTMLElement
      card.releasePointerCapture(e.pointerId)
      if (!isDraggingRef.current) handleCardClick()
      setTimeout(() => { isDraggingRef.current = false }, 0)
    },
    [handleCardClick],
  )

  // ── Initialize ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    let mounted = true
    document.fonts.ready.then(() => {
      if (!mounted) return
      setReady(true)
      computeLayout()
    })
    return () => { mounted = false }
  }, [computeLayout])

  // Resize
  useEffect(() => {
    if (!ready) return
    const onResize = () => {
      isDraggingRef.current = false
      computeLayout()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ready, computeLayout])

  useEffect(() => {
    if (ready) computeLayout()
  }, [ready, computeLayout])

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-crosshair overflow-hidden"
      style={{ minHeight: 480 }}
    >
      {/* Matrix rain canvas (background) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Subtle center glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-brand-500/[0.03] blur-3xl" />

      {/* SSR Fallback */}
      {!ready && (
        <div className="relative px-1">
          <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight text-neutral-100 sm:text-5xl lg:text-[56px]">
            {HEADLINE_TEXT}
          </h1>
          <div className="mt-10 columns-1 gap-12 text-base leading-7 text-neutral-400 md:columns-2">
            <p>{BODY_TEXT}</p>
          </div>
        </div>
      )}

      {/* Pretext-rendered lines */}
      <div
        data-lines=""
        className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Draggable score card */}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="glow-border flex h-full w-full flex-col items-center justify-center rounded-2xl"
          style={{
            background: 'radial-gradient(circle at top right, rgba(71,180,167,0.15), transparent 10rem), radial-gradient(circle at bottom left, rgba(59,130,246,0.1), transparent 8rem), linear-gradient(180deg, rgba(15,23,42,0.9), rgba(10,15,30,0.95))',
            border: '1px solid rgba(71,180,167,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 20px rgba(71,180,167,0.08)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="text-4xl font-bold text-white neon-text">89</div>
          <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            weighted score
          </div>
          <div className="mt-2 font-heading text-xs font-semibold text-brand-300">
            OpenAI
          </div>
        </div>
      </div>

      {/* Drag hint */}
      {ready && (
        <div
          className="pointer-events-none absolute font-mono text-neutral-500 transition-opacity duration-[3s]"
          style={{
            left: cardPos.x + CARD_WIDTH / 2,
            top: cardPos.y + CARD_HEIGHT + 12,
            transform: 'translateX(-50%)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            zIndex: 11,
          }}
        >
          drag or click
        </div>
      )}

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0F1A] to-transparent" />
    </div>
  )
}
