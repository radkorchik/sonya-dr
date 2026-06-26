import { useEffect, useRef } from 'react'
import { stickerSrc } from '@/lib/stickers'

const HEARTS = ['laceHeart', 'pearlHeart'] as const

export function HeartBurst({ trigger }: { trigger: number }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (trigger === 0 || !containerRef.current) return
    const el = containerRef.current
    el.innerHTML = ''
    for (let i = 0; i < 5; i++) {
      const img = document.createElement('img')
      img.src = stickerSrc(HEARTS[i % 2])
      img.className = 'absolute w-5 h-5 object-contain pointer-events-none'
      img.style.left = '50%'
      img.style.top = '50%'
      img.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 80 - 20}px)`
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.6s, transform 0.6s'
      el.appendChild(img)
      requestAnimationFrame(() => {
        img.style.opacity = '1'
        img.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100 - 40}px) scale(1.2)`
        setTimeout(() => { img.style.opacity = '0' }, 400)
      })
    }
    const t = setTimeout(() => { el.innerHTML = '' }, 700)
    return () => clearTimeout(t)
  }, [trigger])

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
}
