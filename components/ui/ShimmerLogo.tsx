'use client'

import { useRef, useEffect, useState } from 'react'

/**
 * Shimmer Logo — "AGENTIC MATRIX" with subtle living typography.
 * Characters shift weight/brightness and occasionally glitch.
 * Uses Space Grotesk to match the app's heading font.
 */

const LOGO_TEXT = 'AGENTIC MATRIX'
const FONT_SIZE = 17
const SHIMMER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:+=-~'

const FONTS = [
  `${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`,
  `italic ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`,
  `bold ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`,
]
const MEASURE_FONT = `bold ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`

export function ShimmerLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 2

    // Measure total text width with bold font (widest variant)
    ctx.font = MEASURE_FONT
    const totalWidth = ctx.measureText(LOGO_TEXT).width

    // Measure individual character positions
    const charPositions: number[] = []
    let x = 0
    for (let i = 0; i < LOGO_TEXT.length; i++) {
      charPositions.push(x)
      x += ctx.measureText(LOGO_TEXT[i]).width
    }

    const w = Math.ceil(totalWidth) + 4
    const h = FONT_SIZE + 6

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let running = true
    let tick = 0
    let lastFrame = 0

    function render(time: number) {
      if (!running) return
      if (time - lastFrame < 50) { // ~20fps
        frameRef.current = requestAnimationFrame(render)
        return
      }
      lastFrame = time
      tick++

      ctx!.clearRect(0, 0, w, h)

      for (let i = 0; i < LOGO_TEXT.length; i++) {
        const char = LOGO_TEXT[i]
        if (char === ' ') continue

        const cx = charPositions[i] + 2
        const cy = FONT_SIZE

        // Organic shimmer per character
        const phase = (tick * 0.03 + i * 0.8) % (Math.PI * 2)
        const shimmer = Math.sin(phase) * 0.5 + 0.5

        // Rare glitch
        const glitch = Math.sin(tick * 0.007 + i * 1.5) > 0.96

        // Font variant
        const fontIdx = shimmer > 0.7 ? 2 : shimmer > 0.4 ? 0 : 1
        ctx!.font = FONTS[fontIdx]

        const b = 160 + Math.floor(shimmer * 60)
        const a = 0.75 + shimmer * 0.25

        if (glitch) {
          const gc = SHIMMER_CHARS[Math.floor(Math.random() * SHIMMER_CHARS.length)]
          ctx!.fillStyle = `rgba(71, 180, 167, ${a * 0.4})`
          ctx!.fillText(gc, cx, cy)
        } else {
          ctx!.fillStyle = `rgba(${b}, ${Math.min(255, b + 50)}, ${Math.min(255, b + 30)}, ${a})`
          ctx!.fillText(char, cx, cy)
        }
      }

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
    }
  }, [ready])

  return (
    <div>
      <canvas
        ref={canvasRef}
        className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Agentic Matrix"
      />
      {!ready && (
        <div className="font-heading text-lg font-bold text-neutral-300">AGENTIC MATRIX</div>
      )}
      <div className="mt-1.5 font-heading text-xs uppercase tracking-[0.18em] text-neutral-500">
        Decision Toolkit
      </div>
    </div>
  )
}
