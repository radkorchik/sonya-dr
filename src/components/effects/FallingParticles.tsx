import { useEffect, useRef } from 'react'
import { FALLING_STICKERS, getStickerImage, preloadStickers, stickerSrc } from '@/lib/stickers'

interface Particle {
  x: number
  y: number
  speed: number
  rot: number
  sway: number
  swayPhase: number
  size: number
  stickerIdx: number
}

const COUNT = 12

export function FallingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const ready = useRef(false)
  const reduced = useRef(false)
  const raf = useRef(0)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced.current) return

    let mounted = true
    preloadStickers(FALLING_STICKERS).then(() => {
      if (!mounted) return
      ready.current = true
    })

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    particles.current = Array.from({ length: COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.4 + Math.random() * 0.6,
      rot: Math.random() * 360,
      sway: 0.3 + Math.random() * 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      size: 22 + Math.random() * 14,
      stickerIdx: i % FALLING_STICKERS.length,
    }))

    let last = performance.now()
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2)
      last = now
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      for (const p of particles.current) {
        p.y += p.speed * dt
        p.swayPhase += 0.012 * dt
        p.x += Math.sin(p.swayPhase) * p.sway * dt
        p.rot += 0.15 * dt
        if (p.y > h + 30) {
          p.y = -30
          p.x = Math.random() * w
        }

        const key = FALLING_STICKERS[p.stickerIdx]
        const img = getStickerImage(key)
        if (img?.complete && img.naturalWidth) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rot * Math.PI) / 180)
          ctx.globalAlpha = 0.55
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size)
          ctx.restore()
        } else if (!ready.current) {
          // fallback dot while loading
          ctx.globalAlpha = 0.3
          ctx.fillStyle = '#FF9ABA'
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)

    // preload via Image if cache miss
    FALLING_STICKERS.forEach(key => {
      const img = new Image()
      img.src = stickerSrc(key)
    })

    return () => {
      mounted = false
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  if (reduced.current) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform', contain: 'strict' }}
      aria-hidden
    />
  )
}
