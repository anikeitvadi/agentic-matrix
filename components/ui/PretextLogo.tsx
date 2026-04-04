'use client'

import { useRef, useEffect, useState } from 'react'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

/**
 * Pretext-powered monogram logo.
 * Uses Pretext's text measurement to render "AM" with pixel-perfect
 * typography on canvas — no DOM text rendering, no layout reflow.
 */
export function PretextLogo({ size = 40 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    document.fonts.ready.then(() => {
      setReady(true)
      renderLogo(canvas, size)
    })
  }, [size])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    renderLogo(canvas, size)
  }, [ready, size])

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      className="shrink-0"
      style={{ width: size, height: size }}
      aria-label="Agentic Matrix logo"
    />
  )
}

function renderLogo(canvas: HTMLCanvasElement, size: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = 2
  const w = size
  const h = size

  ctx.clearRect(0, 0, w * dpr, h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Background — rounded square with gradient
  const radius = size * 0.22
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, 'rgba(15, 118, 110, 0.9)')   // brand-600
  grad.addColorStop(1, 'rgba(17, 94, 89, 0.95)')     // brand-700

  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, radius)
  ctx.fillStyle = grad
  ctx.fill()

  // Subtle inner glow
  const innerGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.7)
  innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
  innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = innerGrad
  ctx.fill()

  // Use Pretext to measure and position "AM" precisely
  const fontSize = Math.round(size * 0.44)
  const font = `bold ${fontSize}px "Space Grotesk", system-ui, sans-serif`

  const prepared = prepareWithSegments('AM', font)
  const { lines } = layoutWithLines(prepared, w, fontSize * 1.2)

  if (lines.length > 0) {
    const line = lines[0]
    // Center horizontally and vertically
    const x = (w - line.width) / 2
    const y = (h + fontSize * 0.35) / 2 // visual center adjustment

    // Text shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.font = font
    ctx.fillText(line.text, x + 0.5, y + 0.5)

    // Main text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillText(line.text, x, y)
  }
}
