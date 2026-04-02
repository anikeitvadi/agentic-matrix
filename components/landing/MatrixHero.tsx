'use client'

import { useRef, useEffect, useState } from 'react'

// ── Config ──────────────────────────────────────────────────────────────
const HIGHLIGHT_TEXT = 'AGENTIC DECISIONS'
const CHAR_SET = '01アイウエオカキクケコサシスセソタチツテト'
const FONT_SIZE = 13
const FONT = `${FONT_SIZE}px "IBM Plex Mono", "SF Mono", monospace`
const COL_WIDTH = 16
const DROP_SPEED_MIN = 1.5
const DROP_SPEED_MAX = 4
const SPAWN_CHANCE = 0.008 // low density
const MAX_DROPS = 120 // hard cap for performance
const TRAIL_LENGTH = 12
const HEADLINE_FONT_SIZE = 36
const HEADLINE_FONT = `bold ${HEADLINE_FONT_SIZE}px "IBM Plex Mono", monospace`
const BOUNCE_SPREAD = 2.5 // how far particles spread on bounce
const GRAVITY = 0.12

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

type TextBBox = {
  x: number
  y: number
  w: number
  h: number
  charBoxes: { x: number; y: number; w: number }[]
}

export default function MatrixHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropsRef = useRef<Drop[]>([])
  const textRef = useRef<TextBBox | null>(null)
  const frameRef = useRef(0)
  const mouseRef = useRef({ x: -1, y: -1 })
  const dimsRef = useRef({ w: 0, h: 0 })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = container!.getBoundingClientRect()
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      canvas!.style.width = `${rect.width}px`
      canvas!.style.height = `${rect.height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      dimsRef.current = { w: rect.width, h: rect.height }

      // Measure headline text bounding box
      ctx!.font = HEADLINE_FONT
      const textW = ctx!.measureText(HIGHLIGHT_TEXT).width
      const textX = (rect.width - textW) / 2
      const textY = rect.height * 0.45

      // Measure individual characters for the umbrella collision
      const charBoxes: TextBBox['charBoxes'] = []
      let cx = textX
      for (const ch of HIGHLIGHT_TEXT) {
        const cw = ctx!.measureText(ch).width
        charBoxes.push({ x: cx, y: textY - HEADLINE_FONT_SIZE, w: cw })
        cx += cw
      }

      textRef.current = {
        x: textX,
        y: textY,
        w: textW,
        h: HEADLINE_FONT_SIZE * 1.2,
        charBoxes,
      }

      dropsRef.current = []
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() {
      mouseRef.current = { x: -1, y: -1 }
    }

    document.fonts.ready.then(() => {
      resize()
      setReady(true)
    })

    window.addEventListener('resize', resize)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)
    return () => {
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true

    function animate() {
      if (!running) return
      const { w, h } = dimsRef.current
      const drops = dropsRef.current
      const textBB = textRef.current
      const mouse = mouseRef.current

      // Clear
      ctx!.clearRect(0, 0, w, h)

      // Background
      ctx!.fillStyle = '#06060a'
      ctx!.fillRect(0, 0, w, h)

      // Subtle center glow
      const grad = ctx!.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.4)
      grad.addColorStop(0, 'rgba(15, 118, 110, 0.04)')
      grad.addColorStop(1, 'transparent')
      ctx!.fillStyle = grad
      ctx!.fillRect(0, 0, w, h)

      // Spawn new drops (sparse rain)
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
              alpha: 0.4 + Math.random() * 0.6,
              bounced: false,
              trail: [],
            })
          }
        }
      }

      // Update drops
      ctx!.font = FONT
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]

        // Save trail
        d.trail.unshift({ x: d.x, y: d.y, char: d.char, alpha: d.alpha * 0.5 })
        if (d.trail.length > TRAIL_LENGTH) d.trail.pop()

        // Physics
        d.vy += GRAVITY
        d.y += d.vy
        d.x += d.vx
        d.vx *= 0.98 // air friction on horizontal

        // Randomly change character
        if (Math.random() < 0.02) {
          d.char = CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)]
        }

        // ── Umbrella collision ──
        if (textBB && !d.bounced) {
          const textTop = textBB.y - HEADLINE_FONT_SIZE
          const textBottom = textBB.y + 4
          // Check if drop is hitting the text bounding box from above
          if (
            d.y >= textTop - 2 &&
            d.y <= textBottom &&
            d.x >= textBB.x - 8 &&
            d.x <= textBB.x + textBB.w + 8
          ) {
            // Bounce! Deflect sideways
            d.bounced = true
            d.vy = -Math.abs(d.vy) * 0.2 // slight upward bounce
            // Deflect left or right based on position relative to center
            const center = textBB.x + textBB.w / 2
            const side = d.x < center ? -1 : 1
            d.vx = side * (BOUNCE_SPREAD + Math.random() * 2)
            d.alpha *= 0.8
          }
        }

        // After bounce, gravity pulls them back down
        if (d.bounced) {
          d.alpha *= 0.985
        }

        // Mouse glow proximity
        let glow = 0
        if (mouse.x > 0) {
          const dx = d.x - mouse.x
          const dy = d.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          glow = Math.max(0, 1 - dist / 100)
        }

        // ── Draw trail ──
        for (let t = 0; t < d.trail.length; t++) {
          const tr = d.trail[t]
          const ta = tr.alpha * (1 - t / d.trail.length) * 0.4
          if (ta < 0.01) continue
          const g = Math.floor(60 + ta * 80)
          ctx!.fillStyle = `rgba(20, ${g}, 40, ${ta})`
          ctx!.fillText(tr.char, tr.x, tr.y)
        }

        // ── Draw head ──
        if (d.alpha < 0.01) {
          drops.splice(i, 1)
          continue
        }
        if (d.y > h + 20 || d.x < -20 || d.x > w + 20) {
          drops.splice(i, 1)
          continue
        }

        const a = Math.min(1, d.alpha + glow * 0.4)
        if (d.bounced) {
          // Bounced drops glow brighter momentarily
          ctx!.fillStyle = `rgba(100, 220, 200, ${a * 0.9})`
        } else if (glow > 0.2) {
          ctx!.fillStyle = `rgba(71, 180, 167, ${a})`
        } else {
          ctx!.fillStyle = `rgba(50, ${Math.floor(140 + d.alpha * 60)}, 80, ${a * 0.7})`
        }
        ctx!.fillText(d.char, d.x, d.y)
      }

      // ── Draw headline text ──
      if (textBB) {
        // Glow behind text
        ctx!.font = HEADLINE_FONT
        ctx!.fillStyle = 'rgba(15, 118, 110, 0.15)'
        ctx!.fillText(HIGHLIGHT_TEXT, textBB.x, textBB.y + 1)
        ctx!.fillText(HIGHLIGHT_TEXT, textBB.x, textBB.y - 1)

        // Main text
        ctx!.fillStyle = 'rgba(200, 255, 240, 0.95)'
        ctx!.fillText(HIGHLIGHT_TEXT, textBB.x, textBB.y)
      }

      // ── Subtitle ──
      ctx!.font = '14px Manrope, sans-serif'
      const sub1 = `Compare ${19} AI agent platforms with transparent scoring`
      const sub2 = 'Real pricing · Exportable decisions · Vendor-neutral'
      const sub1W = ctx!.measureText(sub1).width
      const sub2W = ctx!.measureText(sub2).width
      const subY = (textBB?.y ?? h * 0.45) + 32
      ctx!.fillStyle = 'rgba(140, 165, 160, 0.6)'
      ctx!.fillText(sub1, (w - sub1W) / 2, subY)
      ctx!.fillText(sub2, (w - sub2W) / 2, subY + 20)

      ctx!.font = FONT // reset

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
    }
  }, [ready])

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-crosshair overflow-hidden"
      style={{ height: 'min(520px, 65vh)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06060a] to-transparent" />
    </div>
  )
}
