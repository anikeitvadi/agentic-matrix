'use client'

import { useRef, useEffect, useState } from 'react'

/**
 * Shimmer Logo — "AGENTIC MATRIX" rendered with subtle character shimmer.
 * Each character periodically shifts between typographic variants
 * (weight/style) creating a gentle living texture. Inspired by the
 * variable-typographic-ascii Pretext demo but restrained for navigation.
 */

const LOGO_TEXT = 'AGENTIC MATRIX'
const FONT_SIZE = 18
const CHAR_WIDTH = 12
const LINE_HEIGHT = 22
const SHIMMER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:+=-~'

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
    const w = LOGO_TEXT.length * CHAR_WIDTH + 4
    const h = LINE_HEIGHT + 2

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Precompute character brightness values for shimmer effect
    const fonts = [
      `${FONT_SIZE}px "JetBrains Mono", "SF Mono", monospace`,
      `italic ${FONT_SIZE}px "JetBrains Mono", "SF Mono", monospace`,
      `bold ${FONT_SIZE}px "JetBrains Mono", "SF Mono", monospace`,
    ]

    let running = true
    let tick = 0

    function animate() {
      if (!running) return
      tick++

      ctx!.clearRect(0, 0, w, h)

      for (let i = 0; i < LOGO_TEXT.length; i++) {
        const char = LOGO_TEXT[i]
        if (char === ' ') continue

        const x = i * CHAR_WIDTH + 2
        const y = FONT_SIZE

        // Each character has its own phase offset for organic shimmer
        const phase = (tick * 0.02 + i * 0.7) % (Math.PI * 2)
        const shimmerAmount = Math.sin(phase) * 0.5 + 0.5 // 0-1

        // Occasionally glitch a character to a random one
        const glitchChance = Math.sin(tick * 0.005 + i * 1.3)
        const isGlitching = glitchChance > 0.97

        // Pick font variant based on shimmer phase
        const fontIdx = shimmerAmount > 0.7 ? 2 : shimmerAmount > 0.3 ? 0 : 1
        ctx!.font = fonts[fontIdx]

        // Color: teal with varying brightness
        const brightness = 140 + Math.floor(shimmerAmount * 80) // 140-220
        const alpha = 0.7 + shimmerAmount * 0.3 // 0.7-1.0

        if (isGlitching) {
          // Brief glitch: random character from shimmer set
          const glitchChar = SHIMMER_CHARS[Math.floor(Math.random() * SHIMMER_CHARS.length)]
          ctx!.fillStyle = `rgba(71, 180, 167, ${alpha * 0.5})`
          ctx!.fillText(glitchChar, x, y)
        } else {
          ctx!.fillStyle = `rgba(${brightness}, ${Math.min(255, brightness + 40)}, ${Math.min(255, brightness + 20)}, ${alpha})`
          ctx!.fillText(char, x, y)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    // Run at ~20fps for subtle effect, not 60fps
    let lastFrame = 0
    function throttledAnimate(time: number) {
      if (!running) return
      if (time - lastFrame > 50) { // ~20fps
        lastFrame = time
        tick++

        ctx!.clearRect(0, 0, w, h)

        for (let i = 0; i < LOGO_TEXT.length; i++) {
          const char = LOGO_TEXT[i]
          if (char === ' ') continue

          const x = i * CHAR_WIDTH + 2
          const y = FONT_SIZE

          const phase = (tick * 0.03 + i * 0.8) % (Math.PI * 2)
          const shimmer = Math.sin(phase) * 0.5 + 0.5

          const glitch = Math.sin(tick * 0.007 + i * 1.5) > 0.96

          const fontIdx = shimmer > 0.7 ? 2 : shimmer > 0.4 ? 0 : 1
          ctx!.font = fonts[fontIdx]

          const b = 160 + Math.floor(shimmer * 60)
          const a = 0.75 + shimmer * 0.25

          if (glitch) {
            const gc = SHIMMER_CHARS[Math.floor(Math.random() * SHIMMER_CHARS.length)]
            ctx!.fillStyle = `rgba(71, 180, 167, ${a * 0.4})`
            ctx!.fillText(gc, x, y)
          } else {
            ctx!.fillStyle = `rgba(${b}, ${Math.min(255, b + 50)}, ${Math.min(255, b + 30)}, ${a})`
            ctx!.fillText(char, x, y)
          }
        }
      }
      frameRef.current = requestAnimationFrame(throttledAnimate)
    }

    frameRef.current = requestAnimationFrame(throttledAnimate)

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
      {/* Fallback before canvas ready */}
      {!ready && (
        <div className="font-mono text-lg font-bold text-neutral-300">AGENTIC MATRIX</div>
      )}
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        Decision Toolkit
      </div>
    </div>
  )
}
